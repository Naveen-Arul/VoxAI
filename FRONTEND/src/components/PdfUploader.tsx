import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

interface PdfUploaderProps {
  onPdfUpload: (file: File) => void;
  onPdfRemove?: () => void;
}

export function PdfUploader({ onPdfUpload, onPdfRemove }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    fileName,
    isUploading,
    progress,
    handleFileInputChange,
    handleDrop,
    triggerFileInput,
    resetFile,
  } = useFileUpload({
    onFileSelect: (file) => {
      onPdfUpload(file);
      toast({
        title: "PDF Uploaded",
        description: `${file.name} is ready for analysis.`,
      });
    },
    onFileError: (error) => {
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf"],
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    resetFile();
    if (onPdfRemove) {
      onPdfRemove();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!fileName ? (
        <Card 
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            handleDrop(e);
            setIsDragging(false);
          }}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-1">Upload PDF Document</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your PDF file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF files up to 10MB
              </p>
            </div>
            
            <Button variant="outline" size="sm">
              Select File
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-xs">{fileName}</p>
                <p className="text-xs text-muted-foreground">Ready for analysis</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {!isUploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span>Upload complete</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}