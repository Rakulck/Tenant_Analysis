"use client";

import type {
  TenantDefaultAnalysisResponse,
} from "@/lib/types/tenant-default-analysis";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { GoogleMapsAutocomplete } from "@/components/google-maps-autocomplete";
import { PropertyMap } from "@/components/property-map";
import { AnalysisResults } from "@/components/analysis-results";
import {
  AlertTriangle,
  CheckCircle,
  Home,
  MapPin,
  Search,
  Upload,
  UserPlus,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProperty() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TenantDefaultAnalysisResponse | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState({
    propertyName: "",
    propertyAddress: "",
    city: "",
    state: "",
    zipCode: "",
    numberOfUnits: "",
  });
  const [addressCoordinates, setAddressCoordinates] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});
  const [includeWebSearch, setIncludeWebSearch] = useState(true);

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
      formData.append("numberOfUnits", propertyInfo.numberOfUnits);
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
      setShowSuccessPopup(true); // Show custom success popup instead of alert
    } catch (error) {
      console.error("Analysis error:", error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessPopup(false);
    router.push("/dashboard");
  };

  const handleAddTenantInfo = () => {
    setShowSuccessPopup(false);
    router.push("/add-property/tennet-information");
  };

  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setFile(null);
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Units
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={propertyInfo.numberOfUnits}
                    onChange={(e) =>
                      setPropertyInfo((prev) => ({
                        ...prev,
                        numberOfUnits: e.target.value,
                      }))
                    }
                    placeholder="Enter number of units"
                  />
                </div>
              </div>
            </div>

            {/* Property Map */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Location
              </h2>
              <PropertyMap
                latitude={addressCoordinates.latitude}
                longitude={addressCoordinates.longitude}
                address={propertyInfo.propertyAddress}
              />
            </div> */}

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
          <AnalysisResults 
            analysisResult={analysisResult} 
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        )}
      </div>

      {showSuccessPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessPopup(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Analysis Complete!</h3>
              <p className="text-gray-700 mb-6 text-center">
                Your tenant default analysis has been completed successfully. What would you like to do next?
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDashboard} 
                  variant="outline" 
                  className="w-full h-12 text-base"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleAddTenantInfo} 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Tenant Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 