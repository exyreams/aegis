import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoanListing, PortfolioPosition, Order, TradeNotification } from './types';
import { MOCK_LOANS } from './mock-data';

interface MarketState {
  // Data
  listings: LoanListing[];
  portfolio: PortfolioPosition[];
  orders: Order[];
  notifications: TradeNotification[];
  cashBalance: number;
  
  // Actions
  initialize: () => void;
  resetMarket: () => void;
  buyLoan: (listingId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  sellLoan: (listingId: string, amount: number, price: number) => Promise<{ success: boolean; message: string }>;
  runDueDiligence: (listingId: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      listings: MOCK_LOANS,
      portfolio: [],
      orders: [],
      notifications: [],
      cashBalance: 250000000, // $250M Opening Balance

      initialize: () => {
        // Hydration logic if needed, usually auto-handled by persist
        if (get().listings.length === 0) {
           set({ listings: MOCK_LOANS });
        }
      },

      resetMarket: () => {
        set({
          listings: MOCK_LOANS,
          portfolio: [],
          orders: [],
          notifications: [],
          cashBalance: 250000000
        });
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
      }

    }),
    {
      name: 'market-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
