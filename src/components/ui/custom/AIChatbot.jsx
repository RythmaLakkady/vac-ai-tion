import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { chatSession } from "@/service/AImodel";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

function AIChatbot({ trip, setTrip }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm WanderBot ✨. I have full control over your itinerary. Tell me what you'd like to change, and I'll update it live!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // ONLY send the itinerary to save thousands of tokens and avoid the 6000 TPM limit
      const itineraryOnly = trip?.tripData?.itinerary || {};
      const tripContext = JSON.stringify({ itinerary: itineraryOnly });
      
      const prompt = `You are an elite travel AI assistant for 'vac-ai-tion'. The user is viewing their trip itinerary. 
CURRENT ITINERARY JSON:
${tripContext}

USER REQUEST: "${userMsg.content}"

INSTRUCTIONS:
1. If the user asks a general question, just reply with helpful text.
2. If the user asks to modify the itinerary (e.g., add a day, remove a day, change an activity), generate a NEW JSON object containing ONLY the 'itinerary' key. Do not include flights or hotels.
3. If you are returning JSON, you MUST wrap it EXACTLY in a markdown JSON block (\`\`\`json { "itinerary": ... } \`\`\`). The JSON schema must perfectly match the CURRENT ITINERARY JSON. Include a conversational message before or after the JSON block.`;

      const result = await chatSession.sendMessage(prompt);
      const text = result?.response?.text() || "I'm having trouble processing that right now.";
      
      let finalMessage = text;
      let jsonString = null;

      // 1. Try to find JSON inside markdown blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
        // Remove the JSON block from the final message
        finalMessage = text.replace(/```(?:json)?\s*[\s\S]*?\s*```/i, '').trim();
      } else {
        // 2. Fallback: try to find the outermost curly braces if no markdown is used
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          jsonString = text.substring(startIdx, endIdx + 1);
          finalMessage = text.replace(jsonString, '').trim();
        }
      }

      if (jsonString) {
        try {
          const newPartialData = JSON.parse(jsonString);
          
          if (newPartialData && newPartialData.itinerary) {
            // Merge the new itinerary with the existing data (flights/hotels)
            const mergedTripData = {
              ...(trip?.tripData || {}),
              ...newPartialData
            };
            
            // Update Firestore only if we have a valid trip ID
            if (trip?.id) {
              const tripRef = doc(db, "UserTrips", trip.id);
              await updateDoc(tripRef, {
                tripData: mergedTripData
              });
            }

            // Update Local State
            if (setTrip) {
              setTrip(prev => ({
                ...prev,
                tripData: mergedTripData
              }));
            }

            if (!finalMessage) finalMessage = "✨ I have successfully updated your itinerary!";
          }
        } catch (err) {
          console.error("Failed to parse AI JSON update", err);
          // If JSON parsing fails, it means the model was cut off mid-generation (truncated due to max_tokens)
          // We MUST overwrite finalMessage here to prevent leaking broken JSON strings back to the user
          finalMessage = "I tried to update your itinerary, but the changes were so massive that I ran out of memory! Please try asking for smaller changes (like updating just one day).";
        }
      }
      
      if (!finalMessage) finalMessage = "I've processed your request!";
      
      setMessages(prev => [...prev, { role: 'assistant', content: finalMessage }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I lost connection to WanderBot. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const content = (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-holiday-teal to-holiday-coral text-white rounded-full shadow-2xl flex items-center justify-center z-[9999] hover:shadow-[0_0_40px_rgba(122,185,179,0.5)] transition-all"
          >
            <Sparkles className="w-10 h-10 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-[#fdfdfd]/95 backdrop-blur-2xl border border-gray-200 shadow-2xl rounded-3xl flex flex-col z-[9999] overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-holiday-dark text-white px-6 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-serif font-bold text-white text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-holiday-coral" /> WanderBot ✨
                  </h3>
                  <p className="text-holiday-sand text-xs tracking-wider uppercase">Live Itinerary Editor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-holiday-dark text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-md'
                  }`}>
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-holiday-coral" />
                          <span className="text-xs font-bold text-holiday-dark tracking-widest uppercase">
                            WanderBot ✨
                          </span>
                        </div>
                    )}
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-holiday-teal animate-spin" />
                    <span className="text-gray-500 font-medium text-xs">Re-calculating...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="e.g. 'Change Day 2 to focus on food'"
                  className="w-full bg-gray-50 border-2 border-gray-100 hover:border-holiday-teal/30 focus:border-holiday-teal rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-holiday-teal/10 transition-all placeholder:text-gray-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-gradient-to-r from-holiday-teal to-holiday-coral text-white rounded-full shadow-md disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest">
                Modifications auto-save to itinerary
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(content, document.body);
}

export default AIChatbot;
