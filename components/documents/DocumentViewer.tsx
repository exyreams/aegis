"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { type Document } from "@/lib/documents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  FileText,
  Eye,
  Code,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";

interface DocumentViewerProps {
  document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""
      }`}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Document Content</CardTitle>
              <Badge variant="outline" className="capitalize">
                {document.document_type.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "rendered" ? "raw" : "rendered")
                }
              >
                {viewMode === "rendered" ? (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Raw
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Rendered
                  </>
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created: {formatDate(document.created_at)}</span>
            {document.updated_at !== document.created_at && (
              <span>Updated: {formatDate(document.updated_at)}</span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Additional Document Info */}
          {(document.purpose ||
            document.collateral ||
            document.additional_terms) && (
            <div className="mb-6 space-y-3">
              {document.purpose && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Purpose
                  </h4>
                  <p className="text-sm">{document.purpose}</p>
                </div>
              )}

              {document.collateral && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Collateral
                  </h4>
                  <p className="text-sm">{document.collateral}</p>
                </div>
              )}

              {document.additional_terms && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Additional Terms
                  </h4>
                  <p className="text-sm">{document.additional_terms}</p>
                </div>
              )}

              <Separator />
            </div>
          )}

          {/* Document Content */}
          <div className="space-y-4">
            {viewMode === "rendered" ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-foreground">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-3 text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium mb-2 text-foreground">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 text-foreground leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-foreground">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-3">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3">
                        <code className="text-sm font-mono text-foreground">
                          {children}
                        </code>
                      </pre>
                    ),
                  }}
                >
                  {document.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground overflow-x-auto">
                  {document.content}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
