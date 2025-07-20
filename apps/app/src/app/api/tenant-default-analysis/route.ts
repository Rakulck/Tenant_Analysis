import { NextRequest, NextResponse } from "next/server";
import { TenantDefaultAnalyzer } from "@/lib/analyzers/TenantDefaultAnalyzer";
import type { DocumentFile } from "@/lib/types/documents";
import type { TenantDefaultAnalysisRequest } from "@/lib/types/tenant-default-analysis";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("[API] Tenant default analysis request received");
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("rentRoll") as File;
    
    if (!file) {
      console.error("[API] No file provided in request");
      return NextResponse.json(
        { error: "No rent roll file provided" },
        { status: 400 }
      );
    }

    console.log(`[API] Processing file: ${file.name} (${file.size} bytes)`);

    // Extract analysis parameters
    const propertyName = formData.get("propertyName") as string;
    const propertyAddress = formData.get("propertyAddress") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const includeWebSearch = formData.get("includeWebSearch") === "true";
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    // Build analysis request
    const analysisRequest: TenantDefaultAnalysisRequest = {
      propertyName: propertyName || null,
      propertyAddress: propertyAddress || null,
      analysisDate: new Date().toISOString(),
      includeWebSearch,
      searchLocation: city && state ? {
        city,
        state,
        zipCode: zipCode || null,
        country: "US",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      } : null,
    };

    console.log("[API] Analysis request parameters:", {
      propertyName,
      propertyAddress,
      location: analysisRequest.searchLocation,
      includeWebSearch,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate file size (25MB limit)
    const maxFileSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxFileSize) {
      console.error(`[API] File too large: ${file.size} bytes (max: ${maxFileSize})`);
      return NextResponse.json(
        { error: `File size too large. Maximum allowed size is 25MB.` },
        { status: 400 }
      );
    }

    // Create document file object
    const documentFile: DocumentFile = {
      file,
      metadata: {
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.type,
        fileName: file.name,
      },
    };

    // Initialize the analyzer
    const analyzer = new TenantDefaultAnalyzer();
    
    console.log("[API] Starting analysis with TenantDefaultAnalyzer");
    
    // Perform the analysis
    const analysisResult = await analyzer.analyzeRentRollForDefaults(
      documentFile,
      analysisRequest
    );

    const processingTime = Date.now() - startTime;

    console.log(`[API] Analysis completed successfully in ${processingTime}ms:`, {
      tenantsAnalyzed: analysisResult.tenantAssessments.length,
      totalAtRisk: analysisResult.overallRiskSummary.totalAtRiskTenants,
      avgRiskProbability: analysisResult.overallRiskSummary.averageDefaultProbability,
      processingTimeMs: processingTime
    });

    // Return the analysis result
    return NextResponse.json({
      ...analysisResult,
      processingTimeMs: processingTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`[API] Analysis failed after ${processingTime}ms:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed due to an unknown error",
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Tenant Default Analysis API",
      supportedMethods: ["POST"],
      supportedFileTypes: [".pdf", ".xlsx", ".xls", ".csv"],
      maxFileSize: "25MB",
      version: "1.0.0",
    },
    { status: 200 }
  );
} 