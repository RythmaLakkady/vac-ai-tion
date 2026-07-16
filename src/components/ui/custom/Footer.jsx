import React, { useState } from 'react';
import { Mail, Heart, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.target);
    try {
      const response = await fetch("https://formsubmit.co/ajax/lakkadyrythma@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          _subject: "VAC-AI-TION Feedback / Issue Report"
        })
      });
      
      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <>
      <footer className="w-full py-8 mt-20 border-t border-holiday-teal/20 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-holiday-dark font-sans">
            <span className="font-semibold">VAC-AI-TION</span>
            <span className="text-gray-400">|</span>
            <span>Built with</span>
            <Heart className="w-4 h-4 text-holiday-coral fill-current animate-pulse" />
            <span>by Rythma</span>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-sm text-gray-500 font-sans">Facing an issue or have feedback?</span>
            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-holiday-teal to-holiday-coral text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold font-sans text-sm shadow-md"
            >
              <Mail className="w-4 h-4" />
              Write to me
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative border border-gray-100"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-semibold text-holiday-dark mb-1 font-sans">Send Feedback</h3>
              <p className="text-gray-500 text-sm mb-6 font-sans">Tell me what's on your mind or report a bug.</p>

              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-lg font-semibold text-gray-800">Message Sent!</p>
                  <p className="text-gray-500 text-center mt-2">Thank you for your feedback.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-holiday-teal focus:ring-2 focus:ring-holiday-teal/20 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-holiday-teal focus:ring-2 focus:ring-holiday-teal/20 outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      name="message"
                      required
                      rows={4}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-holiday-teal focus:ring-2 focus:ring-holiday-teal/20 outline-none transition-all resize-none"
                      placeholder="What can I help you with?"
                    />
                  </div>
                  
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      Failed to send message. Please try again.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-holiday-dark text-white rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {status === 'loading' ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Footer;
