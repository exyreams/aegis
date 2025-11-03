"use client";

import { useState } from "react";

interface ApiTesterProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  defaultBody?: string;
  description?: string;
}

export function ApiTester({
  method,
  endpoint,
  defaultBody = "{}",
  description,
}: ApiTesterProps) {
  const [token, setToken] = useState("");
  const [body, setBody] = useState(defaultBody);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTest = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${baseUrl}${endpoint}`;

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      if (method !== "GET" && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 my-4 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
            method === "GET"
              ? "bg-blue-500/10 text-blue-500"
              : method === "POST"
                ? "bg-green-500/10 text-green-500"
                : method === "PUT"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : method === "DELETE"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-purple-500/10 text-purple-500"
          }`}
        >
          {method}
        </span>
        <code className="text-sm">{endpoint}</code>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Authorization Token (optional)
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer token..."
            className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-mono"
          />
        </div>

        {method !== "GET" && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Request Body (JSON)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-mono"
            />
          </div>
        )}

        <button
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Testing..." : "Test API"}
        </button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        )}

        {response && (
          <div>
            <p className="text-sm font-medium mb-2">Response:</p>
            <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
              <code>{response}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
