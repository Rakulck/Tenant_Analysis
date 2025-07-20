"use client";

import type {
  RiskSeverity,
  TenantDefaultAnalysisResponse,
} from "@/lib/types/tenant-default-analysis";
import {
  NEXT_ACTION_LABELS,
  PAYMENT_PATTERN_LABELS,
  RISK_SEVERITY_COLORS,
  RISK_SEVERITY_LABELS,
} from "@/lib/types/tenant-default-analysis";
import { Button } from "@v1/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select";
import {
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Home,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnalysisResultsProps {
  analysisResult: TenantDefaultAnalysisResponse;
  onAnalyzeAnother: () => void;
}

export function AnalysisResults({ analysisResult, onAnalyzeAnother }: AnalysisResultsProps) {
  const router = useRouter();
  const [filterRisk, setFilterRisk] = useState<RiskSeverity | "all">("all");
  const [sortBy, setSortBy] = useState<"risk" | "probability" | "name">("risk");

  const filteredTenants =
    analysisResult.tenantAssessments
      .filter((tenant) => filterRisk === "all" || tenant.riskSeverity === filterRisk)
      .sort((a, b) => {
        switch (sortBy) {
          case "risk": {
            const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return riskOrder[b.riskSeverity] - riskOrder[a.riskSeverity];
          }
          case "probability":
            return b.defaultProbability - a.defaultProbability;
          case "name":
            return a.tenantInfo.tenantName.localeCompare(b.tenantInfo.tenantName);
          default:
            return 0;
        }
      });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportResults = () => {
    const csvContent = [
      // Header
      [
        "Tenant Name",
        "Unit",
        "Risk Level",
        "Default Probability",
        "Current Arrears",
        "Payment Pattern",
        "Next Action",
        "Comments",
      ].join(","),
      // Data rows
      ...analysisResult.tenantAssessments.map((tenant) =>
        [
          `"${tenant.tenantInfo.tenantName}"`,
          `"${tenant.tenantInfo.unitNumber}"`,
          RISK_SEVERITY_LABELS[tenant.riskSeverity],
          `${tenant.defaultProbability}%`,
          tenant.financialIndicators.currentArrears || 0,
          PAYMENT_PATTERN_LABELS[tenant.financialIndicators.paymentPattern],
          tenant.nextSteps[0]?.action || "",
          `"${tenant.comments.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenant-default-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleAddTenantInfo = () => {
    router.push("/add-property/tennet-information");
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisResult.overallRiskSummary.totalTenants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisResult.overallRiskSummary.totalAtRiskTenants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Risk %</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analysisResult.overallRiskSummary.averageDefaultProbability)}%
              </p>
            </div>
          </div> 
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analysis Date</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(analysisResult.propertyInfo.analysisDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by risk:</span>
            </div>
            <Select
              value={filterRisk}
              onValueChange={(val: string) => setFilterRisk(val as RiskSeverity | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(val: string) =>
                setSortBy(val as "risk" | "probability" | "name")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk Level</SelectItem>
                <SelectItem value="probability">Default Probability</SelectItem>
                <SelectItem value="name">Tenant Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tenant Risk Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tenant Risk Assessment ({filteredTenants.length} tenants)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Level</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Default Probability</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Arrears</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Pattern</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Next Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Comments</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr
                  key={`${tenant.tenantInfo.tenantName}-${tenant.tenantInfo.unitNumber}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.tenantInfo.tenantName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Unit {tenant.tenantInfo.unitNumber}
                      </div>
                      {tenant.tenantInfo.monthlyRent && (
                        <div className="text-sm text-gray-500">
                          {formatCurrency(tenant.tenantInfo.monthlyRent)}
                          /month
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${RISK_SEVERITY_COLORS[tenant.riskSeverity]}`}
                    >
                      {RISK_SEVERITY_LABELS[tenant.riskSeverity]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.defaultProbability}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tenant.defaultProbability >= 75
                            ? "bg-red-500"
                            : tenant.defaultProbability >= 50
                              ? "bg-orange-500"
                              : tenant.defaultProbability >= 25
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                        style={{ width: `${tenant.defaultProbability}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {tenant.financialIndicators.currentArrears > 0
                      ? formatCurrency(tenant.financialIndicators.currentArrears)
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {PAYMENT_PATTERN_LABELS[tenant.financialIndicators.paymentPattern]}
                  </td>
                  <td className="py-3 px-4">
                    {tenant.nextSteps[0] && (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {NEXT_ACTION_LABELS[tenant.nextSteps[0].action]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tenant.nextSteps[0].timeline}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className="text-sm text-gray-900 max-w-xs truncate"
                      title={tenant.comments}
                    >
                      {tenant.comments}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button onClick={onAnalyzeAnother} variant="outline">
          Analyze Another Property
        </Button>
        
        <div className="flex gap-3">
          <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Results
          </Button>
          <Button onClick={handleGoToDashboard} variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
          <Button onClick={handleAddTenantInfo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4" />
            Add Tenant Info
          </Button>
        </div>
      </div>
    </div>
  );
} 