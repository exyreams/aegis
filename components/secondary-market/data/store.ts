import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoanListing, PortfolioPosition, Order, TradeNotification } from './types';
import MOCK_LOANS from './loans.json';

// Default mock portfolio positions for demo
const MOCK_PORTFOLIO: PortfolioPosition[] = [
  {
    id: "1",
    positionId: "POS-001",
    borrower: "Meridian Holdings PLC",
    originalLender: "Barclays Bank PLC",
    loanAmount: 5000000,
    outstandingAmount: 5000000,
    askingPrice: 5050000,
    yieldToMaturity: 8.65,
    interestRate: 8.25,
    maturityDate: "2028-06-15",
    creditRating: "BB+",
    industry: "Industrial Services",
    riskLevel: "low",
    dueDiligenceScore: 94,
    purchaseDate: "2024-11-15",
    originalAmount: 5000000,
    currentAmount: 5000000,
    purchasePrice: 4950000,
    currentValue: 5050000,
    sharesOwned: 1,
    unrealizedPnL: 100000,
    unrealizedPnLPercent: 2.02,
    covenantStatus: "PASS",
    tradeRiskSignal: "SAFE",
    lastUpdated: "2 mins ago",
    aiAnalysis: "Strong cash flow coverage (2.1x) and stable leverage. Ideal hold for yield.",
    riskFactors: []
  },
  {
    id: "3",
    positionId: "POS-002",
    borrower: "GreenEnergy Corp",
    originalLender: "Lloyds Banking Group",
    loanAmount: 12000000,
    outstandingAmount: 12000000,
    askingPrice: 12240000,
    yieldToMaturity: 9.45,
    interestRate: 9.15,
    maturityDate: "2029-03-20",
    creditRating: "BBB",
    industry: "Renewable Energy",
    riskLevel: "low",
    dueDiligenceScore: 88,
    purchaseDate: "2024-10-20",
    originalAmount: 12000000,
    currentAmount: 12000000,
    purchasePrice: 12120000,
    currentValue: 12240000,
    sharesOwned: 1,
    unrealizedPnL: 120000,
    unrealizedPnLPercent: 0.99,
    covenantStatus: "PASS",
    tradeRiskSignal: "SAFE",
    lastUpdated: "5 mins ago",
    aiAnalysis: "Outperforming renewable sector benchmarks. Regulatory tailwinds strong.",
    riskFactors: []
  },
  {
    id: "5",
    positionId: "POS-003",
    borrower: "Atlantic Manufacturing",
    originalLender: "Santander UK",
    loanAmount: 3500000,
    outstandingAmount: 3500000,
    askingPrice: 3395000,
    yieldToMaturity: 9.85,
    interestRate: 8.95,
    maturityDate: "2027-07-18",
    creditRating: "BB",
    industry: "Manufacturing",
    riskLevel: "medium",
    dueDiligenceScore: 79,
    purchaseDate: "2024-12-01",
    originalAmount: 3500000,
    currentAmount: 3500000,
    purchasePrice: 3465000,
    currentValue: 3395000,
    sharesOwned: 1,
    unrealizedPnL: -70000,
    unrealizedPnLPercent: -2.02,
    covenantStatus: "WARNING",
    tradeRiskSignal: "REVIEW_REQUIRED",
    lastUpdated: "1 hour ago",
    aiAnalysis: "EBITDA margin compression detected. Watch leverage ratio closely next quarter.",
    riskFactors: ["Margin Compression", "Sector Volatility"]
  },
  {
    id: "18",
    positionId: "POS-004",
    borrower: "Alpine Ski Resorts",
    originalLender: "HSBC Bank PLC",
    loanAmount: 2000000,
    outstandingAmount: 2000000,
    askingPrice: 1800000,
    yieldToMaturity: 11.25,
    interestRate: 10.15,
    maturityDate: "2026-10-12",
    creditRating: "B+",
    industry: "Hospitality",
    riskLevel: "high",
    dueDiligenceScore: 71,
    purchaseDate: "2024-09-15",
    originalAmount: 2000000,
    currentAmount: 2000000,
    purchasePrice: 1900000,
    currentValue: 1800000,
    sharesOwned: 1,
    unrealizedPnL: -100000,
    unrealizedPnLPercent: -5.26,
    covenantStatus: "FAIL",
    tradeRiskSignal: "HIGH_RISK",
    lastUpdated: "30 mins ago",
    aiAnalysis: "Covenant breach detected. Recommend exit or restructuring discussion.",
    riskFactors: ["Covenant Breach", "Seasonal Revenue", "High Leverage"]
  }
];

interface MarketState {
  // Data
  listings: LoanListing[];
  portfolio: PortfolioPosition[];
  orders: Order[];
  notifications: TradeNotification[];
  cashBalance: number;
  privateAudits: LoanListing[];
  
