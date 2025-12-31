import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, documentType } = body;

    // Validate required fields
    if (!content || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields: content and documentType" },
        { status: 400 }
      );
    }

    // Create a readable stream for the response with mock analysis
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Simulate progressive analysis with realistic timing
          const steps = [
            { progress: 10, message: "Scanning document structure..." },
            { progress: 25, message: "Analyzing financial terms..." },
            { progress: 40, message: "Checking for inconsistencies..." },
            { progress: 60, message: "Evaluating risk factors..." },
            { progress: 80, message: "Reviewing compliance..." },
            { progress: 95, message: "Finalizing analysis..." },
          ];

          for (const step of steps) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ progress: step.progress })}\n\n`
              )
            );
            await new Promise((resolve) => setTimeout(resolve, 400));
          }

          // Generate mock analysis result based on document type and content
          const mockAnalysisResult = generateMockAnalysis(
            documentType,
            content
          );

          // Send final result
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                progress: 100,
                result: mockAnalysisResult,
              })}\n\n`
            )
          );

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Analysis error:", error);
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
    console.error("Document analysis error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to analyze document",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

function generateMockAnalysis(documentType: string, content: string) {
  // Generate realistic mock data based on document type and content analysis
  const contentLength = content.length;
  const hasNumbers = /\d+/.test(content);
  const hasPercentages = /%/.test(content);
  const hasAmounts = /\$|USD|amount/i.test(content);

  // Base score calculation
  let baseScore = 75;
  if (contentLength > 1000) baseScore += 5;
  if (hasNumbers && hasPercentages && hasAmounts) baseScore += 10;

  const inconsistencies = [];
  const riskFactors = [];
  const complianceIssues = [];

  // Generate inconsistencies based on document analysis
  if (documentType === "loan_agreement") {
    if (hasAmounts && hasPercentages) {
      inconsistencies.push({
        type: "financial",
        severity: "medium",
        description:
          "Interest rate calculation may need verification against stated loan amount",
        location: "Section 3: Payment Terms",
        suggestion:
          "Verify that monthly payment calculations match the stated interest rate and principal amount",
      });
    }

    if (contentLength < 500) {
      inconsistencies.push({
        type: "legal",
        severity: "high",
        description:
          "Document appears incomplete - missing standard loan agreement clauses",
        location: "Overall document structure",
        suggestion:
          "Add standard clauses for events of default, representations, and warranties",
      });
      baseScore -= 15;
    }

    riskFactors.push({
      category: "credit",
      level: "medium",
      description: "Limited borrower qualification information provided",
      mitigation:
        "Request additional financial statements, credit reports, and references",
    });

    if (!content.toLowerCase().includes("collateral")) {
      riskFactors.push({
        category: "legal",
        level: "high",
        description: "No collateral or security provisions identified",
        mitigation:
          "Consider adding collateral requirements or personal guarantees to secure the loan",
      });
      baseScore -= 10;
    }
  }

  if (documentType === "promissory_note") {
    if (!hasAmounts) {
      inconsistencies.push({
        type: "financial",
        severity: "high",
        description: "Principal amount not clearly specified",
        location: "Document header",
        suggestion:
          "Clearly state the principal loan amount in both numbers and words",
      });
      baseScore -= 20;
    }

    riskFactors.push({
      category: "operational",
      level: "low",
      description:
        "Simple promissory note structure may lack enforcement mechanisms",
      mitigation:
        "Consider upgrading to a more comprehensive loan agreement for larger amounts",
    });
  }

  // Common compliance issues
  if (
    !content.toLowerCase().includes("truth in lending") &&
    !content.toLowerCase().includes("tila")
  ) {
    complianceIssues.push({
      regulation: "Truth in Lending Act (TILA)",
      issue: "TILA disclosure requirements may not be fully addressed",
      recommendation:
        "Ensure APR and finance charges are prominently disclosed in required format",
    });
  }

  if (!content.toLowerCase().includes("equal credit opportunity")) {
    complianceIssues.push({
      regulation: "Equal Credit Opportunity Act (ECOA)",
      issue: "ECOA compliance notice not found",
      recommendation:
        "Include required ECOA notice regarding discrimination in lending",
    });
  }

  // Additional realistic inconsistencies
  if (content.includes("monthly") && content.includes("quarterly")) {
    inconsistencies.push({
      type: "temporal",
      severity: "medium",
      description: "Conflicting payment frequency terms found",
      location: "Payment schedule section",
      suggestion:
        "Clarify whether payments are monthly or quarterly throughout the document",
    });
  }

  // Generate some positive findings too
  if (contentLength > 1000 && hasAmounts && hasPercentages) {
    baseScore += 5;
  }

  return {
    inconsistencies,
    riskFactors,
    complianceIssues,
    overallScore: Math.min(
      100,
      Math.max(0, baseScore + Math.floor(Math.random() * 10) - 5)
    ),
    processingTime: Math.round((Math.random() * 2 + 1.5) * 10) / 10, // 1.5-3.5 seconds
  };
}
