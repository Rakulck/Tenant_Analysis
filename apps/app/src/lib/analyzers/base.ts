import type { DocumentFile, DocumentAnalysisResult } from "../types/documents";

export abstract class BaseDocumentAnalyzer {
  abstract getSupportedDocumentType(): string;
  
  protected validateFile(file: File): void {
    if (!file) {
      throw new Error("No file provided");
    }
    
    if (file.size === 0) {
      throw new Error("File is empty");
    }
    
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 25MB limit");
    }
  }
  
  protected createAnalysisResult(
    document: DocumentFile,
    success: boolean,
    summary?: string,
    extractedData?: any,
    error?: string,
    processingTimeMs?: number
  ): DocumentAnalysisResult {
    return {
      success,
      extractedData,
      error,
      processingTimeMs: processingTimeMs || 0,
      documentType: this.getSupportedDocumentType(),
      fileName: document.file.name,
      fileSize: document.file.size,
      summary,
    };
  }
} 