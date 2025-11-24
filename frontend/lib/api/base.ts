const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_API_URL environment variable is required"
  );
}

export class BaseApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL as string) {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // For Better-Auth, we rely on cookies, not JWT tokens in localStorage
    const baseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge with any additional headers from options
    const headers: HeadersInit = {
      ...baseHeaders,
      ...(options?.headers as Record<string, string>),
    };

    const config: RequestInit = {
      headers,
      credentials: "include", // Include cookies for Better-Auth
      ...options,
    };

    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Only auto-redirect for session endpoint failures
      // For other endpoints, just throw error and let components handle it
      const isSessionEndpoint =
        endpoint.includes("/api/session") || endpoint.includes("/api/auth");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth") &&
        isSessionEndpoint
      ) {
        // Session check failed, redirect to auth
        setTimeout(() => {
          window.location.href = "/auth";
        }, 100);
        throw new Error("Session expired. Please log in again.");
      }

      // For non-auth endpoints, throw error without redirect
      // This could be a permission issue or resource not found
      throw new Error("Unauthorized access");
    }

    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Error handling utility
  handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  }
}
