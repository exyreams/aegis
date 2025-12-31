import { Mistral } from "@mistralai/mistralai";

// Initialize Mistral client
const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

export interface DocumentAnalysisResult {
  loanAmount: number;
  currency: string;
  interestRate: number;
  margin?: number;
  baseRate?: string;
  term: number;
  maturityDate?: string;
  borrower: string;
  lender: string;
  facilityType: string;
  purpose?: string;
  covenants: Array<{
    type: string;
    description: string;
    threshold: string;
    testDate: string;
    status?: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  fees?: Array<{
    type: string;
    amount?: number;
    percentage?: number;
  }>;
  confidence: number;
  extractedText?: string;
}

export async function analyzeDocument(
  file: File,
  documentType: string,
  extractionMode: "regulatory" | "institutional" | "comprehensive"
): Promise<DocumentAnalysisResult> {
  try {
    // Step 1: Upload file and get document URL (you'll need to implement file upload)
    const documentUrl = await uploadFileToStorage(file);

    // Step 2: Process document with Mistral OCR using data URL format
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: documentUrl, // Already in data:application/pdf;base64,... format
      },
      includeImageBase64: true,
    });

    // Step 3: Extract text from OCR response
    const extractedText = extractOCRText(ocrResponse);

    // Step 4: Analyze extracted text with Mistral Chat
    const analysisPrompt = createAnalysisPrompt(
      extractedText,
      documentType,
      extractionMode
    );

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    // Step 5: Parse and return results
    const messageContent = chatResponse.choices[0].message.content;
    const contentText = Array.isArray(messageContent)
      ? messageContent
          .map((chunk) => {
            if ("text" in chunk) return chunk.text || "";
            return "";
          })
          .join("")
      : messageContent || "{}";

    const analysisResult = JSON.parse(contentText);

    return {
      ...analysisResult,
      confidence: calculateConfidence(analysisResult),
      extractedText: extractedText,
    };
  } catch (error) {
    console.error("Mistral document analysis failed:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
}

// Helper function to upload file to a storage service (implement based on your needs)
async function uploadFileToStorage(file: File): Promise<string> {
  // Convert file to base64 data URL format for Mistral OCR
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(`data:${file.type};base64,${base64String}`);
    };
    reader.readAsDataURL(file);
  });

  // Alternative: Upload to your storage service
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/upload', { method: 'POST', body: formData });
  // const { url } = await response.json();
  // return url;
}

// Extract text from Mistral OCR response
function extractOCRText(ocrResponse: unknown): string {
  try {
    // Extract text from OCR response structure
    // This depends on Mistral's OCR response format
    const response = ocrResponse as Record<string, unknown>;

    if (response.text && typeof response.text === "string") {
      return response.text;
    }

    if (Array.isArray(response.pages)) {
      return response.pages
        .map((page: unknown) => {
          const pageObj = page as Record<string, unknown>;
          return (pageObj.text as string) || "";
        })
        .join("\n\n");
    }

    // Fallback: stringify the response to extract any text
    return JSON.stringify(ocrResponse);
  } catch (error) {
    console.error("Failed to extract OCR text:", error);
    return "Failed to extract text from document";
  }
}

