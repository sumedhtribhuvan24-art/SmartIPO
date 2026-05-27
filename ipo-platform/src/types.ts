export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Page = 'home' | 'ipos' | 'compare' | 'dna' | 'watchlist' | 'news' | 'login' | 'signup' | 'analyzer';

export interface IPO {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  priceBand: string;
  lotSize: string;
  gmp: string;
  subscription: string;
  dates: string;
  status: 'active' | 'upcoming' | 'closed';
  aiPotential: 'high' | 'moderate' | 'low';
  logo: string;
  issueSize: string;
  revenueGrowth: string;
  aiVerdict: string;
  financialHealth: 'Excellent' | 'Good' | 'Stable' | 'Risky' | 'Improving' | 'State-Backed';
}

export interface PortfolioAsset {
  id: string;
  name: string;
  listingDate: string;
  allotment: string;
  listingGain: string;
  currentProfit: string;
  type: 'gain' | 'loss';
  initials: string;
}
