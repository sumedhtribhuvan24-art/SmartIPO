import { useState } from 'react';
import { 
  Dna, 
  Target, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  SearchCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IPO } from '../types';
import { useLiveIPOs } from '../hooks/useLiveData';

export function DNAMatchingPage() {
  const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { ipos: IPOS } = useLiveIPOs();
  const activeIpos = IPOS.filter(ipo => ipo.status === 'active' || ipo.status === 'upcoming');

  const runDNAMatch = async () => {
    if (!selectedIpo) return;

    setIsMatching(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/dna/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipo: selectedIpo })
      });

      if (!response.ok) {
        throw new Error('DNA calibration failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('DNA Match error:', err);
      setError('The DNA engine failed to calibrate. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl mb-6 shadow-sm ring-1 ring-indigo-200">
          <Dna size={40} className="animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">
          IPO <span className="text-indigo-600">DNA</span> Match
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
          Our predictive engine maps the genetic markers of current IPOs against historical patterns to forecast performance and risk.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Selection Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl">
            <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
              <SearchCode size={20} className="text-indigo-600" />
              Select Specimen
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activeIpos.map((ipo) => (
                <button
                  key={ipo.id}
                  onClick={() => setSelectedIpo(ipo)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedIpo?.id === ipo.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600' 
                    : 'border-outline-variant/20 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-sm mb-1">{ipo.name}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant uppercase tracking-wider">{ipo.sector}</span>
                    <span className="font-bold text-indigo-600">{ipo.status}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={runDNAMatch}
              disabled={!selectedIpo || isMatching}
              className="w-full mt-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
              {isMatching ? 'Running Match...' : 'Calculate DNA Match'}
              <Target size={18} />
            </button>
          </div>

          <div className="bg-indigo-900 text-indigo-100 p-8 rounded-3xl shadow-xl">
            <Sparkles className="text-indigo-300 mb-4" size={24} />
            <h4 className="font-bold text-lg mb-2">Predictive Logic</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              DNA matching looks at issue size, sector sentiment, promoter background, and financial growth velocity to find "Twin IPOs" from the last 10 years.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            {isMatching ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-outline-variant/30 shadow-xl p-12 h-full flex flex-col items-center justify-center text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-50" />
                  <div className="relative w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl">
                    <Dna size={48} className="animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-2xl font-black font-headline mb-3">Syncing Genetic Markers</h3>
                <p className="text-on-surface-variant max-w-sm">Scanning 2,400+ historical IPO records for sector parity and growth signatures...</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Target Profile Analysis */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-px flex-1 bg-indigo-600/20" />
                    <h3 className="text-xl font-black font-headline text-indigo-600 uppercase tracking-[0.3em]">Base Specimen Analysis</h3>
                    <div className="h-px flex-1 bg-indigo-600/20" />
                  </div>

                  {result.targetProfile && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-600/30 shadow-2xl overflow-hidden ring-4 ring-indigo-600/5"
                    >
                      <div className="bg-indigo-600 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Target size={32} />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black font-headline">{selectedIpo?.name}</h3>
                            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Active Specimen Profile</p>
                          </div>
                        </div>
                        <div className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border-2 shadow-inner ${
                          result.riskLevel === 'Low' ? 'bg-green-500/20 border-green-400' :
                          result.riskLevel === 'Moderate' ? 'bg-yellow-500/20 border-yellow-400' :
                          'bg-red-500/20 border-red-400'
                        }`}>
                          {result.riskLevel} Risk
                        </div>
                      </div>

                      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Financials DNA */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <TrendingUp size={14} />
                            Financial Markers
                          </h4>
                          <div className="space-y-3">
                            {[
                              { label: 'Rev. Growth', val: result.targetProfile.financials.revenueGrowth },
                              { label: 'Profit Trend', val: result.targetProfile.financials.profitTrend },
                              { label: 'EBITDA Margin', val: result.targetProfile.financials.ebitdaMargin },
                              { label: 'Debt/Equity', val: result.targetProfile.financials.debtToEquity },
                              { label: 'ROE/ROCE', val: result.targetProfile.financials.roeRoce },
                              { label: 'P/E Ratio', val: result.targetProfile.financials.peRatio }
                            ].map(stat => (
                              <div key={stat.label} className="flex justify-between items-center py-2 border-b border-indigo-100/50">
                                <span className="text-xs font-bold text-on-surface-variant">{stat.label}</span>
                                <span className="text-xs font-black text-indigo-900">{stat.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Subscription & Structure */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <BarChart3 size={14} />
                            Predicted Demand Profile
                          </h4>
                          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 space-y-4 border border-indigo-100">
                            {result.targetProfile.subscription && Object.entries(result.targetProfile.subscription).map(([key, val]: any) => (
                              <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">{key}</span>
                                  <span className="text-xs font-black text-indigo-900">{val}x</span>
                                </div>
                                <div className="h-1 bg-indigo-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600 w-[65%]" />
                                </div>
                              </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-indigo-100 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[9px] font-black uppercase text-indigo-400">Issue Size</p>
                                <p className="text-xs font-bold text-on-surface">{result.targetProfile.structure.issueSize}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-indigo-400">Platform</p>
                                <p className="text-xs font-bold text-on-surface">{result.targetProfile.structure.exchange}</p>
                              </div>
                              <div className="col-span-2 pt-1">
                                <p className="text-[9px] font-black uppercase text-indigo-400">Structure</p>
                                <p className="text-[10px] font-medium text-on-surface-variant">{result.targetProfile.structure.freshVsOfs}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Flags */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <AlertTriangle size={14} />
                            Risk Biomarkers
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { label: 'Loss Making', val: result.targetProfile.redFlags.isLossMaking },
                              { label: 'High Debt', val: result.targetProfile.redFlags.isHighDebt },
                              { label: 'Promoter Exit', val: result.targetProfile.redFlags.isPromoterSelling },
                              { label: 'Overvalued', val: result.targetProfile.redFlags.isOvervalued }
                            ].map(flag => (
                              <div key={flag.label} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                                flag.val ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                              }`}>
                                <span className="text-xs font-black">{flag.label}</span>
                                {flag.val ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Twin IPO Deep Dive */}
                  <div className="space-y-8 pt-12">
                    {result.twins?.map((twin: any, idx: number) => (
                      <motion.div 
                        key={twin.name}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="bg-white rounded-[2.5rem] border border-outline-variant/30 shadow-2xl overflow-hidden group hover:border-indigo-400 transition-all duration-500"
                      >
                        {/* Header */}
                        <div className="bg-slate-50 p-6 md:p-8 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                              {idx + 1}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black font-headline text-on-surface">{twin.name}</h3>
                              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{twin.sector} • Historical Twin</p>
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-700 px-6 py-2 rounded-2xl flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-tighter">Listing Gain</span>
                            <span className="text-lg font-black">{twin.listingGain}</span>
                          </div>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Financials DNA */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
                              <TrendingUp size={14} className="text-indigo-500" />
                              Financial Sequence
                            </h4>
                            <div className="space-y-3">
                              {[
                                { label: 'Rev. Growth', val: twin.financials.revenueGrowth },
                                { label: 'Profit Trend', val: twin.financials.profitTrend },
                                { label: 'EBITDA Margin', val: twin.financials.ebitdaMargin },
                                { label: 'Debt/Equity', val: twin.financials.debtToEquity },
                                { label: 'ROE/ROCE', val: twin.financials.roeRoce },
                                { label: 'P/E Ratio', val: twin.financials.peRatio }
                              ].map(stat => (
                                <div key={stat.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                                  <span className="text-xs font-medium text-on-surface-variant">{stat.label}</span>
                                  <span className="text-xs font-black text-on-surface">{stat.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Subscription DNA */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
                              <CheckCircle2 size={14} className="text-blue-500" />
                              Subscription Load
                            </h4>
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-6">
                              {Object.entries(twin.subscription).map(([key, val]: any) => (
                                <div key={key}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase text-on-surface-variant">{key}</span>
                                    <span className="text-sm font-black text-on-surface">{val}x</span>
                                  </div>
                                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                    <motion.div 
                                      className="h-full bg-blue-500"
                                      initial={{ width: 0 }}
                                      animate={{ width: '70%' }} // Representative width
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 flex justify-between text-[10px] uppercase font-bold text-on-surface-variant">
                              <span>Size: {twin.structure.issueSize}</span>
                              <span className="text-indigo-600">{twin.structure.exchange}</span>
                            </div>
                          </div>

                          {/* Risk Biomarkers */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
                              <AlertTriangle size={14} className="text-red-500" />
                              Risk Biomarkers
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { label: 'Loss Making', val: twin.redFlags.isLossMaking },
                                { label: 'High Debt', val: twin.redFlags.isHighDebt },
                                { label: 'Promoter Exit', val: twin.redFlags.isPromoterSelling },
                                { label: 'Overvalued', val: twin.redFlags.isOvervalued }
                              ].map(flag => (
                                <div key={flag.label} className={`flex items-center justify-between p-3 rounded-xl border ${
                                  flag.val ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
                                }`}>
                                  <span className="text-xs font-bold">{flag.label}</span>
                                  {flag.val ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                                </div>
                              ))}
                            </div>
                            <p className="mt-4 text-[10px] text-on-surface-variant leading-tight">
                              Structural Hybrid: <span className="font-bold">{twin.structure.freshVsOfs}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Match Summary */}
                <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <Dna className="absolute right-0 bottom-0 -mr-12 -mb-12 opacity-10 rotate-12" size={300} />
                  <div className="relative z-10 max-w-2xl">
                    <Sparkles className="text-indigo-300 mb-6" size={32} />
                    <h3 className="text-3xl font-black font-headline mb-4">Evolutionary Conclusion</h3>
                    <p className="text-xl text-indigo-100 leading-relaxed font-medium">
                      {result.dnaAnalysisBrief}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-dashed border-outline-variant/50 p-12 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white border border-outline-variant/20 rounded-2xl flex items-center justify-center text-on-surface-variant mb-6 grayscale opacity-40">
                  <Target size={32} />
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">No DNA Sample Selected</h3>
                <p className="text-on-surface-variant max-w-xs">Select an active IPO from the left panel to begin the genetic pattern matching process.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
