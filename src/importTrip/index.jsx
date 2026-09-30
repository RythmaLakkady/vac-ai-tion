import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, ArrowRight, X, AlertCircle } from 'lucide-react';
import { chatSession } from '@/service/AImodel';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ImportTrip() {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setFile(uploadedFile);
    await extractAndParsePDF(uploadedFile);
  };

  const extractAndParsePDF = async (pdfFile) => {
    setParsing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
      }

      const prompt = `
      You are an expert itinerary parser. I am providing you with the raw text extracted from a user's travel itinerary PDF.
      Your goal is to parse this text and return a structured JSON response matching my exact schema.
      Do not hallucinate exact times if they are not explicitly written. Use "Time unspecified" if needed.
      If extraction is uncertain, set "uncertain": true on that specific activity.

      TEXT TO PARSE:
      ${fullText.substring(0, 30000)}

      EXPECTED JSON SCHEMA:
      {
        "trip_name": "string",
        "location": "string",
        "duration": "string",
        "travelers": "string",
        "itinerary": [
          {
            "day": "Day 1",
            "theme": "string",
            "plan": [
              {
                "time": "string (e.g. 10:00 AM or 'Morning' or 'Time unspecified')",
                "placeName": "string",
                "placeDetails": "string",
                "ticketPricing": "string",
                "uncertain": boolean
              }
            ]
          }
        ]
      }
      `;

      const result = await chatSession.sendMessage(prompt);
      const jsonResponse = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
      setExtractedData(jsonResponse);

    } catch (err) {
      console.error('PDF parsing error:', err);
      alert('Failed to parse PDF. It might be too complex or scanned (no text).');
    }
    setParsing(false);
  };

  const handleImportToJourney = async () => {
    if (!auth.currentUser) {
      alert("Please login to save this trip.");
      navigate("/login");
      return;
    }
    try {
      const tripRef = await addDoc(collection(db, "UserTrips"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        tripData: extractedData,
        timestamp: serverTimestamp(),
        source: "PDF Import"
      });
      navigate(`/view-trip/${tripRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save imported trip.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-4xl mx-auto font-sans">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold text-ink mb-4">Import Itinerary</h1>
        <p className="text-xl text-gray-500">Upload your agency PDF or existing plan, and we'll convert it into a smart Journey.</p>
      </div>

      {!extractedData ? (
        <div className="bg-card rounded-[40px] border-2 border-dashed border-gray-300 p-16 text-center hover:border-amber hover:bg-amber/5 transition-colors group cursor-pointer relative">
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {parsing ? (
             <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
                <p className="text-xl font-bold text-ink">Analyzing your PDF...</p>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-amber" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Drag & Drop or Click to Upload PDF</h2>
              <p className="text-gray-400">Only PDF formats are supported currently.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div>
               <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2"><CheckCircle className="w-6 h-6" /> Extraction Complete</h3>
               <p className="text-green-700 mt-1">Review the details below. We flagged any uncertain items. You can edit them in the Journey view.</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setExtractedData(null)} className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  Cancel
                </button>
                <button onClick={handleImportToJourney} className="px-6 py-3 bg-ink text-primary-foreground font-bold rounded-xl flex items-center gap-2 hover:bg-amber transition-colors shadow-lg">
                  Import to Journey <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="bg-card p-10 rounded-[40px] shadow-sm border border-gray-100">
             <h4 className="text-3xl font-serif font-bold text-ink mb-2">{extractedData.trip_name || extractedData.location || "Imported Trip"}</h4>
             <div className="flex gap-4 mb-8 border-b border-gray-100 pb-6">
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">{extractedData.duration || "Duration Unspecified"}</span>
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">{extractedData.travelers || "Travelers Unspecified"}</span>
             </div>

             <div className="space-y-10">
               {extractedData.itinerary?.map((day, idx) => (
                 <div key={idx}>
                    <h5 className="text-2xl font-bold text-ink mb-4 font-serif">{day.day} - {day.theme}</h5>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                       {day.plan?.map((plan, pIdx) => (
                         <div key={pIdx} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                           {plan.uncertain && (
                             <div className="absolute top-4 right-4 flex items-center gap-1 text-amber text-xs font-bold bg-amber/10 px-2 py-1 rounded-md">
                                <AlertCircle className="w-3 h-3" /> Uncertain Extraction
                             </div>
                           )}
                           <div className="font-bold text-coral text-sm uppercase tracking-wide">{plan.time}</div>
                           <div className="text-xl font-bold text-ink">{plan.placeName}</div>
                           <div className="text-gray-500 text-sm">{plan.placeDetails}</div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
