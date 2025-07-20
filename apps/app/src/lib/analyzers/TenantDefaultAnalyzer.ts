import type { DocumentFile } from "../types/documents";
import { BaseDocumentAnalyzer } from "./base";
import type {
  TenantDefaultAnalysisRequest,
  TenantDefaultAnalysisResponse,
} from "../types/tenant-default-analysis";
import {
  MacroeconomicContextSchema,
  TenantDefaultAnalysisResponseSchema,
} from "../types/tenant-default-analysis";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";

type MacroeconomicSearchResult = z.infer<typeof MacroeconomicContextSchema>;

export class TenantDefaultAnalyzer extends BaseDocumentAnalyzer {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  getSupportedDocumentType(): string {
    return "rent_roll";
  }

  async analyzeRentRollForDefaults(
    document: DocumentFile,
    request: TenantDefaultAnalysisRequest,
  ): Promise<TenantDefaultAnalysisResponse> {
    const startTime = Date.now();

    console.log(`[ANALYZER] Starting tenant default analysis for file: ${document.file.name}`);
    console.log("[ANALYZER] Request details:", {
      propertyName: request.propertyName,
      propertyAddress: request.propertyAddress,
      includeWebSearch: request.includeWebSearch,
      searchLocation: request.searchLocation,
    });

    try {
      // Validate file type
      console.log(`[ANALYZER] Validating file type: ${document.file.type}`);
      this.validateSupportedFileType(document.file);

      // Phase 1: Gather macroeconomic context if web search is enabled
      let macroeconomicContext: MacroeconomicSearchResult | null = null;
      if (request.includeWebSearch) {
        console.log("[ANALYZER] Phase 1: Starting web search for macroeconomic data");
        try {
          macroeconomicContext = await this.gatherMacroeconomicData(request);
          console.log("[ANALYZER] Web search completed successfully:", macroeconomicContext);
        } catch (error) {
          console.error(
            "[ANALYZER] Web search failed, aborting analysis as web search was requested:",
            error,
          );
          throw new Error(
            `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}. Analysis aborted as web search was required.`,
          );
        }
      } else {
        console.log("[ANALYZER] Skipping web search (disabled by request)");
      }

      // Phase 2: Send entire file + context to LLM for complete analysis
      console.log("[ANALYZER] Phase 2: Starting LLM analysis");
      const analysisResponse = await this.analyzeWithLLM(document, request, macroeconomicContext);

      console.log("[ANALYZER] LLM analysis completed:", {
        tenantsAnalyzed: analysisResponse.tenantAssessments.length,
        overallRisk: analysisResponse.overallRiskSummary,
        recommendedActions: analysisResponse.recommendedActions.length,
      });

      const processingTime = Date.now() - startTime;

      return {
        ...analysisResponse,
        processingTimeMs: processingTime,
        propertyInfo: {
          ...analysisResponse.propertyInfo,
          propertyName: request.propertyName,
          propertyAddress: request.propertyAddress,
          analysisDate: request.analysisDate,
        },
      };
    } catch (error) {
      console.error(`[ANALYZER] Analysis failed after ${Date.now() - startTime}ms:`, {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fileName: document.file.name,
        fileSize: document.file.size,
      });
      throw new Error(
        `Failed to analyze rent roll: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private validateSupportedFileType(file: File): void {
    const supportedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv",
      "application/vnd.apple.numbers", // Apple Numbers
    ];

    const supportedExtensions = [".pdf", ".xlsx", ".xls", ".csv", ".numbers"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    const isTypeSupported = supportedTypes.includes(file.type);
    const isExtensionSupported = supportedExtensions.includes(fileExtension);

    if (!isTypeSupported && !isExtensionSupported) {
      throw new Error(
        `Unsupported file type: ${file.type}. Please upload PDF, Excel (.xlsx, .xls), CSV, or Apple Numbers files only.`,
      );
    }
  }

  private async gatherMacroeconomicData(
    request: TenantDefaultAnalysisRequest,
  ): Promise<MacroeconomicSearchResult> {
    const location = request.searchLocation
      ? `${request.searchLocation.city}, ${request.searchLocation.state}`
      : "the property location";

    console.log(`[ANALYZER] Building search query for location: ${location}`);
    const searchQuery = this.buildSearchQuery(request, location);
    console.log("[ANALYZER] Executing web search with OpenAI gpt-4o-search-preview...");

    try {
      const searchCompletion = await TenantDefaultAnalyzer.openai.chat.completions.parse({
        model: "gpt-4o-search-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a real estate market analyst. Search for and analyze current economic data that could affect tenant default risk. Provide structured, accurate data based on your web search results.",
          },
          {
            role: "user",
            content: searchQuery,
          },
        ],
        web_search_options: {
          search_context_size: "medium",
        },
        response_format: zodResponseFormat(MacroeconomicContextSchema, "macroeconomic_context"),
      });

      const parsed = searchCompletion.choices[0]?.message?.parsed;

      if (!parsed) {
        console.error("[ANALYZER] Web search parsing failed - no parsed data returned");
        throw new Error("Failed to parse macroeconomic search results");
      }

      console.log("[ANALYZER] Web search parsing successful");
      return parsed;
    } catch (error) {
      console.error("[ANALYZER] Web search failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        location,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private buildSearchQuery(request: TenantDefaultAnalysisRequest, location: string): string {
    return `Search for current economic conditions and tenant default risk factors in ${location}:

1. Local, city, and state unemployment rates for ${location}
2. Median income data for ${location} area
3. Rent growth rates and vacancy rates in ${location}
4. Recent major employer layoffs or closures in ${location}
5. Economic indicators affecting residential tenants in ${location}
6. Seasonal employment patterns affecting ${location}
7. Industry trends impacting local employment

Focus on data from the last 3 months that could impact tenant ability to pay rent.`;
  }

  private async analyzeWithLLM(
    document: DocumentFile,
    request: TenantDefaultAnalysisRequest,
    macroeconomicContext: MacroeconomicSearchResult | null,
  ): Promise<TenantDefaultAnalysisResponse> {
    console.log("[ANALYZER] Preparing LLM analysis prompts...");
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildAnalysisPrompt(request, macroeconomicContext);

    // Upload file to OpenAI for analysis
    console.log(
      `[ANALYZER] Uploading file to OpenAI: ${document.file.name} (${document.file.size} bytes)`,
    );
    const uploadedFile = await this.uploadFileToOpenAI(document.file);
    console.log(
      `[ANALYZER] File upload complete (ID: ${uploadedFile.id}), sending to OpenAI gpt-4o-2024-08-06...`,
    );

    const completion = await TenantDefaultAnalyzer.openai.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "file",
              file: {
                file_id: uploadedFile.id,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(
        TenantDefaultAnalysisResponseSchema,
        "tenant_default_analysis",
      ),
    });

    const parsed = completion.choices[0]?.message?.parsed;

    if (!parsed) {
      console.error("[ANALYZER] LLM response parsing failed - no parsed data returned");
      throw new Error("Failed to parse structured analysis response");
    }

    console.log("[ANALYZER] LLM analysis parsing successful");
    return parsed;
  }

  private buildAnalysisPrompt(
    request: TenantDefaultAnalysisRequest,
    macroeconomicContext: MacroeconomicSearchResult | null,
  ): string {
    let prompt = `Analyze this rent roll document to identify tenants at risk of defaulting on rent payments in the next 1-3 months.

PROPERTY INFORMATION:
- Property Name: ${request.propertyName || "Not specified"}
- Property Address: ${request.propertyAddress || "Not specified"}
- Analysis Date: ${request.analysisDate}
`;

    if (macroeconomicContext) {
      prompt += `
MACROECONOMIC CONTEXT:
- Local Unemployment Rate: ${macroeconomicContext.localUnemploymentRate || "Unknown"}%
- City Unemployment Rate: ${macroeconomicContext.cityUnemploymentRate || "Unknown"}%
- State Unemployment Rate: ${macroeconomicContext.stateUnemploymentRate || "Unknown"}%
- Median Income Area: $${macroeconomicContext.medianIncomeArea || "Unknown"}
- Rent Growth Rate: ${macroeconomicContext.rentGrowthRate || "Unknown"}%
- Vacancy Rate: ${macroeconomicContext.vacancyRate || "Unknown"}%
- Major Employer Layoffs: ${macroeconomicContext.majorEmployerLayoffs?.join("; ") || "None reported"}
- Seasonal Factors: ${macroeconomicContext.seasonalFactors?.join("; ") || "None identified"}
- Economic Indicators: ${macroeconomicContext.economicIndicators?.join("; ") || "No specific indicators available"}
- Industry Trends: ${macroeconomicContext.industryTrends?.join("; ") || "No trends identified"}
`;
    }

    prompt += `
ANALYSIS REQUIREMENTS:
1. Extract all tenant information from the rent roll document
2. Assess each tenant's risk level based on payment history, arrears, and economic factors
3. Calculate default probability percentages (0-100%)
4. Consider the macroeconomic context in your risk assessments
5. Generate specific, actionable recommended actions for property management
6. Provide overall risk summary for the property
7. Include comments explaining your reasoning for each tenant

IMPORTANT: 
- Analyze the actual data in the document - don't make assumptions
- Generate specific recommended actions based on the risk levels found
- Be conservative but thorough in risk assessment
- Include priority levels (immediate/urgent/normal/low) for actions
- Provide timelines for each recommended action

Provide a comprehensive analysis following the specified JSON schema.`;

    return prompt;
  }

  private async uploadFileToOpenAI(file: File): Promise<{ id: string }> {
    try {
      console.log("[ANALYZER] Starting file upload to OpenAI...");

      // Convert File to ArrayBuffer then to Buffer for FormData
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create FormData for direct HTTP upload
      const formData = new FormData();

      // Create a Blob from the buffer for FormData compatibility
      const blob = new Blob([buffer], { type: file.type });
      formData.append("file", blob, file.name);
      formData.append("purpose", "user_data");

      console.log(`[ANALYZER] Uploading file via HTTP: ${file.name} (${file.size} bytes)`);

      // Direct HTTP request to OpenAI Files API
      const response = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[ANALYZER] HTTP upload failed: ${response.status} ${response.statusText}`,
          errorText,
        );
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();

      if (!result.id) {
        console.error("[ANALYZER] Upload response missing file ID:", result);
        throw new Error("OpenAI API response missing file ID");
      }

      console.log(`[ANALYZER] File uploaded successfully with ID: ${result.id}`);
      return { id: result.id };
    } catch (error) {
      console.error("[ANALYZER] File upload failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileName: file.name,
        fileSize: file.size,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to upload file to OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert real estate risk analyst specializing in tenant default prediction. You analyze rent roll documents and predict which tenants are most likely to default on rent payments.

Your task:
1. Carefully examine the rent roll document (PDF, Excel, CSV, or Numbers format)
2. Extract tenant information, payment history, and financial data
3. Assess default risk for each tenant considering:
   - Payment history patterns (late fees, partial payments, missed payments)
   - Current arrears or outstanding balances
   - Lease terms and upcoming renewals
   - Local economic conditions provided in the context
   - Industry and employment risks based on macroeconomic data

Provide detailed, actionable analysis with:
- Risk severity levels: low, medium, high, critical
- Default probability as percentage (0-100%)
- Specific financial indicators and reasoning
- Actionable recommended actions with priorities and timelines
- Clear next steps for property management

Generate all recommended actions dynamically based on the specific risks found. Do not use generic recommendations - tailor everything to the actual data in the document and current economic conditions.

Be thorough and conservative in your assessments. Base everything on actual data patterns and economic context provided.`;
  }
} 