"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRightLeft, Wallet, AlertTriangle } from "lucide-react";
import { useMarketStore } from "../data/store";
import { LoanListing } from "../data/types";
import { toast } from "sonner";
import { formatCurrency } from "../data/portfolio"; // Helper or reimplement
import { useRouter } from "next/navigation";

interface TradeExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: LoanListing;
}

type TradeStep = "input" | "compliance" | "smart_contract" | "settlement" | "complete";

export function TradeExecutionModal({ open, onOpenChange, listing }: TradeExecutionModalProps) {
  const router = useRouter();
  const buyLoan = useMarketStore((state) => state.buyLoan);
  const cashBalance = useMarketStore((state) => state.cashBalance);
  
  const [step, setStep] = useState<TradeStep>("input");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTrade = async () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!numAmount || numAmount <= 0) {
        toast.error("Invalid amount");
        return;
    }
    
    setIsProcessing(true);
    setStep("compliance");

    // Simulate "Smart Contract" Steps
    setTimeout(() => setStep("smart_contract"), 1500);
    setTimeout(() => setStep("settlement"), 3000);
    setTimeout(async () => {
        const result = await buyLoan(listing.id, numAmount);
        if (result.success) {
            setStep("complete");
            toast.success("Trade Settled on-chain", {
                description: `Acquired ${formatCurrency(numAmount)} of ${listing.tickerSymbol || listing.borrower}`
            });
        } else {
            setStep("input");
            toast.error("Trade Failed", { description: result.message });
        }
        setIsProcessing(false);
    }, 4500);
  };

  const reset = () => {
      setStep("input");
      setAmount("");
      onOpenChange(false);
      // Optional: Redirect to portfolio
      if (step === 'complete') {
          router.push('/dashboard/secondary-market/portfolio');
      }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isProcessing && reset()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trade Execution: {listing.tickerSymbol || "LOAN"}</DialogTitle>
          <DialogDescription>
             Secondary Market / {listing.borrower}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
            {/* Progress Bar */}
            {step !== "input" && (
                <div className="flex justify-between items-start mb-8 px-4">
                    <StepIndicator current={step} id="compliance" label="KYC/AML Check" icon={ShieldCheck} />
                    <div className="h-0.5 flex-1 bg-border mt-5 mx-2" />
                    <StepIndicator current={step} id="smart_contract" label="DeepLink Escrow" icon={Wallet} />
                    <div className="h-0.5 flex-1 bg-border mt-5 mx-2" />
                    <StepIndicator current={step} id="settlement" label="Token Transfer" icon={ArrowRightLeft} />
                </div>
            )}

            {step === "input" && (
                <div className="space-y-4">
                    <div className="p-4 bg-muted/40 rounded-lg border space-y-2">
                        <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground">Available Balance</span>
                             <span className="font-mono font-medium">{formatCurrency(cashBalance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground">Ask Price</span>
                             <span className="font-mono font-medium">{(listing.askingPrice / listing.outstandingAmount * 100).toFixed(2)}% (Par)</span>
                        </div>
                    </div>
                
                    <div className="space-y-2">
                        <Label>Investment Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input 
                                placeholder="Min $10,000" 
                                className="pl-7 font-mono text-lg" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Estimated shares: {amount ? (parseFloat(amount) / listing.loanAmount * 100).toFixed(4) : "0.00"}% of tranche
                        </p>
                    </div>

                     {listing.riskLevel === 'high' && (
                        <div className="flex gap-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md text-sm items-start">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p><strong>High Risk Warning:</strong> This asset has failed recent covenant checks. Verify before trading.</p>
                        </div>
                    )}
                </div>
            )}

            {step === "complete" && (
                <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Settlement Confirmed</h3>
                        <p className="text-muted-foreground">Ownership has been transferred to your wallet.</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg font-mono text-xs text-muted-foreground break-all">
                        Tx Hash: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                    </div>
                </div>
            )}
            
            {(step === "compliance" || step === "smart_contract" || step === "settlement") && (
                 <div className="text-center py-10">
                     <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                     <p className="text-lg font-medium animate-pulse">
                         {step === "compliance" && "Verifying Investor Accredited Status..."}
                         {step === "smart_contract" && "Locking Funds in Escrow..."}
                         {step === "settlement" && "Swapping Loan Tokens..."}
                     </p>
                 </div>
            )}
        </div>

        <DialogFooter className="sm:justify-between">
           {step === "input" && (
               <>
                 <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                 <Button onClick={handleTrade} className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
                    Confirm Trade
                 </Button>
               </>
           )}
           {step === "complete" && (
               <Button onClick={reset} className="w-full">
                   View in Portfolio
               </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const StepIndicator = ({ current, id, label, icon: Icon }: { current: string; id: string; label: string; icon: React.ElementType }) => {
    const steps = ["compliance", "smart_contract", "settlement", "complete"];
    const isCompleted = steps.indexOf(current) > steps.indexOf(id);
    const isActive = current === id;
    
    return (
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                isActive ? 'border-primary text-primary animate-pulse' : 'border-muted text-muted-foreground'
            }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            <span className="text-xs font-medium text-center max-w-[80px] leading-tight">{label}</span>
        </div>
    )
 };
