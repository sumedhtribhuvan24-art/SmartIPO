import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Brain, User, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "dummy_key_to_prevent_crash" });

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your AI Financial Architect. I can provide structured, point-by-point analysis for any IPO or prospectus filing. How can I assist your research today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Analyze RHP structure",
    "Explain DRHP Risks",
    "Listing Day Strategy",
    "Compare Sector Peers"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    if (!customMessage) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to the Architect engine.');
      }

      const aiResponse = data.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMessage = error.message || "Unknown connection error.";
      setMessages(prev => [...prev, { role: 'ai', content: `**Intelligence Feed Interrupted:** ${errorMessage}\n\nPlease try refreshing the page or checking your server status.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60] md:hidden"
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[450px] h-[600px] bg-white rounded-3xl shadow-2xl z-[70] flex flex-col overflow-hidden border border-outline-variant/30"
          >
            <div className="p-4 py-3 pb-4 primary-gradient text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <Brain size={22} />
                </div>
                <div>
                  <h3 className="font-headline font-black text-sm tracking-tight">Financial Architect</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[10px] font-black opacity-90 uppercase tracking-widest">Neural Analysis Active</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10' 
                      : 'bg-white border border-outline-variant/10 text-on-surface rounded-tl-none shadow-sm'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/5">
                        <Brain size={14} className="text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-[0.1em] text-primary">Architect Insights</span>
                      </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-on-surface-variant'}`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-outline-variant/20 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Architecting Response...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-outline-variant/30">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {suggestions.map((s) => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-4 py-2 bg-slate-100 hover:bg-primary text-on-surface-variant hover:text-white rounded-xl text-[10px] font-black transition-all border border-outline-variant/10 uppercase tracking-tighter"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-1.5 pl-5 rounded-2xl border border-outline-variant/20 focus-within:border-primary/40 focus-within:bg-white transition-all shadow-inner">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter research query..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2 px-0"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className={`p-3 rounded-xl transition-all ${
                    input.trim() ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-outline'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-4 flex justify-center items-center gap-2 opacity-40">
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Institutional Grade AI</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
