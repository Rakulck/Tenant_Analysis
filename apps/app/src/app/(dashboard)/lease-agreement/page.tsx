"use client";

import { useState } from "react";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Card, CardContent } from "@v1/ui/card";
import { Trash2, Upload, FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  uploadedAt: string;
  format: string;
  size: string;
}

export default function LeaseAgreementPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Standard Residential Lease Agreement",
      uploadedAt: "2 days ago",
      format: "PDF",
      size: "245 KB"
    },
    {
      id: "2",
      name: "Month-to-Month Rental Agreement",
      uploadedAt: "1 week ago",
      format: "DOCX",
      size: "180 KB"
    },
    {
      id: "3",
      name: "Commercial Lease Template",
      uploadedAt: "2 weeks ago",
      format: "PDF",
      size: "320 KB"
    }
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        console.error("Please select a valid file format (PDF, DOC, or DOCX)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        uploadedAt: "Just now",
        format: selectedFile.name.split('.').pop()?.toUpperCase() || "PDF",
        size: `${Math.round(selectedFile.size / 1024)} KB`
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      console.log("Template uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload template. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      console.log("Template deleted successfully!");
    } catch (error) {
      console.error("Failed to delete template. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Lease Agreement Templates
      </h1>

      {/* Upload Section */}
      <Card className="mb-8 border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Upload New Template
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Template
                </>
              )}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            Accepted formats: PDF, DOC, DOCX
          </p>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Your Templates
        </h2>
        
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Uploaded {template.uploadedAt} • {template.format} • {template.size}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {templates.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No templates uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your first lease agreement template above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
