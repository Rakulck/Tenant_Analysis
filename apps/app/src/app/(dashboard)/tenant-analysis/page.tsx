"use client";

import type {
  RiskSeverity,
  TenantDefaultAnalysisResponse,
  TenantRiskAssessment,
} from "@/lib/types/tenant-default-analysis";
import {
  NEXT_ACTION_LABELS,
  PAYMENT_PATTERN_LABELS,
  RISK_SEVERITY_COLORS,
  RISK_SEVERITY_LABELS,
} from "@/lib/types/tenant-default-analysis";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select";
import { GoogleMapsAutocomplete } from "@/components/google-maps-autocomplete";
import { PropertyMap } from "@/components/property-map";
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

export default function TenantDefaultAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TenantDefaultAnalysisResponse | null>(null);
  const [propertyInfo, setPropertyInfo] = useState({
    propertyName: "",
    propertyAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [addressCoordinates, setAddressCoordinates] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});
  const [includeWebSearch, setIncludeWebSearch] = useState(true);
  const [filterRisk, setFilterRisk] = useState<RiskSeverity | "all">("all");
  const [sortBy, setSortBy] = useState<"risk" | "probability" | "name">("risk");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisResult(null); // Clear previous results
    }
  };

  const handleAddressSelect = (address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  }) => {
    setPropertyInfo((prev) => ({
      ...prev,
      propertyAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    }));
    setAddressCoordinates({
      latitude: address.latitude,
      longitude: address.longitude,
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a rent roll file first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("rentRoll", file);
      formData.append("propertyName", propertyInfo.propertyName);
      formData.append("propertyAddress", propertyInfo.propertyAddress);
      formData.append("city", propertyInfo.city);
      formData.append("state", propertyInfo.state);
      formData.append("zipCode", propertyInfo.zipCode);
      formData.append("includeWebSearch", includeWebSearch.toString());
      if (addressCoordinates.latitude && addressCoordinates.longitude) {
        formData.append("latitude", addressCoordinates.latitude.toString());
        formData.append("longitude", addressCoordinates.longitude.toString());
      }

      const response = await fetch("/api/tenant-default-analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result: TenantDefaultAnalysisResponse = await response.json();
      setAnalysisResult(result);
      alert("Tenant default analysis completed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTenants =
    analysisResult?.tenantAssessments
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
      }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportResults = () => {
    if (!analysisResult) return;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Default Analysis</h1>
              <p className="text-gray-600">AI-powered risk assessment for rent roll analysis</p>
            </div>
            {analysisResult && (
              <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!analysisResult ? (
          /* Upload and Configuration Section */
          <div className="space-y-6">
            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name
                  </label>
                  <Input
                    type="text"
                    value={propertyInfo.propertyName}
                    onChange={(e) =>
                      setPropertyInfo((prev) => ({
                        ...prev,
                        propertyName: e.target.value,
                      }))
                    }
                    placeholder="Enter property name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address
                  </label>
                  <GoogleMapsAutocomplete
                    value={propertyInfo.propertyAddress}
                    onChange={(value) =>
                      setPropertyInfo((prev) => ({
                        ...prev,
                        propertyAddress: value,
                      }))
                    }
                    onAddressSelect={handleAddressSelect}
                    placeholder="Start typing to search for an address..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Type to search for addresses. The city, state, and ZIP code will be automatically filled.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    type="text"
                    value={propertyInfo.city}
                    onChange={(e) =>
                      setPropertyInfo((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="City"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <Input
                      type="text"
                      value={propertyInfo.state}
                      onChange={(e) =>
                        setPropertyInfo((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="State"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <Input
                      type="text"
                      value={propertyInfo.zipCode}
                      onChange={(e) =>
                        setPropertyInfo((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="ZIP"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Map */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Location
              </h2>
              <PropertyMap
                latitude={addressCoordinates.latitude}
                longitude={addressCoordinates.longitude}
                address={propertyInfo.propertyAddress}
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Rent Roll
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Choose rent roll file</h3>
                <p className="text-gray-500 mb-4">
                  Supports PDF, Excel (.xlsx, .xls), and CSV files up to 25MB
                </p>

                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Select File
                </label>

                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Analysis Options */}
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="web-search"
                    defaultChecked
                    checked={includeWebSearch}
                    onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  />
                  <label
                    htmlFor="web-search"
                    className="ml-2 text-sm text-gray-700 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Include real-time economic data (recommended)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Uses web search to gather current unemployment rates and economic indicators for
                  more accurate risk assessment
                </p>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Analyze Tenant Default Risk
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
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

            {/* Back to Upload */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setAnalysisResult(null);
                  setFile(null);
                }}
                variant="outline"
              >
                Analyze Another Property
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 