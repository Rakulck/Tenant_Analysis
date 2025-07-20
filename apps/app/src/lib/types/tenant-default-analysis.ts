import { z } from "zod";

export const RiskSeverity = z.enum(["low", "medium", "high", "critical"]);

export type RiskSeverity = z.infer<typeof RiskSeverity>;

export const NextActionType = z.enum([
  "monitor",
  "contact_tenant",
  "payment_plan",
  "formal_notice",
  "legal_consultation",
  "eviction_process",
  "unit_preparation",
]);

export type NextActionType = z.infer<typeof NextActionType>;

export const PaymentPattern = z.enum([
  "on_time",
  "occasionally_late",
  "frequently_late",
  "consistently_late",
  "in_arrears",
  "no_payment",
]);

export type PaymentPattern = z.infer<typeof PaymentPattern>;

export const TenantInfoSchema = z.object({
  tenantName: z.string(),
  unitNumber: z.string(),
  leaseStartDate: z.string().nullable(),
  leaseEndDate: z.string().nullable(),
  monthlyRent: z.number().positive().nullable(),
  securityDeposit: z.number().nullable(),
  moveInDate: z.string().nullable(),
});

export const FinancialIndicatorsSchema = z.object({
  currentArrears: z.number(),
  totalOutstandingBalance: z.number().nullable(),
  paymentPattern: PaymentPattern,
  lastPaymentDate: z.string().nullable(),
  lastPaymentAmount: z.number().nullable(),
  averageMonthlyPayment: z.number().nullable(),
  paymentFrequency: z.string().nullable(),
  rentToIncomeRatio: z.number().nullable(),
  creditScore: z.number().nullable(),
});

export const MacroeconomicContextSchema = z.object({
  localUnemploymentRate: z.number().nullable(),
  cityUnemploymentRate: z.number().nullable(),
  stateUnemploymentRate: z.number().nullable(),
  medianIncomeArea: z.number().nullable(),
  rentGrowthRate: z.number().nullable(),
  vacancyRate: z.number().nullable(),
  majorEmployerLayoffs: z.array(z.string()),
  economicIndicators: z.array(z.string()),
  seasonalFactors: z.array(z.string()),
  industryTrends: z.array(z.string()),
});

export const NextStepSchema = z.object({
  action: NextActionType,
  description: z.string(),
  priority: z.enum(["immediate", "urgent", "normal", "low"]),
  timeline: z.string(),
  estimatedCost: z.number().nullable(),
  legalRequirements: z.array(z.string()),
});

export const TenantRiskAssessmentSchema = z.object({
  tenantInfo: TenantInfoSchema,
  riskSeverity: RiskSeverity,
  defaultProbability: z.number().min(0).max(100),
  projectedDefaultTimeframe: z.string().nullable(),
  financialIndicators: FinancialIndicatorsSchema,
  macroeconomicContext: MacroeconomicContextSchema,
  riskFactors: z.array(z.string()),
  protectiveFactors: z.array(z.string()),
  nextSteps: z.array(NextStepSchema),
  comments: z.string(),
  confidenceLevel: z.number().min(0).max(100),
  lastUpdated: z.string().datetime(),
});

export type TenantRiskAssessment = z.infer<typeof TenantRiskAssessmentSchema>;

export const TenantDefaultAnalysisRequestSchema = z.object({
  propertyName: z.string().nullable(),
  propertyAddress: z.string().nullable(),
  analysisDate: z.string().datetime(),
  includeWebSearch: z.boolean(),
  searchLocation: z
    .object({
      city: z.string().nullable(),
      state: z.string().nullable(),
      zipCode: z.string().nullable(),
      country: z.string(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
    })
    .nullable(),
});

export type TenantDefaultAnalysisRequest = z.infer<typeof TenantDefaultAnalysisRequestSchema>;

export const TenantDefaultAnalysisResponseSchema = z.object({
  success: z.boolean(),
  propertyInfo: z.object({
    propertyName: z.string().nullable(),
    propertyAddress: z.string().nullable(),
    totalUnits: z.number().nullable(),
    analysisDate: z.string().datetime(),
  }),
  tenantAssessments: z.array(TenantRiskAssessmentSchema),
  overallRiskSummary: z.object({
    totalTenants: z.number(),
    lowRiskCount: z.number(),
    mediumRiskCount: z.number(),
    highRiskCount: z.number(),
    criticalRiskCount: z.number(),
    totalAtRiskTenants: z.number(),
    averageDefaultProbability: z.number(),
    projectedMonthlyLoss: z.number().nullable(),
  }),
  macroeconomicSummary: MacroeconomicContextSchema,
  recommendedActions: z.array(
    z.object({
      priority: z.enum(["immediate", "urgent", "normal", "low"]),
      action: z.string(),
      affectedTenants: z.array(z.string()),
      estimatedCost: z.number().nullable(),
      timeline: z.string(),
    }),
  ),
  dataQuality: z.object({
    completeness: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    dataSourceReliability: z.string(),
    lastWebSearchUpdate: z.string().datetime().nullable(),
  }),
  processingTimeMs: z.number(),
  error: z.string().nullable(),
});

export type TenantDefaultAnalysisResponse = z.infer<typeof TenantDefaultAnalysisResponseSchema>;

export const RISK_SEVERITY_COLORS = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
} as const;

export const RISK_SEVERITY_LABELS = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
} as const;

export const NEXT_ACTION_LABELS = {
  monitor: "Continue Monitoring",
  contact_tenant: "Contact Tenant",
  payment_plan: "Negotiate Payment Plan",
  formal_notice: "Send Formal Notice",
  legal_consultation: "Legal Consultation",
  eviction_process: "Begin Eviction Process",
  unit_preparation: "Prepare Unit for Re-rental",
} as const;

export const PAYMENT_PATTERN_LABELS = {
  on_time: "On Time",
  occasionally_late: "Occasionally Late",
  frequently_late: "Frequently Late",
  consistently_late: "Consistently Late",
  in_arrears: "In Arrears",
  no_payment: "No Payment",
} as const; 