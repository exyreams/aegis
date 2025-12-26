import { NextRequest, NextResponse } from "next/server";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

export async function POST(request: NextRequest) {
  try {
    console.log(
      "API Key check:",
      process.env.CEREBRAS_API_KEY ? "Present" : "Missing"
    );
    console.log(
      "API Key value:",
      process.env.CEREBRAS_API_KEY?.substring(0, 10) + "..."
    );

    // Check if API key is configured
    if (
      !process.env.CEREBRAS_API_KEY ||
      process.env.CEREBRAS_API_KEY === "your-cerebras-api-key-here"
    ) {
      console.log("API key not configured, returning error");
      return NextResponse.json(
        {
          error:
            "Cerebras API key not configured. Please add CEREBRAS_API_KEY to your .env file.",
        },
        { status: 500 }
      );
    }

    console.log("Starting Cerebras client initialization...");

    const cerebras = new Cerebras({
      apiKey: process.env["CEREBRAS_API_KEY"],
    });

    console.log("Cerebras client initialized successfully");

    const body = await request.json();
    const {
      documentType,
      loanAmount,
      interestRate,
      term,
      borrowerName,
      lenderName,
      collateral,
      purpose,
      additionalTerms,
    } = body;

    // Validate required fields
    if (
      !documentType ||
      !loanAmount ||
      !interestRate ||
      !term ||
      !borrowerName ||
      !lenderName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a legal document expert specializing in loan agreements. Generate professional, legally sound loan documents based on the provided parameters. 

Key requirements:
- Use proper legal language and structure
- Include all standard clauses for the document type
- Ensure consistency throughout the document
- Format as a complete, ready-to-use legal document
- Include appropriate sections like definitions, representations, covenants, events of default, etc.
- Use professional formatting with numbered sections and subsections`;

    const userPrompt = `Generate a ${documentType} with the following details:

Loan Details:
- Loan Amount: $${loanAmount.toLocaleString()}
- Interest Rate: ${interestRate}% per annum
- Term: ${term} months
- Borrower: ${borrowerName}
- Lender: ${lenderName}
${collateral ? `- Collateral: ${collateral}` : ""}
${purpose ? `- Purpose: ${purpose}` : ""}

${additionalTerms ? `Additional Terms: ${additionalTerms}` : ""}

Please generate a complete, professional loan document that includes:
1. Title and parties section
2. Definitions
3. Loan terms and conditions
4. Interest and payment terms
5. Representations and warranties
6. Covenants (financial and operational)
7. Events of default
8. Remedies
9. Miscellaneous provisions
10. Signature blocks

Format the document with proper legal structure, numbered sections, and professional language suitable for actual use.`;

    console.log("Starting document generation...");

    let stream;
    try {
      stream = await cerebras.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "zai-glm-4.6",
        stream: true,
        max_completion_tokens: 40960,
        temperature: 0.6,
        top_p: 0.95,
      });

      console.log("Stream created successfully");
    } catch (streamError) {
      console.error("Error creating Cerebras stream:", streamError);
      throw new Error(`Cerebras API error: ${streamError.message}`);
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Document generation error:", error);

    // More detailed error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate document",
        details: errorMessage,
        suggestion: "Please check your Cerebras API key and try again.",
      },
      { status: 500 }
    );
  }
}
