import { useState, useRef, ChangeEvent } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileSearch,
  PieChart,
  Target,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  History,
  Building2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';

// Use a more reliable way to set the worker for pdf.js in a Vite environment
// We'll use the legacy worker source which is often more compatible with different environments
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DRHPAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
        setAnalysis(null);
      } else {
        setError('Only PDF files are supported for DRHP analysis.');
      }
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      setStatus('Initializing PDF engine...');
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 40); // 40 pages is usually enough for key sections
      
      setStatus(`Scanning key sections (0/${maxPages})...`);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
        
        if (i % 5 === 0) {
          setStatus(`Scanning key sections (${i}/${maxPages})...`);
        }
      }
      
      return fullText;
    } catch (err) {
      console.error('Error extracting text:', err);
      throw new Error('Could not read the PDF structure. The file might be encrypted or corrupted.');
    }
  };

  const analyzeDrhp = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const text = await extractTextFromPdf(file);
      
      setStatus('Deep-scanning financial narratives...');
      
      const response = await fetch('/api/drhp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: text.substring(0, 30000),
          companyName: file.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server analysis failed');
      }
      
      // Format the JSON data into Markdown for the UI
      const formattedMarkdown = `
# ${file.name} AI Analysis Report

## 🏢 Executive Summary
${data.executiveSummary}

## 🏗️ Strategic Moats
${Array.isArray(data.strategicMoats) ? data.strategicMoats.map((m: string) => `* ${m}`).join('\n') : data.strategicMoats}

## 📈 Financial Health
${data.financialHealth}

## ⚠️ Critical Red Flags
${Array.isArray(data.redFlags) ? data.redFlags.map((r: string) => `* ${r}`).join('\n') : data.redFlags}

## 🎯 Valuation Verdict
${data.valuationVerdict}

## 💡 Institutional Prediction
**Bottom Line:** ${data.listingPrediction}
`;

      setAnalysis(formattedMarkdown);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'The AI engine encountered an unexpected error.');
    } finally {
      setIsAnalyzing(false);
      setStatus('');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
        setAnalysis(null);
      } else {
        setError('Please upload a PDF file.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-3xl mb-6 shadow-sm ring-1 ring-primary/20 rotate-3 transition-transform hover:rotate-0">
          <FileSearch size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">
          Institutional <span className="text-primary italic">DRHP</span> Analyzer
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
          Upload any Draft Red Herring Prospectus to decode complex financial disclosures into actionable institutional-grade intelligence.
        </p>
      </header>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-2xl shadow-indigo-500/5 overflow-hidden mb-12">
        <div className="p-8 md:p-12 lg:p-16">
          {!analysis && !isAnalyzing && (
            <div 
              onDragOver={onDragOver}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
                file ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/50 hover:border-primary/30 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              
              <div className="flex flex-col items-center">
                {file ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FileText size={48} />
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-1">{file.name}</h3>
                    <p className="text-on-surface-variant text-sm mb-8">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Prospectus Loaded</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setFile(null)}
                        className="px-8 py-3 rounded-2xl text-sm font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-white hover:border-on-surface transition-all"
                      >
                        Change File
                      </button>
                      <button 
                        onClick={analyzeDrhp}
                        className="px-10 py-3 rounded-2xl text-sm font-bold text-white primary-gradient shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Brain size={20} />
                        Run Precision Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-slate-100 text-on-surface-variant rounded-3xl flex items-center justify-center mb-8">
                      <Upload size={38} />
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-3">Feed your DRHP</h3>
                    <p className="text-on-surface-variant text-base mb-10 max-w-sm mx-auto leading-relaxed">
                      Drop your prospectus PDF here or browse from your system to start the decomposition.
                    </p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-10 py-4 rounded-2xl text-base font-bold text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all shadow-sm"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-20 flex flex-col items-center text-center animate-in fade-in duration-700">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 primary-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40">
                  <Brain size={48} className="animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-black font-headline mb-4">Architecting Financial Insights</h3>
              <p className="text-on-surface-variant text-lg max-w-md mb-12 font-medium">{status}</p>
              
              <div className="w-full max-w-lg h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full primary-gradient"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 12, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-5 text-red-700 mb-8"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="flex-1">
                <p className="font-black font-headline text-lg mb-1">Engine Restriction</p>
                <p className="text-sm opacity-90 leading-relaxed font-medium">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    setAnalysis(null);
                    setFile(null);
                  }}
                  className="mt-4 px-6 py-2 bg-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all uppercase tracking-wider"
                >
                  Restart Engine
                </button>
              </div>
            </motion.div>
          )}

          {analysis && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-4"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-outline-variant/10 pb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-headline tracking-tight">Intelligence Output</h2>
                    <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-black mt-1">
                      Vault ID: <span className="text-primary">{file?.name.substring(0, 15)}...</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    className="p-3 rounded-xl bg-slate-50 border border-outline-variant/20 hover:bg-slate-100 transition-all text-on-surface-variant flex items-center gap-2 group"
                    title="Download Report"
                  >
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setAnalysis(null);
                    }}
                    className="px-8 py-3 rounded-2xl text-sm font-bold text-white primary-gradient hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                  >
                    Analyze New DRHP
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  { label: 'Data Quality', val: 'Proprietary', icon: Layers, color: 'blue' },
                  { label: 'Focus Vector', val: 'Core DRHP', icon: Target, color: 'indigo' },
                  { label: 'Signal Type', val: 'Institutional', icon: TrendingUp, color: 'emerald' },
                  { label: 'Processing', val: 'Low-Latency', icon: History, color: 'violet' }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-50/50 p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col items-center text-center group hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-500"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500
                      ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                      ${stat.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
                      ${stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : ''}
                      ${stat.color === 'violet' ? 'bg-violet-100 text-violet-600' : ''}
                    `}>
                      <stat.icon size={24} />
                    </div>
                    <h4 className="font-bold text-[10px] mb-1 uppercase tracking-widest text-on-surface-variant/70">{stat.label}</h4>
                    <p className="text-lg font-black font-headline text-on-surface">{stat.val}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-4xl p-2 md:p-4 lg:p-2 border border-outline-variant/5">
                <article className="prose prose-slate max-w-none markdown-container bg-slate-50/30 rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Building2 size={120} />
                  </div>
                  <Markdown>{analysis}</Markdown>
                </article>
              </div>

              <div className="mt-16 pt-16 border-t border-outline-variant/10">
                <div className="bg-primary/5 rounded-[3rem] p-10 md:p-16 border border-primary/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 justify-between text-center lg:text-left">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        Decision Engine
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black font-headline mb-6 leading-tight">Need a Sectoral <span className="text-primary italic">Stress Test</span>?</h3>
                      <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
                        Context is everything. Compare this analysis against our institutional benchmark database to see how it ranks against peers in the same industry.
                      </p>
                    </div>
                    <button className="primary-gradient text-white px-12 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 group whitespace-nowrap shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                      Run Sector Match <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {[
          { 
            title: 'Professional Audit', 
            icon: ShieldAlert, 
            desc: 'This AI-extraction is optimized for the Draft Red Herring format, identifying non-standard risk clauses that standard scanners might skip.' 
          },
          { 
            title: 'Neural Mapping', 
            icon: Brain, 
            desc: 'We map management pedigrees against successful historical IPO exits to identify leadership quality signals from the text.' 
          },
          { 
            title: 'Precision Capture', 
            icon: Target, 
            desc: 'Our extraction engine preserves numerical precision, ensuring financial table data is interpreted with institutional accuracy.' 
          }
        ].map((feat, i) => (
          <div key={i} className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant/20 hover:border-primary/30 transition-all transition-duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-primary">
              <feat.icon size={28} />
            </div>
            <h4 className="font-headline font-black text-xl mb-4">{feat.title}</h4>
            <p className="text-base text-on-surface-variant leading-relaxed font-medium">
              {feat.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
