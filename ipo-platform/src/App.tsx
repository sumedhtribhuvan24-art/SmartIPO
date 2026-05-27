import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Star, 
  PieChart, 
  Globe, 
  Brain, 
  Settings, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  Bookmark, 
  Rocket, 
  Lightbulb, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  BookOpen,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Lock,
  Building2,
  BarChart3,
  AlertTriangle,
  Users,
  Info,
  Wallet,
  Calculator,
  Scale,
  Newspaper,
  Calendar,
  Tag,
  FileText,
  Loader2
} from 'lucide-react';
import { Page, IPO, PortfolioAsset, User } from './types';
import { PORTFOLIO_ASSETS, NEWS_ITEMS } from './constants';
import { useLiveIPOs } from './hooks/useLiveData';
import { ChatBot } from './components/ChatBot';
import { DRHPAnalyzerPage } from './components/DRHPAnalyzerPage';
import { DNAMatchingPage } from './components/DNAMatchingPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedIpoId, setSelectedIpoId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const login = (userData: User) => {
    setUser(userData);
    navigate('home');
  };

  const logout = () => {
    setUser(null);
    navigate('home');
  };

  const navigate = (page: Page, id?: string) => {
    if (id) setSelectedIpoId(id);
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate('home')}
              className="text-xl font-extrabold text-primary tracking-tight font-headline"
            >
              IPOXpert
            </button>
            <div className="hidden md:flex items-center gap-6">
              {[
                { id: 'home', label: 'Home' },
                { id: 'ipos', label: 'IPOs' },
                { id: 'compare', label: 'Compare' },
                { id: 'analyzer', label: 'Analyze DRHP' },
                { id: 'dna', label: 'DNA Match' },
                { id: 'watchlist', label: 'Watchlist' },
                { id: 'news', label: 'News' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as Page)}
                  className={`font-headline font-bold text-sm transition-colors relative py-1 ${
                    currentPage === item.id || (item.id === 'ipos' && currentPage === 'ipo-detail' as Page)
                      ? 'text-primary' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {item.label}
                  {(currentPage === item.id || (item.id === 'ipos' && currentPage === 'ipo-detail' as Page)) && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
              <Brain size={20} />
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-on-surface leading-none">{user.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">Institutional Beta</p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center text-white ring-2 ring-primary/20 hover:scale-105 transition-transform"
                >
                  <UserIcon size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button 
                  onClick={() => navigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('signup')}
                  className="px-5 py-2 text-sm font-bold text-white primary-gradient rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </button>
              </div>
            )}
            <button 
              className="md:hidden p-2 text-on-surface-variant"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-outline-variant overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {['home', 'ipos', 'analyzer', 'compare', 'dna', 'watchlist', 'news'].map((item) => (
                  <button
                    key={item}
                    onClick={() => navigate(item as Page)}
                    className={`text-left font-headline font-bold text-lg capitalize ${
                      currentPage === item ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {item === 'analyzer' ? 'Analyze DRHP' : item === 'dna' ? 'DNA Match' : item}
                  </button>
                ))}
                <hr className="border-outline-variant/30" />
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center text-white">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => logout()} className="text-left font-bold text-error">Logout</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => navigate('login')} className="text-left font-bold text-on-surface-variant">Login</button>
                    <button onClick={() => navigate('signup')} className="text-left font-bold text-primary">Sign Up</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (selectedIpoId || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'home' && <HomePage navigate={navigate} />}
            {currentPage === 'ipos' && (
              <IPOsPage 
                navigate={navigate} 
                bookmarkedIds={bookmarkedIds} 
                toggleBookmark={toggleBookmark} 
              />
            )}
            {currentPage === ('ipo-detail' as Page) && (
              <IPODetailPage 
                id={selectedIpoId} 
                navigate={navigate} 
                bookmarkedIds={bookmarkedIds} 
                toggleBookmark={toggleBookmark} 
              />
            )}
            {currentPage === 'compare' && <ComparePage navigate={navigate} />}
            {currentPage === 'dna' && <DNAMatchingPage />}
            {currentPage === 'watchlist' && (
              <WatchlistPage 
                bookmarkedIds={bookmarkedIds} 
                toggleBookmark={toggleBookmark}
                navigate={navigate}
              />
            )}
            {currentPage === 'news' && <NewsPage />}
            {currentPage === 'analyzer' && <DRHPAnalyzerPage />}
            {currentPage === 'login' && <LoginPage onLogin={login} navigate={navigate} />}
            {currentPage === 'signup' && <SignupPage onSignup={login} navigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-outline-variant/30 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-headline font-bold text-xl text-on-surface block mb-4">IPOXpert</span>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">
              Empowering individual investors through institutional-grade data curation and AI insights.
            </p>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-sm mb-4">Platform</h5>
            <ul className="flex flex-col gap-2">
              <li><button onClick={() => navigate('ipos')} className="text-xs text-on-surface-variant hover:text-primary hover:underline">IPOs Hub</button></li>
              <li><button onClick={() => navigate('home')} className="text-xs text-on-surface-variant hover:text-primary hover:underline">Analytics</button></li>
              <li><button onClick={() => navigate('dna')} className="text-xs text-on-surface-variant hover:text-primary hover:underline">DNA Matching</button></li>
              <li><button onClick={() => navigate('news')} className="text-xs text-on-surface-variant hover:text-primary hover:underline">Market News</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-sm mb-4">Resources</h5>
            <ul className="flex flex-col gap-2">
              <li><button className="text-xs text-on-surface-variant hover:text-primary hover:underline">About us</button></li>
              <li><button className="text-xs text-on-surface-variant hover:text-primary hover:underline">Contact</button></li>
              <li><button className="text-xs text-on-surface-variant hover:text-primary hover:underline">API Docs</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-sm mb-4">Legal</h5>
            <ul className="flex flex-col gap-2">
              <li><button className="text-xs text-on-surface-variant hover:text-primary hover:underline">Privacy policy</button></li>
              <li><button className="text-xs text-on-surface-variant hover:text-primary hover:underline">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-outline-variant/30">
          <p className="text-xs text-on-surface-variant opacity-80 text-center">© 2024 IPOXpert. Precision Curation.</p>
          <div className="text-[10px] text-on-surface-variant/60 mt-6 text-center max-w-3xl mx-auto leading-relaxed">
            This platform provides data-driven insights based on DRHP disclosures and company filings for educational purposes only. 
            It is not investment advice. Please consult a SEBI-registered financial advisor before investing. 
            All probabilities and sentiment analysis are theoretical and based on available market data.
          </div>
        </div>
      </footer>

      {/* Floating AI Action Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 primary-gradient rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="brain"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Brain size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

function HomePage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <section className="relative text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold font-headline text-on-surface tracking-tight mb-6"
        >
          Smart IPO Analysis <br/><span className="text-primary">Powered by AI</span>
        </motion.h1>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10">
          Institutional-grade intelligence for the modern investor. We curate market data into actionable insights for every upcoming public offering.
        </p>
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center bg-white p-2 rounded-xl shadow-xl shadow-slate-200/50 border border-outline-variant/30">
            <Search className="ml-4 text-outline" size={20} />
            <input 
              className="w-full border-none focus:ring-0 bg-transparent text-on-surface py-4 px-4" 
              placeholder="Search by company name or ticker symbol..." 
              type="text"
            />
            <button 
              onClick={() => navigate('ipos')}
              className="primary-gradient text-white px-8 py-3 rounded-lg font-bold font-headline"
            >
              Analyze
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl -z-10" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-primary" size={20} />
              <h3 className="font-headline font-bold text-on-surface">Market Trends</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Tech Sector', value: '+12.4%', color: 'text-secondary', trend: 'up' },
                { label: 'Consumer', value: '-2.1%', color: 'text-error', trend: 'down' },
                { label: 'Fintech', value: '+8.7%', color: 'text-secondary', trend: 'up' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-outline-variant/10 hover:translate-x-1 transition-transform cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                  </div>
                  <div className="w-12 h-6 opacity-30">
                    <svg className={`w-full h-full stroke-current fill-none stroke-2 ${item.color}`} viewBox="0 0 40 20">
                      <path d={item.trend === 'up' ? "M0 15 L10 12 L20 18 L30 5 L40 8" : "M0 5 L10 8 L20 6 L30 15 L40 12"} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl h-64 primary-gradient flex flex-col justify-end p-6 group cursor-pointer">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-500" 
              src="https://picsum.photos/seed/finance/400/600" 
              alt="Featured IPO"
            />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2">Featured IPO</span>
              <h4 className="text-white font-headline font-extrabold text-xl mb-1 leading-tight">Quantum Systems Inc.</h4>
              <p className="text-white/70 text-sm mb-4">Precision Analysis Report Available</p>
              <button className="w-full bg-white text-primary py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                View Deep Dive
              </button>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl p-8 border border-outline-variant/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold font-headline">AI Insights Dashboard</h2>
              <div className="bg-secondary-container/20 px-4 py-2 rounded-xl text-center min-w-[120px]">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Sentiment</p>
                <p className="text-xl font-bold text-secondary font-headline">POSITIVE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-6 border border-outline-variant/10">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Active Opportunity</span>
                <h3 className="text-2xl font-extrabold font-headline mb-4">Tech-Stream Systems IPO Analysis</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  Based on DRHP disclosures and proprietary data, our algorithm indicates a 78% probability of listing gains exceeding 20% based on current grey market premiums and subscription trends in the SaaS sector.
                </p>
                <div className="h-40 bg-white rounded-lg border border-outline-variant/20 p-4 flex items-end gap-2">
                  {[40, 55, 45, 70, 65, 85, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-secondary' : 'bg-primary/20'}`} 
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-outline-variant/10">
                <h4 className="font-headline font-bold text-lg mb-6">Top Sector Potential</h4>
                <div className="space-y-6">
                  {[
                    { label: 'Fintech', value: '+14.2%', width: '85%', color: 'bg-secondary' },
                    { label: 'Renewables', value: '+9.8%', width: '62%', color: 'bg-secondary' },
                    { label: 'Consumer', value: '-2.4%', width: '35%', color: 'bg-error' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs">{item.label}</span>
                        <span className={`font-bold text-xs ${item.color === 'bg-error' ? 'text-error' : 'text-secondary'}`}>{item.value}</span>
                      </div>
                      <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-outline-variant/20">
                  <p className="text-[10px] text-on-surface-variant italic leading-relaxed">As per company filings and real-time market feeds. Refreshed 4 minutes ago.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                New Feature
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-headline leading-tight">
                Analyze your own <span className="text-primary">DRHP Files</span>
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Have a prospectus that isn't in our dashboard yet? Upload it directly and our AI will pivot through the technicalities to give you a professional summary.
              </p>
              <button 
                onClick={() => navigate('analyzer')}
                className="inline-flex items-center gap-2 primary-gradient text-white px-8 py-3 rounded-xl font-bold group shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Go to Analyzer <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-outline-variant/30 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                <div className="flex items-center gap-4 mb-6 text-left">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">prospectus_final.pdf</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Draft Red Herring Prospectus</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                  <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary-container p-4 rounded-xl shadow-lg border border-secondary/20 -rotate-6 hidden md:block">
                <Brain className="text-secondary mb-2" size={20} />
                <p className="text-[10px] font-bold text-on-secondary-container uppercase tracking-widest">AI Extraction Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function IPOsPage({ 
  navigate, 
  bookmarkedIds, 
  toggleBookmark 
}: { 
  navigate: (p: Page, id?: string) => void, 
  bookmarkedIds: string[], 
  toggleBookmark: (id: string) => void 
}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'closed'>('active');
  const { ipos: liveIpos, loading: isLoading } = useLiveIPOs();
  
  const displayIpos = liveIpos.filter(i => activeTab === 'active' ? i.status === 'active' : i.status === activeTab);

  const filteredIpos = displayIpos.filter(ipo => 
    (ipo.name.toLowerCase().includes(search.toLowerCase()) || 
    ipo.ticker.toLowerCase().includes(search.toLowerCase()) ||
    ipo.sector.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs: { id: 'active' | 'upcoming' | 'closed', label: string }[] = [
    { id: 'active', label: 'Current IPOs' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">
            {activeTab === 'active' ? 'Current IPOs' : activeTab === 'upcoming' ? 'Upcoming IPOs' : 'Closed IPOs'}
          </h1>
          <p className="text-on-surface-variant text-lg">Real-time tracking of active and upcoming public offerings.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input 
            type="text" 
            placeholder="Filter IPOs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="flex gap-8 border-b border-outline-variant/30 mb-10 overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeIpoTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {filteredIpos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIpos.map((ipo) => (
            <div key={ipo.id} className="bg-white p-6 rounded-xl border border-outline-variant/20 hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/10">
                    <img src={ipo.logo} alt={ipo.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface text-lg text-left">{ipo.name}</h3>
                    <p className="text-xs font-semibold text-on-surface-variant">{ipo.ticker} • {ipo.sector}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(ipo.id);
                    }}
                    className={`p-2 rounded-lg border transition-colors ${
                      bookmarkedIds.includes(ipo.id) 
                        ? 'bg-primary/10 border-primary/30 text-primary' 
                        : 'border-outline-variant/30 text-on-surface-variant hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark size={16} fill={bookmarkedIds.includes(ipo.id) ? 'currentColor' : 'none'} />
                  </button>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    ipo.aiPotential === 'high' ? 'bg-secondary-container/20 text-secondary' : 'bg-primary/10 text-primary'
                  }`}>
                    AI: {ipo.aiPotential === 'high' ? 'High Potential' : 'Moderate'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Price Band</p>
                  <p className="text-base font-bold text-on-surface">{ipo.priceBand}</p>
                </div>
                <div>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Lot Size</p>
                  <p className="text-base font-bold text-on-surface">{ipo.lotSize}</p>
                </div>
                <div>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">GMP</p>
                  <p className="text-base font-bold text-secondary">{ipo.gmp}</p>
                </div>
                <div>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Subscription</p>
                  <p className="text-base font-bold text-on-surface">{ipo.subscription}</p>
                </div>
              </div>
              
              {/* DRHP Snapshot */}
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-outline-variant/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">DRHP Highlight</span>
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-2 italic leading-relaxed">
                  "Promoter experience and strong market positioning in {ipo.sector} sector justify the valuation premium..."
                </p>
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Star size={14} />
                  <span className="text-xs font-medium">{ipo.dates}</span>
                </div>
                <button 
                  onClick={() => navigate('ipo-detail' as Page, ipo.id)}
                  className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-outline-variant/30">
          <Search className="mx-auto text-outline-variant mb-4" size={48} />
          <h3 className="text-xl font-bold font-headline text-on-surface mb-2">No IPOs found</h3>
          <p className="text-on-surface-variant">Try adjusting your search or filters.</p>
          <button 
            onClick={() => setSearch('')}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

function IPODetailPage({ 
  id, 
  navigate, 
  bookmarkedIds, 
  toggleBookmark 
}: { 
  id: string | null, 
  navigate: (p: Page, id?: string) => void,
  bookmarkedIds: string[],
  toggleBookmark: (id: string) => void
}) {
  const { ipos: IPOS, loading } = useLiveIPOs();
  const [drhpSummary, setDrhpSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const ipo = IPOS.find(i => i.id === id);

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-center text-primary font-bold">Loading IPO Details...</div>;
  if (!ipo) return <div className="max-w-7xl mx-auto p-12 text-center text-error font-bold">IPO not found in live data.</div>;

  const fetchAndAnalyze = async () => {
    setIsSummarizing(true);
    setIsAnalyzing(true);
    try {
      // Connect to the new backend API that triggers the Python ML Service
      const res = await fetch(`http://localhost:3000/api/ipos/${ipo.id}/analysis`);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (data.data.status === 'done') {
           setAiReport(data.data);
        } else {
           // If pending, just show a message or start a polling loop (simplified for now)
           setDrhpSummary("Analysis has started! Please check back in 1 minute.");
        }
      }
    } catch (err) {
      console.error('Failed to analyze DRHP:', err);
    } finally {
      setIsSummarizing(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <button 
        onClick={() => navigate('ipos')}
        className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary mb-8 transition-colors"
      >
        <ArrowRight className="rotate-180" size={16} /> Back to IPOs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/10">
                  <img src={ipo.logo} alt={ipo.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold font-headline text-on-surface">{ipo.name}</h1>
                  <p className="text-on-surface-variant font-medium">{ipo.ticker} • {ipo.sector} • Public Offering</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={fetchAndAnalyze}
                  disabled={isSummarizing || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {isSummarizing || isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  Analyze DRHP
                </button>
                <button 
                  onClick={() => toggleBookmark(ipo.id)}
                  className={`p-3 border rounded-xl transition-all ${
                    bookmarkedIds.includes(ipo.id)
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-inner'
                      : 'border-outline-variant/30 hover:bg-slate-50 text-on-surface-variant'
                  }`}
                >
                  <Bookmark size={20} fill={bookmarkedIds.includes(ipo.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {aiReport ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-8 bg-indigo-50 border-2 border-primary/20 rounded-[2.5rem] shadow-xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 primary-gradient text-white rounded-2xl flex items-center justify-center">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-headline text-on-surface">Institutional AI Intelligence</h3>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">DRHP Deep-Analysis Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Executive Summary</h4>
                      <p className="text-sm text-on-surface leading-relaxed font-medium">{aiReport.executiveSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Strategic Moats</h4>
                      <ul className="space-y-2">
                        {aiReport.strategicMoats.map((moat: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-bold text-primary">
                            <Star size={14} fill="currentColor" /> {moat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-secondary" /> Financial Health
                      </h4>
                      <p className="text-sm font-bold text-on-surface leading-normal">{aiReport.financialHealth}</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                      <h4 className="text-xs font-black text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} /> Forensic Red Flags
                      </h4>
                      <ul className="space-y-1.5">
                        {aiReport.redFlags.map((risk: string, i: number) => (
                          <li key={i} className="text-[11px] font-bold text-red-600">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1">Institutional Consensus</span>
                    <p className="text-xl font-black text-secondary uppercase tracking-tight">{aiReport.listingPrediction}</p>
                  </div>
                  <div className="bg-white px-8 py-3 rounded-2xl border-2 border-primary/10">
                    <span className="text-[10px] font-black uppercase text-on-surface-variant block mb-1">Valuation Score</span>
                    <p className="text-sm font-black text-primary">{aiReport.valuationVerdict}</p>
                  </div>
                </div>
              </motion.div>
            ) : isAnalyzing ? (
              <div className="mb-12 py-16 flex flex-col items-center bg-slate-50 border border-outline-variant/20 rounded-[2.5rem]">
                <Loader2 className="animate-spin text-primary mb-6" size={48} />
                <h3 className="text-2xl font-black font-headline mb-2">Architecting Analysis...</h3>
                <p className="text-on-surface-variant font-medium">Decoding SEBI disclosures into neural insights</p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-outline-variant/10">
              {[
                { label: 'Price Band', value: ipo.priceBand },
                { label: 'Lot Size', value: ipo.lotSize },
                { label: 'GMP', value: ipo.gmp, color: 'text-secondary' },
                { label: 'Subscription', value: ipo.subscription },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color || 'text-on-surface'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 space-y-12">
              <header className="flex items-center justify-between pb-6 border-b-4 border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black font-headline text-on-surface tracking-tight">Institutional DRHP Analysis</h3>
                    <p className="text-on-surface-variant font-medium">Deep-dive technical assessment of the {ipo.name} draft prospectus.</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 text-[10px] font-bold rounded-full uppercase tracking-widest text-on-surface-variant">Archived Filing: 2026-Q1</span>
                  <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant cursor-help">
                    <HelpCircle size={18} />
                  </div>
                </div>
              </header>
              
              <div className="grid grid-cols-1 gap-10">
                {[
                  { 
                    id: 1, 
                    title: '1. Strategic Company Overview', 
                    icon: Building2, 
                    content: `Founded in the late 2010s, ${ipo.name} has rapidly emerged as a dominant force in the ${ipo.sector} landscape. The company operates a high-margin integrated business model, controlling the value chain from initial R&D to final consumer delivery. Their proprietary technology stack provides a significant "moat" against new entrants.`,
                    bullets: [
                      'Core Business: Integrated solution provider for enterprise clients.',
                      'Diversification: Revenue split across 3 major product verticals.',
                      'Market Reach: Active operations in 14 countries with 45% international revenue.',
                      'Innovation: 120+ active patents in core technology segments.'
                    ],
                    insight: 'Understanding the core business model is the first step to evaluating future-proofing.',
                    color: 'bg-blue-50 text-blue-600 border-blue-200'
                  },
                  { 
                    id: 2, 
                    title: '2. Comprehensive Financial Performance', 
                    icon: BarChart3, 
                    content: 'The company has demonstrated exceptional fiscal discipline over the last 36 months. Revenue has surged at a compound annual growth rate (CAGR) of 35%, significantly outperforming the industry benchmark of 18%. Operating margins have expanded by 450 basis points due to increased automation in supply chains.',
                    table: [
                      ['Metric', 'FY23', 'FY24', 'FY25 (Est)'],
                      ['Total Revenue', '$450M', '$620M', '$850M'],
                      ['EBITDA Margin', '14.2%', '16.8%', '18.5%'],
                      ['Net Profit', '$32M', '$54M', '$82M'],
                      ['Debt-to-Equity', '0.42', '0.28', '0.15']
                    ],
                    insight: 'Healthy cash flows and deleveraging balance sheets indicate institutional stability.',
                    color: 'bg-green-50 text-green-600 border-green-200'
                  },
                  { 
                    id: 3, 
                    title: '3. Critical Risk Factors ⚠️', 
                    icon: AlertTriangle, 
                    content: 'Investing in this IPO entails several categorized risks. The company is legally bound to disclose these potential threats to their operational continuity and shareholder value.',
                    bullets: [
                      'Internal: High dependency on key management personnel (KMP) for strategic direction.',
                      'Regulatory: Future changes in data privacy laws could impact core product delivery.',
                      'External: Highly fragmented market with increasing competitive pressure from Big Tech.',
                      'Concentration: Top 5 clients contribute to 28% of total annual revenue.'
                    ],
                    insight: 'Risks are often the most honest part of a DRHP; pay close attention to dependency clauses.',
                    color: 'bg-orange-50 text-orange-600 border-orange-200'
                  },
                  { 
                    id: 4, 
                    title: '4. Promoters & Management Integrity', 
                    icon: Users, 
                    content: 'Led by a visionary founding team with deep pedigree in global engineering. The board composition shows high levels of independence (60% non-executive directors), exceeding standard listing requirements in most jurisdictions.',
                    bullets: [
                      'CEO: 28 years experience, former SVP at a Fortune 500 tech firm.',
                      'CFO: Certified Public Accountant with 3 successful IPO exits in their portfolio.',
                      'CTO: PhD in Applied Mathematics, lead architect of our proprietary AI engine.',
                      'Retention: Promoter lock-in period extended to 18 months post-listing.'
                    ],
                    insight: 'The pedigree of the team is the single greatest predictor of post-IPO execution.',
                    color: 'bg-purple-50 text-purple-600 border-purple-200'
                  },
                  { 
                    id: 5, 
                    title: '5. IPO Technical Details', 
                    icon: Info, 
                    content: 'Structure of the offering is designed to provide both liquidity to early stakeholders and fresh capital for expansionary objectives.',
                    table: [
                      ['Detail', 'Placement'],
                      ['Fresh Issue component', '$800,000,000 (New capital)'],
                      ['Offer for Sale (OFS)', '$400,000,000 (Early investors exit)'],
                      ['Retail Reservation', '35% of Total Issue'],
                      ['QIB Reservation', '50% (Institutional focus)'],
                      ['Market Maker', 'Morgan Stanley / Goldman Sachs']
                    ],
                    insight: 'A balance between Fresh Issue and OFS is key; too much OFS can be a red flag.',
                    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  },
                  { 
                    id: 6, 
                    title: '6. Optimized Use of Funds', 
                    icon: Wallet, 
                    content: 'Management intent for the $800M fresh capital raised is clearly itemized to drive shareholder value through aggressive infrastructure expansion and R&D.',
                    bullets: [
                      '45%: Setting up 3 new manufacturing hubs in the APAC region.',
                      '25%: Acquisition of smaller regional competitors to increase market share.',
                      '20%: Repayment of short-term expensive bridge loans (Deleveraging).',
                      '10%: General Corporate Purposes & Brand awareness campaigns.'
                    ],
                    insight: 'Growth-oriented use of funds is always superior to purely debt-repayment focused IPOs.',
                    color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
                  },
                  { 
                    id: 7, 
                    title: '7. Macro Industry Analysis', 
                    icon: LayoutDashboard, 
                    content: `The global ${ipo.sector} sector is undergoing a massive transformation. Market tailwinds include increased digitalization and government subsidies for sustainable tech. ${ipo.name} is currently ranked 4th by market share, with the potential to move into the top 2 by 2028.`,
                    bullets: [
                      'Industry CAGR: 12.8% projected over the next 5 years.',
                      'Competitive Landscape: Faced by 2 global giants and 15 regional niche players.',
                      'Technological Shift: Move towards edge computing is the primary tailwind.',
                      'Entry Barriers: High capital expenditure required to replicate the supply chain.'
                    ],
                    insight: 'Is the company swimming with the tide or against it? High sector CAGR is vital.',
                    color: 'bg-teal-50 text-teal-600 border-teal-200'
                  },
                  { 
                    id: 8, 
                    title: '8. Shareholding Pattern Analysis', 
                    icon: PieChart, 
                    content: 'Post-IPO, the equity structure will transition from family/PE-led to a broadly held public company. Promoter holding will remain significant at 58%, ensuring "skin in the game" for the leadership.',
                    bullets: [
                      'Promoter Holding: 75% (Pre) ➔ 58% (Post)',
                      'Strategic PE Investors: 15% (Locked in for 12 months)',
                      'Public Float: 22% (Ensures healthy trading liquidity)',
                      'Employee Stock Options: 5% reserved for key technical talent.'
                    ],
                    insight: 'High promoter holding post-listing is often seen as a sign of confidence by investors.',
                    color: 'bg-rose-50 text-rose-600 border-rose-200'
                  },
                  { 
                    id: 9, 
                    title: '9. Valuation Benchmark Clues', 
                    icon: Calculator, 
                    content: 'Based on the upper price band of the IPO, we have performed a comparative valuation against nearest listed peers to judge if the offering is attractively priced.',
                    table: [
                      ['Company', 'P/E (TTM)', 'RoE (%)', 'Market Cap'],
                      [ipo.name + ' (Post)', '24.5x', '22.4%', '$3.2B'],
                      ['Peer A (Global)', '28.2x', '18.5%', '$12.5B'],
                      ['Peer B (Regional)', '21.0x', '14.2%', '$0.8B'],
                      ['Industry Avg', '22.8x', '16.5%', '-']
                    ],
                    insight: 'A slightly premium P/E is justified only if the growth rate (PEG Ratio) is superior.',
                    color: 'text-amber-600'
                  },
                  { 
                    id: 10, 
                    title: '10. Legal & Compliance Health', 
                    icon: Scale, 
                    content: 'Thorough auditing confirms no major environmental, tax, or intellectual property litigation that would materially impact the company\'s valuation or future operations.',
                    bullets: [
                      'Litigation: 2 minor tax disputes totalling less than 1% of EBITDA.',
                      'Environmental: All manufacturing hubs ISO-14001 certified.',
                      'Labor: No history of industrial strikes or major union disputes.',
                      'IP: 100% of core tech owned; no pending third-party license challenges.'
                    ],
                    insight: 'Hidden liabilities are a major cause of post-listing crashes; check the legal annex.',
                    color: 'bg-slate-50 text-slate-600 border-slate-200'
                  }
                ].map((section) => (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-[2.5rem] border-2 ${section.color} p-8 md:p-12 relative overflow-hidden group`}
                  >
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-20 h-20 shrink-0 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
                          <section.icon size={36} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-3xl font-black font-headline text-on-surface mb-6 leading-tight decoration-primary/20 decoration-4 underline-offset-8 group-hover:underline transition-all">
                            {section.title}
                          </h4>
                          <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-3xl">
                            {section.content}
                          </p>
                          
                          {section.bullets && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                              {section.bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-outline-variant/10">
                                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                                  <span className="text-sm font-semibold text-on-surface">{bullet}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.table && (
                            <div className="mb-8 overflow-x-auto">
                              <table className="w-full border-separate border-spacing-0">
                                <thead>
                                  <tr>
                                    {section.table[0].map((cell, i) => (
                                      <th key={i} className="p-4 bg-on-surface/5 text-left text-xs font-black uppercase tracking-widest text-on-surface border-b border-outline-variant/20">{cell}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.table.slice(1).map((row, i) => (
                                    <tr key={i} className="group/row">
                                      {row.map((cell, j) => (
                                        <td key={j} className="p-4 border-b border-outline-variant/10 text-sm font-bold text-on-surface-variant group-hover/row:bg-white/40 transition-colors">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-on-surface/5 rounded-full">
                              <Zap size={16} className="text-primary" />
                              <span className="text-xs font-black uppercase tracking-widest">Architect Insight</span>
                            </div>
                            <p className="text-sm font-bold text-on-surface italic max-w-md text-left md:text-right">
                              "{section.insight}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Abstract background shapes */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h3 className="text-lg font-bold font-headline mb-6">Financial Performance</h3>
            <div className="h-64 flex items-end gap-4 mb-8">
              {[45, 60, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full bg-primary/10 rounded-t-lg relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ${h}M
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-outline uppercase">FY {2021 + i}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant italic text-center">Revenue in USD Millions. Source: DRHP Filing.</p>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="text-primary" size={24} />
              <h3 className="text-xl font-bold font-headline">AI Sentiment</h3>
            </div>
            <div className="p-4 bg-secondary-container/10 rounded-xl border border-secondary/20 mb-6">
              <p className="text-secondary font-black text-2xl mb-1 uppercase">{ipo.aiVerdict.replace('AI Sentiment: ', '')}</p>
              <p className="text-xs text-on-surface-variant font-medium">As per company filings and market data.</p>
            </div>
            <div className="space-y-4 mb-8">
              {[
                { label: 'Market Sentiment', value: 'Very Bullish', width: '90%' },
                { label: 'Valuation Score', value: '7.8 / 10', width: '78%' },
                { label: 'Sector Outlook', value: 'Positive', width: '85%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                    <span>{item.label}</span>
                    <span className="text-primary">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Our AI analysis suggests that {ipo.name} is priced attractively relative to its peers, with strong institutional interest expected.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-headline mb-4">Need Expert Advice?</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Connect with our certified financial architects for a personalized consultation on your IPO strategy.
              </p>
              <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                Book Consultation
              </button>
            </div>
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparePage({ navigate }: { navigate: (p: Page, id?: string) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { ipos: IPOS } = useLiveIPOs();

  const selectedIpos = IPOS.filter(ipo => selectedIds.includes(ipo.id));
  const availableIpos = IPOS.filter(ipo => !selectedIds.includes(ipo.id));

  const addIpo = (id: string) => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
    setIsAdding(false);
  };

  const removeIpo = (id: string) => {
    setSelectedIds(selectedIds.filter(idx => idx !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">IPO Comparison Tool</h1>
          <p className="text-on-surface-variant text-lg">Select and dynamic side-by-side analysis of public offerings.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Zap size={18} /> Add Company
          </button>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setSelectedIds([])}
              className="px-6 py-3 bg-slate-100 text-on-surface-variant font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant/30">
                <th className="p-6 text-left w-1/4 border-r border-outline-variant/30">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-xs font-headline font-bold text-primary mb-1 uppercase tracking-widest">Architect Metrics</h3>
                    <p className="text-[10px] text-on-surface-variant leading-tight italic">Institutional comparative analysis.</p>
                  </div>
                </th>
                
                {selectedIpos.length === 0 && (
                  <th colSpan={3} className="p-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <LayoutDashboard className="mx-auto text-outline-variant mb-4 opacity-50" size={48} />
                      <h3 className="text-xl font-bold font-headline text-on-surface mb-2">No Companies Selected</h3>
                      <p className="text-on-surface-variant text-sm mb-6">Add up to 3 companies to begin side-by-side technical comparison.</p>
                      <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors"
                      >
                        + Select First Company
                      </button>
                    </div>
                  </th>
                )}

                {selectedIpos.map((ipo, i) => (
                  <th key={ipo.id} className={`p-6 w-1/4 min-w-[240px] relative group ${i < selectedIpos.length - 1 ? 'border-r border-outline-variant/30' : ''}`}>
                    <button 
                      onClick={() => removeIpo(ipo.id)}
                      className="absolute top-4 right-4 p-1.5 bg-error-container/20 text-error rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center mx-auto mb-4 border border-outline-variant/10 shadow-sm overflow-hidden">
                        <img src={ipo.logo} alt={ipo.name} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-xl font-black font-headline tracking-tighter truncate px-2">{ipo.name}</h2>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">{ipo.ticker} • {ipo.sector}</p>
                    </div>
                  </th>
                ))}

                {selectedIpos.length > 0 && selectedIpos.length < 3 && (
                  <th className="p-6 w-1/4 min-w-[240px] bg-slate-50/50">
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="w-full aspect-square md:aspect-auto md:h-full border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={20} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Add Slot</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            
            {selectedIpos.length > 0 && (
              <tbody className="text-sm font-sans">
                {([
                  { label: 'Price Band', key: 'priceBand', mono: true },
                  { label: 'Issue Size', key: 'issueSize', mono: true },
                  { label: 'Financial Health', key: 'financialHealth', badge: true },
                  { label: 'AI Sentiment', key: 'aiVerdict', badge: true },
                  { label: 'Revenue Growth', key: 'revenueGrowth', mono: true },
                  { label: 'Status', key: 'status', capitalize: true },
                ] as { label: string, key: string, mono?: boolean, color?: string, badge?: boolean, capitalize?: boolean }[]).map((row) => (
                  <tr key={row.label} className="border-b border-outline-variant/10 hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-headline font-bold text-on-surface-variant border-r border-outline-variant/30 italic text-xs uppercase tracking-wider">{row.label}</td>
                    {selectedIpos.map((ipo, i) => (
                      <td key={ipo.id} className={`p-6 text-center ${i < selectedIpos.length - 1 ? 'border-r border-outline-variant/10' : ''}`}>
                        {row.badge ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            String(ipo[row.key as keyof IPO] || '').includes('Buy') || 
                            String(ipo[row.key as keyof IPO] || '').includes('Positive') || 
                            ipo[row.key as keyof IPO] === 'Excellent'
                              ? 'bg-secondary-container/20 text-secondary' 
                              : String(ipo[row.key as keyof IPO] || '').includes('Risky') || 
                                String(ipo[row.key as keyof IPO] || '').includes('Cautious')
                              ? 'bg-error-container/20 text-error'
                              : 'bg-slate-100 text-on-surface-variant'
                          }`}>
                            {(ipo[row.key as keyof IPO] as string) || 'N/A'}
                          </span>
                        ) : (
                          <span className={`
                            ${row.mono ? 'font-mono tracking-tighter' : 'font-semibold'} 
                            ${row.color || 'text-on-surface'}
                            ${row.capitalize ? 'capitalize' : ''}
                          `}>
                            {(ipo[row.key as keyof IPO] as string) || '—'}
                          </span>
                        )}
                      </td>
                    ))}
                    {selectedIpos.length < 3 && <td className="p-6 bg-slate-50/10"></td>}
                  </tr>
                ))}
                <tr>
                  <td className="p-6 border-r border-outline-variant/30"></td>
                  {selectedIpos.map((ipo, i) => (
                    <td key={ipo.id} className={`p-6 ${i < selectedIpos.length - 1 ? 'border-r border-outline-variant/10' : ''}`}>
                      <button 
                        onClick={() => navigate('ipo-detail' as Page, ipo.id)}
                        className="w-full py-3 primary-gradient text-white font-bold rounded-xl text-xs shadow-md shadow-primary/10"
                      >
                        View Report
                      </button>
                    </td>
                  ))}
                  {selectedIpos.length < 3 && <td className="p-6 bg-slate-50/10"></td>}
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Add IPO Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold font-headline">Select Company</h3>
                <button onClick={() => setIsAdding(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={24} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                {availableIpos.length > 0 ? (
                  availableIpos.map((ipo) => (
                    <button 
                      key={ipo.id}
                      onClick={() => addIpo(ipo.id)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-outline-variant/10 rounded-2xl hover:bg-primary/5 hover:border-primary/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/10">
                          <img src={ipo.logo} alt={ipo.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{ipo.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase">{ipo.ticker} • {ipo.sector}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-on-surface">{ipo.priceBand}</p>
                        <p className="text-[10px] text-secondary font-black">{ipo.gmp} GMP</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 size={40} className="mx-auto text-secondary mb-4 opacity-50" />
                    <p className="text-on-surface-variant font-medium">All available companies added to comparison.</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-outline-variant/30 text-center">
                <p className="text-xs text-on-surface-variant">Selection limits: Max 3 companies per analysis report.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LearnPage({ onOpenChat }: { onOpenChat: () => void }) {
  const [activeTab, setActiveTab] = useState<'basics' | 'analysis' | 'strategy' | 'advanced'>('basics');
  const [selectedModule, setSelectedModule] = useState<any | null>(null);

  const modules: Record<string, any[]> = {
    basics: [
      { 
        title: 'What is an IPO?', 
        desc: 'Understand the journey of a private company going public.', 
        icon: Globe, 
        color: 'bg-primary/10 text-primary',
        longDesc: 'An Initial Public Offering (IPO) is the process by which a private corporation can go public by sale of its stocks to the general public. It could be a new, young company or an old company which decides to be listed on an exchange.',
        keyPoints: ['Price discovery through bidding', 'Transition from private to public ownership', 'Regulatory compliance with SEBI/SEC', 'Liquidity for early investors']
      },
      { 
        title: 'How Allotment Works', 
        desc: 'Demystifying the math behind share allocation and lot sizes.', 
        icon: LayoutDashboard, 
        color: 'bg-secondary/10 text-secondary',
        longDesc: 'IPO allotment is the process where shares are distributed to applicants after the bidding process. Since most good IPOs are oversubscribed, a lottery or proportional system is used.',
        keyPoints: ['Basis of Allotment document', 'Retail vs Institutional quota', 'Refund process for non-allottees', 'Lot size as the minimum transaction unit']
      },
      { 
        title: 'Listing Gains', 
        desc: 'Understanding why stocks jump or dip on the first day of trading.', 
        icon: TrendingUp, 
        color: 'bg-tertiary/10 text-tertiary',
        longDesc: 'Listing gains refer to the difference between the IPO issue price and the price at which the stock opens on the exchange on the first day.',
        keyPoints: ['Market sentiment influence', 'GMP as a leading indicator', 'Oversubscription impact', 'Post-listing volatility']
      },
      { 
        title: 'Types of Investors', 
        desc: 'Differences between RII, NII, and QIB categories.', 
        icon: Users, 
        color: 'bg-primary/10 text-primary',
        longDesc: 'IPO investors are categorized into different buckets to ensure fair distribution across different levels of capital.',
        keyPoints: ['RII: Retail Individual Investors (< 2L)', 'NII: Non-Institutional Investors (> 2L)', 'QIB: Qualified Institutional Buyers', 'Anchor Investors: Quality markers']
      },
    ],
    analysis: [
      { 
        title: 'Decoding the DRHP', 
        desc: 'Learn how to read the Prospectus like a professional analyst.', 
        icon: BookOpen, 
        color: 'bg-secondary/10 text-secondary',
        longDesc: 'The Draft Red Herring Prospectus is the most critical document for an IPO. It contains all financial and legal data about the company.',
        keyPoints: ['Object of the issue', 'Competitive strengths', 'Financial summary', 'Legal litigations and liabilities']
      },
      { 
        title: 'SaaS Metrics 101', 
        desc: 'Understanding LTV, CAC, and Churn in modern IPOs.', 
        icon: PieChart, 
        color: 'bg-primary/10 text-primary',
        longDesc: 'Software as a Service (SaaS) companies are valued differently than traditional manufacturing firms.',
        keyPoints: ['LTV: Life Time Value of a customer', 'CAC: Customer Acquisition Cost', 'Churn: Retention health', 'NRR: Net Revenue Retention']
      },
      { 
        title: 'Valuation Models', 
        desc: 'Comparing P/E ratios and EV/EBITDA across industries.', 
        icon: Calculator, 
        color: 'bg-tertiary/10 text-tertiary',
        longDesc: 'Determining if an IPO is fairly priced involves comparing it to its listed peers using standard multiples.',
        keyPoints: ['Price to Earnings (P/E) Ratio', 'EV/EBITDA for profitability', 'Price to Sales for high-growth tech', 'Discounted Cash Flow (DCF)']
      },
      { 
        title: 'Reading Balance Sheets', 
        desc: 'Spotting red flags in debt-to-equity and cash flow.', 
        icon: BarChart3, 
        color: 'bg-error/10 text-error',
        longDesc: 'Financial analysis involves looking beyond the headline revenue to see the structural health of the business.',
        keyPoints: ['Debt-to-Equity relative to peers', 'Operating vs Financing cash flow', 'Asset turnover efficiency', 'Working capital management']
      },
    ],
    strategy: [
      { 
        title: 'GMP Strategy', 
        desc: 'What Gray Market Premium really tells you about demand.', 
        icon: Zap, 
        color: 'bg-error/10 text-error',
        longDesc: 'Gray Market Premium is an unofficial price at which IPO shares are traded before listing.',
        keyPoints: ['Unofficial but high correlation', 'Risk of manipulated GMP', 'Cost of Funding impact', 'Wait for Day 3 GMP stability']
      },
      { 
        title: 'Subscription Timing', 
        desc: 'Why Day 3 data is more critical than Day 1 or 2.', 
        icon: Star, 
        color: 'bg-secondary/10 text-secondary',
        longDesc: 'Most smart money and institutional bids come in on the final day of the IPO.',
        keyPoints: ['QIB queue on final day', 'Retail sentiment shifts', 'System lag on heavy volume', 'Final hour bidding trends']
      },
      { 
        title: 'Portfolio Balancing', 
        desc: 'How much of your assets should be in high-risk IPOs.', 
        icon: Wallet, 
        color: 'bg-primary/10 text-primary',
        longDesc: 'IPO investing can be high reward but carries significant risk of capital loss on poor listings.',
        keyPoints: ['5-10% of total portfolio limit', 'Sector diversification', 'Listing day exit vs Long-term hold', 'Capital preservation strategy']
      },
    ],
    advanced: [
      { 
        title: 'Anchor Investors', 
        desc: 'How institutional bidding signals long-term confidence.', 
        icon: Building2, 
        color: 'bg-secondary/10 text-secondary',
        longDesc: 'Anchor investors bid for shares before the IPO opens to the public, acting as a quality signal.',
        keyPoints: ['One-day bidding window', 'Lock-in period rules', 'Price discovery leadership', 'Top-tier fund names as validation']
      },
      { 
        title: 'OFS vs Fresh Issue', 
        desc: 'Does it matter if promoters are selling their own shares?', 
        icon: Scale, 
        color: 'bg-tertiary/10 text-tertiary',
        longDesc: 'An IPO can consist of a Fresh Issue (new shares) or an Offer for Sale (existing shares).',
        keyPoints: ['Fresh Issue: Funds go to company', 'OFS: Funds go to selling shareholders', 'Promoter intent analysis', 'Capex vs Debt repayment usage']
      },
      { 
        title: 'The Lock-in Period', 
        desc: 'What happens when pre-IPO investors are finally allowed to sell.', 
        icon: Lock, 
        color: 'bg-error/10 text-error',
        longDesc: 'Post-listing, certain shareholders are restricted from selling their shares for a specific timeframe.',
        keyPoints: ['30-day / 90-day tiered lock-ins', 'Impact on stock supply', 'Historical price dips on expiry', 'Pre-emptive selling pressure']
      },
    ]
  };

  const tabs: { id: typeof activeTab, label: string }[] = [
    { id: 'basics', label: 'Market Basics' },
    { id: 'analysis', label: 'Data Analysis' },
    { id: 'strategy', label: 'Investment Strategy' },
    { id: 'advanced', label: 'Advanced Topics' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-white border border-outline-variant/20 mb-16 flex flex-col md:flex-row items-stretch">
        <div className="p-8 md:p-14 md:w-3/5 z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">Learning Path</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface leading-tight mb-6">Master the IPO Market: A <span className="text-primary">Professional Guide</span></h1>
          <p className="text-on-surface-variant text-lg mb-8 max-w-lg leading-relaxed">
            From initial filing to listing day, we break down the complex mechanics of public offerings into bite-sized, actionable knowledge.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              Start Foundation Course <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="md:w-2/5 min-h-[300px] relative bg-primary/5">
          <img src="https://picsum.photos/seed/curation/800/600" alt="Learning" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/80" />
        </div>
      </section>

      <div className="mb-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Knowledge Library</h2>
            <p className="text-on-surface-variant">Deep dive into specific IPO mechanisms and terminologies.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {modules[activeTab].map((card) => (
              <button 
                key={card.title} 
                onClick={() => setSelectedModule(card)}
                className="group bg-white p-8 rounded-3xl border border-outline-variant/20 flex flex-col text-left transition-all hover:-translate-y-1 hover:shadow-lg focus:ring-2 focus:ring-primary/20"
              >
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon size={28} />
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{card.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">{card.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Resource Module</span>
                  <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Module Detail Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModule(null)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className={`w-16 h-16 rounded-2xl ${selectedModule.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                  <selectedModule.icon size={32} />
                </div>
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-on-surface-variant"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 pt-2">
                <header className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Institutional Resource</span>
                  <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4 leading-tight">{selectedModule.title}</h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed">{selectedModule.longDesc}</p>
                </header>

                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-outline">
                    <CheckCircle2 size={16} className="text-secondary" />
                    Key Architectural Pillars
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedModule.keyPoints.map((point: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-2xl border border-outline-variant/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-on-surface-variant leading-tight">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                      <Brain size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-outline">AI Analysis Ready</p>
                      <p className="text-xs font-medium text-on-surface-variant">Ask the Architect about this topic</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedModule(null);
                      onOpenChat();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    Deep Dive with AI
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Subscription', 'Market Trends', 'Listing News', 'Regulatory'];

  const filteredNews = activeCategory === 'All' 
    ? NEWS_ITEMS 
    : NEWS_ITEMS.filter(news => news.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <Newspaper size={32} />
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Market News & Updates</h1>
        </div>
        <p className="text-on-surface-variant text-lg">Stay informed with institutional-grade updates on the IPO landscape.</p>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${
              activeCategory === category 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredNews.map((news) => (
          <motion.article
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[2rem] border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="flex flex-col sm:flex-row h-full">
              <div className="sm:w-2/5 relative overflow-hidden h-48 sm:h-auto">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-lg bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    {news.category}
                  </span>
                </div>
              </div>
              <div className="sm:w-3/5 p-8 flex flex-col">
                <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {news.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag size={12} />
                    {news.category}
                  </div>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight">
                  {news.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">
                  {news.excerpt}
                </p>
                <button className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all underline-offset-4 hover:underline">
                  Read Full Report <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Newsletter Section */}
      <section className="mt-20 p-8 md:p-14 rounded-[3rem] primary-gradient text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold mb-4">Architect Early Access</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Get precision-curated IPO alerts and institutional DRHP analysis delivered directly to your intelligence feed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your professional email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/50 backdrop-blur-md"
            />
            <button className="px-10 py-4 bg-white text-primary font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform">
              Join Intelligence Feed
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function WatchlistPage({ 
  bookmarkedIds, 
  toggleBookmark, 
  navigate 
}: { 
  bookmarkedIds: string[], 
  toggleBookmark: (id: string) => void,
  navigate: (p: Page, id?: string) => void
}) {
  const { ipos: IPOS } = useLiveIPOs();
  const bookmarkedIpos = IPOS.filter(ipo => bookmarkedIds.includes(ipo.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Watchlist</h1>
          <p className="text-on-surface-variant mt-1">Real-time tracking of your curated assets and bookmarked IPOs.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm min-w-[240px]">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">Total Value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tighter">$42,850.20</span>
            <span className="text-secondary text-sm font-bold flex items-center">
              <ArrowUpRight size={14} /> 12.4%
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Bookmarked IPOs Section */}
          <div className="bg-white rounded-xl p-8 border border-outline-variant/20 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Bookmark className="text-primary fill-primary/10" size={24} />
                <h3 className="text-xl font-bold font-headline">Bookmarked IPOs</h3>
              </div>
              <span className="bg-primary/5 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/10">
                {bookmarkedIpos.length} Active Watches
              </span>
            </div>

            {bookmarkedIpos.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedIpos.map((ipo) => (
                  <div 
                    key={ipo.id} 
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-outline-variant/5 transition-all cursor-pointer group"
                    onClick={() => navigate('ipo-detail' as Page, ipo.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-outline-variant/10 shadow-sm">
                        <img src={ipo.logo} alt={ipo.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{ipo.name}</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">{ipo.ticker} • {ipo.sector}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">GMP</p>
                        <p className="text-sm font-bold text-secondary">{ipo.gmp}</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Status</p>
                        <span className={`text-[10px] font-black uppercase ${
                          ipo.status === 'active' ? 'text-secondary' : 'text-primary'
                        }`}>
                          {ipo.status}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(ipo.id);
                        }}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Bookmark size={18} fill="currentColor" className="text-primary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-outline-variant/20">
                <Bookmark size={40} className="mx-auto text-outline-variant mb-4 opacity-30" />
                <p className="text-on-surface-variant font-medium mb-4">You haven't bookmarked any IPOs yet.</p>
                <button 
                  onClick={() => navigate('ipos')}
                  className="text-primary font-bold text-sm hover:underline flex items-center gap-2 mx-auto"
                >
                  Explore Current IPOs <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden min-h-[320px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold font-headline">Performance History</h3>
            <select className="bg-white border border-outline-variant/30 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[30, 45, 35, 60, 55, 75, 90, 100].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-lg transition-all duration-500 ${i === 7 ? 'bg-primary' : 'bg-primary/10'}`} 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-outline-variant/20 shadow-sm">
          <h3 className="text-xl font-bold font-headline mb-6">Recent Applications</h3>
          <div className="space-y-4">
            {[
              { name: 'Quantra Sol.', date: 'Oct 12', status: 'Allotted', color: 'bg-secondary-container/20 text-secondary' },
              { name: 'Nebula Tech', date: 'Oct 10', status: 'Not Allotted', color: 'bg-error-container/20 text-error' },
              { name: 'AeroSpace X', date: 'Oct 08', status: 'Applied', color: 'bg-primary/10 text-primary' },
            ].map((app) => (
              <div key={app.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Zap className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{app.name}</p>
                    <p className="text-[10px] text-on-surface-variant">Applied: {app.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${app.color}`}>{app.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
            Track All Applications
          </button>
        </div>
      </div>

      <section className="bg-slate-50 rounded-xl p-8 border border-outline-variant/10">
        <h2 className="text-2xl font-bold font-headline mb-8">Asset Details & Listing Gains</h2>
        <div className="space-y-4">
          {PORTFOLIO_ASSETS.map((asset) => (
            <div key={asset.id} className={`bg-white rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 ${asset.type === 'gain' ? 'border-secondary' : 'border-error'} hover:shadow-md transition-all`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${asset.type === 'gain' ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/20 text-error'}`}>
                  {asset.initials}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{asset.name}</h4>
                  <p className="text-[10px] text-on-surface-variant">Listing Date: {asset.listingDate}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-12">
                <div>
                  <p className="text-[10px] uppercase font-bold text-outline mb-1">Allotment</p>
                  <p className="font-bold text-sm">{asset.allotment}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-outline mb-1">Listing Gain</p>
                  <p className={`font-bold text-sm ${asset.type === 'gain' ? 'text-secondary' : 'text-error'}`}>{asset.listingGain}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-outline mb-1">Profit/Loss</p>
                  <p className={`font-bold text-sm ${asset.type === 'gain' ? 'text-secondary' : 'text-error'}`}>{asset.currentProfit}</p>
                </div>
                <button className="bg-slate-100 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onLogin, navigate }: { onLogin: (u: User) => void, navigate: (p: Page) => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin({
      id: 'u1',
      name: 'Johnathan Doe',
      email: email || 'j.doe@architect.com'
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-outline-variant/20 p-8 md:p-10">
        <header className="mb-10 text-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant">Precision curation for your financial future.</p>
        </header>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant ml-1">Email Address</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" 
                placeholder="name@company.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-on-surface-variant">Password</label>
              <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="••••••••" type="password" required />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-4 primary-gradient text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Sign In <ArrowRight size={20} />
          </button>
        </form>
        <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-sm text-on-surface-variant">
            New to the architecture? <button onClick={() => navigate('signup')} className="text-primary font-bold hover:underline">Create Account</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ onSignup, navigate }: { onSignup: (u: User) => void, navigate: (p: Page) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSignup({
      id: 'u1',
      name: name || 'Johnathan Doe',
      email: email || 'j.doe@architect.com'
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-8">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-primary leading-tight">
            Precision Curation for the <span className="text-secondary">Modern Investor.</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Join the elite circle of investors using editorialized data to architect their financial future.
          </p>
          <div className="space-y-6">
            {[
              { title: 'AI-Powered Insights', desc: 'Machine learning that distills complex market noise.', icon: Brain, color: 'bg-primary/10 text-primary' },
              { title: 'Real-time IPO Data', desc: 'Institutional-grade tracking of public offerings.', icon: TrendingUp, color: 'bg-secondary-container/20 text-secondary' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 bg-white rounded-xl border border-outline-variant/10">
                <div className={`flex-shrink-0 w-12 h-12 ${item.color} flex items-center justify-center rounded-lg`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-outline-variant/20">
          <h2 className="font-headline text-3xl font-bold mb-2">Start Building</h2>
          <p className="text-on-surface-variant mb-10">Complete the form to create your institutional profile.</p>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" 
                placeholder="Johnathan Doe" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Email Address</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" 
                placeholder="j.doe@architect.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Password</label>
              <input className="w-full px-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="••••••••" type="password" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Confirm Password</label>
              <input className="w-full px-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="••••••••" type="password" required />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <ShieldCheck className="text-primary" size={20} />
              <label className="text-sm text-on-surface-variant">
                I agree to the <button type="button" className="text-primary font-bold hover:underline">Terms</button> and <button type="button" className="text-primary font-bold hover:underline">Privacy Policy</button>.
              </label>
            </div>
            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                className="w-full py-4 primary-gradient text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                Create Account
              </button>
            </div>
          </form>
          <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account? <button onClick={() => navigate('login')} className="text-primary font-bold hover:underline">Sign In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
