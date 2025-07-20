"use client";

import { Button } from "@v1/ui/button";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  name: string;
  defaultRisk: number;
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Sunset Apartments - Unit 4B",
    defaultRisk: 12,
  },
  {
    id: "2",
    name: "Downtown Loft - Suite 201",
    defaultRisk: 7,
  },
  {
    id: "3",
    name: "Riverside Complex - Building A",
    defaultRisk: 23,
  },
];

function getRiskLevel(risk: number): "low" | "medium" | "high" {
  if (risk <= 10) return "low";
  if (risk <= 20) return "medium";
  return "high";
}

function getRiskStyles(risk: number) {
  const level = getRiskLevel(risk);
  
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-red-100 text-red-800";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const handleAddProperty = () => {
    router.push("/add-property");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            Tenant Default Risk Dashboard
          </h1>
          <div className="flex gap-3">
            <Button variant="default" size="sm">
              Lease Agreement
            </Button>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Properties
            </h2>
            <Button 
              className="w-full sm:w-auto"
              onClick={handleAddProperty}
            >
              + Add Property
            </Button>
          </div>

          <div className="space-y-4">
            {mockProperties.map((property) => (
              <div
                key={property.id}
                className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="font-medium text-gray-800 mb-2">
                  {property.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Default Risk:</span>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${getRiskStyles(
                      property.defaultRisk
                    )}`}
                  >
                    {property.defaultRisk}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 