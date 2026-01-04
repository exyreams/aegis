"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface WaiverRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  covenantName: string;
  covenantId: string;
}

export function WaiverRequestModal({ isOpen, onClose, covenantName, covenantId }: WaiverRequestModalProps) {
  const [reason, setReason] = useState("");
  const [remedy, setRemedy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !remedy) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Waiver request submitted successfully", {
      description: `Request for ${covenantName} has been sent to the agent.`,
    });

    setIsSubmitting(false);
    setReason("");
    setRemedy("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Covenant Waiver</DialogTitle>
          <DialogDescription>
            Submit a formal waiver request for the breach of <strong>{covenantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="reason">Reason for Breach</Label>
            <Textarea 
              id="reason" 
              placeholder="Explain why the covenant was breached..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="remedy">Proposed Remedy / Plan</Label>
            <Textarea 
              id="remedy" 
              placeholder="Describe user plan to rectify the situation..." 
              value={remedy}
              onChange={(e) => setRemedy(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <div className="grid w-full gap-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mb-2" />
              <div className="text-sm font-medium">Drag & drop files or click to upload</div>
              <div className="text-xs text-muted-foreground mt-1">PDF, Excel, Word (Max 10MB)</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Submitting...
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" /> Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SendIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