function createAnalysisPrompt(
  extractedText: string,
  documentType: string,
  extractionMode: string
): string {
  const basePrompt = `
You are an expert financial document analyst specializing in loan agreement data extraction and standardization. 
Your goal is to transform complex legal loan documents into structured, standardized digital data that enables:
- Interoperability between disparate banking systems
- Comparison between different loans
- Querying and reporting across loan portfolios
- Industry-wide data standardization

DOCUMENT TEXT:
${extractedText}

DOCUMENT TYPE: ${documentType}

CRITICAL INSTRUCTIONS:
1. Extract ALL key loan terms, parties, and financial data
2. Identify and categorize financial covenants with precise thresholds
3. Standardize data formats (dates as YYYY-MM-DD, amounts as numbers, rates as decimals)
4. Ensure data consistency for cross-loan comparison
5. Return ONLY valid JSON, no other text

STANDARDIZED JSON STRUCTURE:
{
  "loanAmount": number (in base currency units),
  "currency": "string (ISO 4217 3-letter code)",
  "interestRate": number (as decimal, e.g., 0.0475 for 4.75%),
  "margin": number (basis points over base rate),
  "baseRate": "string (SOFR, LIBOR, etc.)",
  "term": number (months),
  "maturityDate": "YYYY-MM-DD",
  "borrower": "string (standardized entity name)",
  "lender": "string (standardized entity name)", 
  "facilityType": "string (standardized facility type)",
  "purpose": "string (loan purpose)",
  "covenants": [
    {
      "type": "financial|operational|reporting|information",
      "description": "string (covenant description)",
      "threshold": "string (exact threshold value)",
      "testDate": "string (testing frequency)",
      "status": "Active|Inactive|Suspended",
      "severity": "low|medium|high|critical"
    }
  ],
  "fees": [
    {
      "type": "string (fee type)",
      "amount": number (if fixed amount),
      "percentage": number (if percentage, as decimal)"
    }
  ],
  "securityPackage": {
    "secured": boolean,
    "collateralTypes": ["string array of collateral types"],
    "guarantors": ["string array of guarantor names"]
  },
  "keyDates": {
    "signatureDate": "YYYY-MM-DD",
    "drawdownDate": "YYYY-MM-DD", 
    "firstPaymentDate": "YYYY-MM-DD",
    "maturityDate": "YYYY-MM-DD"
  }
}

STANDARDIZATION REQUIREMENTS:
- Use consistent naming conventions for entities
- Normalize facility types (e.g., "Term Loan A", "Revolving Credit Facility")
- Standardize covenant types and descriptions
- Ensure all financial amounts are in base currency units
- Use ISO standards where applicable (currency codes, country codes)
`;

  if (extractionMode === "regulatory") {
    return (
      basePrompt +
      `
REGULATORY FOCUS - Additional Requirements:
- Extract Basel III relevant metrics and risk weightings
- Identify regulatory capital requirements and ratios
- Find compliance obligations and reporting requirements
- Note any regulatory exemptions or special provisions
- Include jurisdiction-specific regulatory data

Additional JSON fields for regulatory mode:
"regulatoryData": {
  "riskWeighting": number,
  "capitalRequirement": number,
  "regulatoryReporting": ["array of reporting requirements"],
  "jurisdiction": "string",
  "applicableRegulations": ["array of regulations"]
}
`
    );
  }

  if (extractionMode === "comprehensive") {
    return (
      basePrompt +
      `
COMPREHENSIVE ANALYSIS - Additional Requirements:
- Extract ESG-related clauses and sustainability metrics
- Identify market standard deviations and unusual terms
- Analyze pricing competitiveness vs market benchmarks
- Note innovation features or non-standard structures
- Include relationship banking elements

Additional JSON fields for comprehensive mode:
"esgProvisions": {
  "sustainabilityLinked": boolean,
  "esgCovenants": ["array of ESG-related covenants"],
  "greenLoanFeatures": ["array of green loan elements"]
},
"marketAnalysis": {
  "pricingVsMarket": "above|at|below market",
  "unusualTerms": ["array of non-standard provisions"],
  "innovativeFeatures": ["array of innovative elements"]
}
`
    );
  }

  return basePrompt;
}

function calculateConfidence(result: Record<string, unknown>): number {
  let confidence = 0;

  // Core fields present
  if (result.loanAmount) confidence += 20;
  if (result.interestRate) confidence += 20;
  if (result.borrower) confidence += 15;
  if (result.lender) confidence += 15;
  if (result.term) confidence += 10;

  // Additional fields
  if (Array.isArray(result.covenants) && result.covenants.length > 0)
    confidence += 10;
  if (Array.isArray(result.fees) && result.fees.length > 0) confidence += 5;
  if (result.maturityDate) confidence += 5;

  return Math.min(confidence, 99);
}

// Helper function to validate API key
export function validateMistralConfig(): boolean {
  return !!process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
}

export async function analyzeDocumentDirect(
  file: File,
  documentType: string,
  extractionMode: "regulatory" | "institutional" | "comprehensive"
): Promise<DocumentAnalysisResult> {
  try {
    // Convert file to data URL format for Mistral OCR
    const dataUrl = await fileToBase64(file);

    // Process with Mistral OCR using data URL format
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: dataUrl, // data:application/pdf;base64,... format
      },
      includeImageBase64: true,
    });

    // Continue with analysis...
    const extractedText = extractOCRText(ocrResponse);
    const analysisPrompt = createAnalysisPrompt(
      extractedText,
      documentType,
      extractionMode
    );

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: analysisPrompt }],
      responseFormat: { type: "json_object" },
    });

    const messageContent = chatResponse.choices[0].message.content;
    const contentText = Array.isArray(messageContent)
      ? messageContent
          .map((chunk) => {
            if ("text" in chunk) return chunk.text || "";
            return "";
          })
          .join("")
      : messageContent || "{}";

    const analysisResult = JSON.parse(contentText);

    return {
      ...analysisResult,
      confidence: calculateConfidence(analysisResult),
      extractedText: extractedText,
    };
  } catch (error) {
    console.error("Mistral direct analysis failed:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(`data:${file.type};base64,${base64String}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
