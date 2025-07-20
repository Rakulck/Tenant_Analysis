export interface DocumentFile {
  file: File;
  metadata: {
    uploadedAt: string;
    fileSize: number;
    mimeType: string;
    fileName: string;
  };
}

export interface DocumentAnalysisResult {
  success: boolean;
  extractedData?: any;
  error?: string;
  processingTimeMs: number;
  documentType: string;
  fileName: string;
  fileSize: number;
  summary?: string;
} 