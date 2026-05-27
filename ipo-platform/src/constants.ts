import { IPO, PortfolioAsset } from './types';

export const IPOS: IPO[] = [
  {
    id: '1',
    name: 'Hyundai Motor India',
    ticker: 'HYUNDAI',
    sector: 'Automobile',
    priceBand: '₹1865 - ₹1960',
    lotSize: '7 Shares',
    gmp: '+₹65 (3%)',
    subscription: '2.37x',
    dates: 'Oct 15 - Oct 17',
    status: 'active',
    aiPotential: 'high',
    logo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop',
    issueSize: '₹27,870 Cr',
    revenueGrowth: '18%',
    aiVerdict: 'AI Sentiment: Positive',
    financialHealth: 'Excellent'
  },
  {
    id: '2',
    name: 'Swiggy Limited',
    ticker: 'SWIGGY',
    sector: 'Consumer Tech',
    priceBand: '₹371 - ₹390',
    lotSize: '38 Shares',
    gmp: '+₹12 (3%)',
    subscription: '3.59x',
    dates: 'Nov 06 - Nov 08',
    status: 'active',
    aiPotential: 'high',
    logo: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=100&h=100&fit=crop',
    issueSize: '₹11,327 Cr',
    revenueGrowth: '45%',
    aiVerdict: 'AI Sentiment: Mixed',
    financialHealth: 'Improving'
  },
  {
    id: '3',
    name: 'Waaree Energies',
    ticker: 'WAAREE',
    sector: 'Renewables',
    priceBand: '₹1427 - ₹1503',
    lotSize: '9 Shares',
    gmp: '+₹1560 (104%)',
    subscription: '76.34x',
    dates: 'Oct 21 - Oct 23',
    status: 'active',
    aiPotential: 'high',
    logo: 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?w=100&h=100&fit=crop',
    issueSize: '₹4,321 Cr',
    revenueGrowth: '110%',
    aiVerdict: 'AI Sentiment: Stellar',
    financialHealth: 'Excellent'
  },
  {
    id: '4',
    name: 'Afcons Infrastructure',
    ticker: 'AFCONS',
    sector: 'Infrastructure',
    priceBand: '₹440 - ₹463',
    lotSize: '32 Shares',
    gmp: '+₹15 (3%)',
    subscription: '2.63x',
    dates: 'Oct 25 - Oct 29',
    status: 'active',
    aiPotential: 'moderate',
    logo: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop',
    issueSize: '₹5,430 Cr',
    revenueGrowth: '12%',
    aiVerdict: 'AI Sentiment: Neutral',
    financialHealth: 'Stable'
  },
  {
    id: '5',
    name: 'Aakash Education',
    ticker: 'AAKASH',
    sector: 'EdTech',
    priceBand: '₹210 - ₹225',
    lotSize: '65 Shares',
    gmp: '+45%',
    subscription: 'Pending',
    dates: 'June 05 - June 08',
    status: 'upcoming',
    aiPotential: 'high',
    logo: 'https://images.unsplash.com/photo-1523050335102-c325091423fc?w=100&h=100&fit=crop',
    issueSize: '₹2,500 Cr',
    revenueGrowth: '22%',
    aiVerdict: 'AI Sentiment: Very Positive',
    financialHealth: 'Good'
  },
  {
    id: '6',
    name: 'NTPC Green Energy',
    ticker: 'NTPCGREEN',
    sector: 'Renewables',
    priceBand: '₹102 - ₹108',
    lotSize: '138 Shares',
    gmp: '+20%',
    subscription: 'Pending',
    dates: 'June 12 - June 15',
    status: 'upcoming',
    aiPotential: 'high',
    logo: 'https://images.unsplash.com/photo-1466611653911-95282ee3656b?w=100&h=100&fit=crop',
    issueSize: '₹10,000 Cr',
    revenueGrowth: 'N/A',
    aiVerdict: 'AI Sentiment: Positive',
    financialHealth: 'State-Backed'
  }
];

export const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  {
    id: '1',
    name: 'Tata Technologies',
    listingDate: 'Nov 30, 2023',
    allotment: '30 Shares',
    listingGain: '+165%',
    currentProfit: '₹28,420',
    type: 'gain',
    initials: 'TT'
  },
  {
    id: '2',
    name: 'IREDA',
    listingDate: 'Nov 29, 2023',
    allotment: '460 Shares',
    listingGain: '+87.5%',
    currentProfit: '₹12,210',
    type: 'gain',
    initials: 'IR'
  },
  {
    id: '3',
    name: 'Mamaearth (Honasa)',
    listingDate: 'Nov 07, 2023',
    allotment: '46 Shares',
    listingGain: '+2.1%',
    currentProfit: '₹1,150',
    type: 'gain',
    initials: 'HM'
  }
];

export const NEWS_ITEMS = [
  {
    id: '1',
    title: 'Solaris Grid Tech IPO Subscribed 1.5x on Day 1',
    excerpt: 'Strong festive demand and growing interest in green energy tech lead to healthy subscription numbers for the Solaris IPO.',
    date: 'Oct 24, 2024',
    category: 'Subscription',
    image: 'https://picsum.photos/seed/news1/400/250'
  },
  {
    id: '2',
    title: 'Upcoming Tech IPOs to Watch in November 2024',
    excerpt: 'A deep dive into the 5 massive tech companies preparing to hit the public markets next month, featuring Zenith Robotics.',
    date: 'Oct 23, 2024',
    category: 'Market Trends',
    image: 'https://picsum.photos/seed/news2/400/250'
  },
  {
    id: '3',
    title: 'Hyperion Semiconductors Hits All-Time High Post-Listing',
    excerpt: 'After a stellar 28% gain on listing day, Hyperion continues its upward trajectory in the secondary market.',
    date: 'Oct 22, 2024',
    category: 'Listing News',
    image: 'https://picsum.photos/seed/news3/400/250'
  },
  {
    id: '4',
    title: 'Seismic Shift: SEC Proposes New Disclosure Rules for IPOs',
    excerpt: 'New guidelines aim to bring more transparency to the "Use of Proceeds" section, potentially impacting future DRHP filings.',
    date: 'Oct 21, 2024',
    category: 'Regulatory',
    image: 'https://picsum.photos/seed/news4/400/250'
  }
];
