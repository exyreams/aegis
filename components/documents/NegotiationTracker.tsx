"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Plus,
  Edit3,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface NegotiationComment {
  id: string;
  author: string;
  role: "borrower" | "lender" | "advisor";
  content: string;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected" | "discussion";
  section?: string;
  originalText?: string;
  proposedText?: string;
}

interface NegotiationChange {
  id: string;
  section: string;
  field: string;
  originalValue: string;
  proposedValue: string;
  proposedBy: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: Date;
  reason?: string;
}

interface NegotiationTrackerProps {
  documentId: string;
  currentUser: {
    name: string;
    role: "borrower" | "lender" | "advisor";
  };
  onChangeAccepted?: (change: NegotiationChange) => void;
  onChangeRejected?: (change: NegotiationChange) => void;
}

export function NegotiationTracker({
  documentId,
  currentUser,
  onChangeAccepted,
  onChangeRejected,
}: NegotiationTrackerProps) {
  const [comments, setComments] = useState<NegotiationComment[]>([]);
  const [changes, setChanges] = useState<NegotiationChange[]>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"comments" | "changes">(
    "comments"
  );

  // Mock data - in real implementation, this would come from your backend
  useEffect(() => {
    // Simulate loading negotiation data
    const mockComments: NegotiationComment[] = [
      {
        id: "1",
        author: "John Smith",
        role: "lender",
        content:
          "The interest rate seems high for this type of loan. Can we discuss reducing it to 4.5%?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "discussion",
        section: "Interest Rate",
      },
      {
        id: "2",
        author: "Acme Corp",
        role: "borrower",
        content:
          "We can accept 4.75% given our strong credit history and collateral.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: "pending",
        section: "Interest Rate",
      },
    ];

    const mockChanges: NegotiationChange[] = [
      {
        id: "1",
        section: "Loan Terms",
        field: "Interest Rate",
        originalValue: "5.0%",
        proposedValue: "4.75%",
        proposedBy: "Acme Corp",
        status: "pending",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        reason: "Competitive rate based on credit profile",
      },
      {
        id: "2",
        section: "Payment Terms",
        field: "Payment Frequency",
        originalValue: "Monthly",
        proposedValue: "Quarterly",
        proposedBy: "Acme Corp",
        status: "rejected",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        reason: "Quarterly payments increase risk",
      },
    ];

    setComments(mockComments);
    setChanges(mockChanges);
  }, [documentId]);

  const addComment = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const comment: NegotiationComment = {
      id: Date.now().toString(),
      author: currentUser.name,
      role: currentUser.role,
      content: newComment,
      timestamp: new Date(),
      status: "discussion",
      section: selectedSection || undefined,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Comment added");
  };

  const handleChangeStatus = (
    changeId: string,
    status: "accepted" | "rejected"
  ) => {
    const change = changes.find((c) => c.id === changeId);
    if (!change) return;

    const updatedChange = { ...change, status };
    setChanges(changes.map((c) => (c.id === changeId ? updatedChange : c)));

    if (status === "accepted") {
      onChangeAccepted?.(updatedChange);
      toast.success("Change accepted");
    } else {
      onChangeRejected?.(updatedChange);
      toast.success("Change rejected");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "lender":
        return "bg-blue-100 text-blue-800";
      case "borrower":
        return "bg-green-100 text-green-800";
      case "advisor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Negotiation Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant={activeTab === "comments" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("comments")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({comments.length})
            </Button>
            <Button
              variant={activeTab === "changes" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("changes")}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Changes ({
                changes.filter((c) => c.status === "pending").length
              }{" "}
              pending)
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {changes.filter((c) => c.status === "accepted").length}
              </div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {changes.filter((c) => c.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {changes.filter((c) => c.status === "rejected").length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Comment/Change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeTab === "comments" ? "Add Comment" : "Propose Change"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select document section (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loan-terms">Loan Terms</SelectItem>
                <SelectItem value="interest-rate">Interest Rate</SelectItem>
                <SelectItem value="payment-terms">Payment Terms</SelectItem>
                <SelectItem value="collateral">Collateral</SelectItem>
                <SelectItem value="covenants">Covenants</SelectItem>
                <SelectItem value="default-events">
                  Events of Default
                </SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder={
                activeTab === "comments"
                  ? "Enter your comment or question..."
                  : "Describe the change you'd like to propose..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-20"
            />

            <Button onClick={addComment} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {activeTab === "comments" ? "Add Comment" : "Propose Change"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <Card>
          <CardHeader>
            <CardTitle>Discussion Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-3 p-4 rounded-lg border"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getRoleColor(comment.role)}>
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRoleColor(comment.role)}`}
                        >
                          {comment.role}
                        </Badge>
                        {comment.section && (
                          <Badge variant="secondary" className="text-xs">
                            {comment.section}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-foreground mb-2">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(comment.status)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {comment.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {comments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet. Start the discussion!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <Card>
          <CardHeader>
            <CardTitle>Proposed Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {changes.map((change) => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{change.section}</Badge>
                        <Badge
                          variant={
                            change.status === "accepted"
                              ? "default"
                              : change.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {change.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(change.timestamp)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="text-sm">
                        <span className="font-medium">{change.field}:</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-2 bg-red-50 border border-red-200 rounded">
                          <div className="text-xs text-red-600 font-medium mb-1">
                            Original
                          </div>
                          <div className="text-sm line-through text-red-800">
                            {change.originalValue}
                          </div>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs text-green-600 font-medium mb-1">
                            Proposed
                          </div>
                          <div className="text-sm text-green-800">
                            {change.proposedValue}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Proposed by {change.proposedBy}
                        {change.reason && (
                          <span className="block mt-1">
                            Reason: {change.reason}
                          </span>
                        )}
                      </div>

                      {change.status === "pending" &&
                        currentUser.role !== "borrower" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleChangeStatus(change.id, "accepted")
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleChangeStatus(change.id, "rejected")
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {changes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changes proposed yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