  // Actions
  initialize: () => void;
  resetMarket: () => void;
  buyLoan: (listingId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  sellLoan: (listingId: string, amount: number, price: number) => Promise<{ success: boolean; message: string }>;
  runDueDiligence: (listingId: string) => Promise<void>;
  removePosition: (positionId: string) => void;
  addPrivateAudit: (audit: LoanListing) => void;
  renamePrivateAudit: (id: string, newName: string) => void;
  deletePrivateAudit: (id: string) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      listings: MOCK_LOANS as LoanListing[],
      portfolio: MOCK_PORTFOLIO,
      orders: [],
      notifications: [],
      cashBalance: 250000000, // $250M Opening Balance
      privateAudits: [],

      initialize: () => {
        // Hydration logic if needed, usually auto-handled by persist
        if (get().listings.length === 0) {
           set({ listings: MOCK_LOANS as LoanListing[] });
        }
        // Ensure portfolio has mock data
        if (get().portfolio.length === 0) {
           set({ portfolio: MOCK_PORTFOLIO });
        }
      },

      resetMarket: () => {
        set({
          listings: MOCK_LOANS as LoanListing[],
          portfolio: MOCK_PORTFOLIO,
          orders: [],
          notifications: [],
          cashBalance: 250000000,
          privateAudits: [],
        });
      },

      removePosition: (positionId: string) => {
        const { portfolio, notifications } = get();
        const position = portfolio.find(p => p.positionId === positionId);
        
        if (position) {
          const notification: TradeNotification = {
            id: `NOT-${Date.now()}`,
            title: "Position Removed",
            message: `Removed ${position.borrower} from portfolio`,
            type: "info",
            timestamp: Date.now(),
            read: false
          };
          
          set({
            portfolio: portfolio.filter(p => p.positionId !== positionId),
            notifications: [notification, ...notifications]
          });
        }
      },

      buyLoan: async (listingId, amount) => {
        const { listings, cashBalance, portfolio } = get();
        const listing = listings.find(l => l.id === listingId);

        if (!listing) return { success: false, message: "Listing not found" };
        if (amount > cashBalance) return { success: false, message: "Insufficient funds" };
        
        // Calculate purchase details
        const priceRatio = listing.askingPrice / listing.outstandingAmount; // e.g., 0.99
        const cost = amount * priceRatio; 

        // Add to portfolio
        const existingPosition = portfolio.find(p => p.id === listingId);
        let newPortfolio = [...portfolio];

        if (existingPosition) {
           // Update existing position
           newPortfolio = newPortfolio.map(p => 
             p.id === listingId 
               ? { 
                   ...p, 
                   currentAmount: p.currentAmount + amount,
                   purchasePrice: p.purchasePrice + cost,
                   currentValue: (p.currentAmount + amount) * priceRatio // Simplified mark-to-market
                 } 
               : p
           );
        } else {
           // Create new position logic
           const newPosition: PortfolioPosition = {
             ...listing,
             positionId: `POS-${Date.now()}`,
             purchaseDate: new Date().toISOString(),
             originalAmount: amount,
             currentAmount: amount,
             purchasePrice: cost,
             currentValue: cost, // Simplified
             sharesOwned: amount / listing.loanAmount,
             yieldToMaturity: listing.yieldToMaturity,
             unrealizedPnL: 0,
             unrealizedPnLPercent: 0,
             covenantStatus: listing.dueDiligenceScore >= 90 ? "PASS" : listing.dueDiligenceScore >= 75 ? "WARNING" : "FAIL",
             tradeRiskSignal: listing.riskLevel === "low" ? "SAFE" : listing.riskLevel === "medium" ? "REVIEW_REQUIRED" : "HIGH_RISK",
             aiAnalysis: "Position acquired via Transparent Loan Trading platform. Monitoring enabled."
           };
           newPortfolio.push(newPosition);
        }

        // Remove from market or reduce available amount (Simplified: market is deep, listing remains but we track ownership)
        // Ideally we might reduce availability, but for demo "buying" often just means "adding to my portfolio"
        
        // Add Notification
        const notification: TradeNotification = {
            id: `NOT-${Date.now()}`,
            title: "Trade Executed",
            message: `Successfully purchased ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)} of ${listing.borrower}`,
            type: "success",
            timestamp: Date.now(),
            read: false
        };

        set({
            portfolio: newPortfolio,
            cashBalance: cashBalance - cost,
            notifications: [notification, ...get().notifications]
        });

        return { success: true, message: "Trade executed successfully" };
      },

      sellLoan: async (listingId, amount, price) => {
          // Implementation for selling
          return { success: true, message: "Order placed" };
      },
      
      runDueDiligence: async (listingId) => {
          // Updates the 'viewed' or 'audited' state if we track that
      },

      addPrivateAudit: (audit) => {
        set((state) => ({
          privateAudits: [audit, ...state.privateAudits]
        }));
      },

      renamePrivateAudit: (id, newName) => {
        set((state) => ({
          privateAudits: state.privateAudits.map(a => 
            a.id === id ? { ...a, borrower: newName } : a
          )
        }));
      },

      deletePrivateAudit: (id) => {
        set((state) => ({
          privateAudits: state.privateAudits.filter(a => a.id !== id)
        }));
      }

    }),
    {
      name: 'market-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
