import { useState, useCallback } from "react";

interface UseFileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileError?: (error: string) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useFileUpload({
  onFileSelect,
  onFileError,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ["application/pdf"],
}: UseFileUploadProps = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        if (onFileError) {
          onFileError(`File size exceeds ${maxSizeMB}MB limit`);
        }
        return false;
      }

      // Check file type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        if (onFileError) {
          onFileError(`File type not supported. Allowed types: ${allowedTypes.join(", ")}`);
        }
        return false;
      }

      return true;
    },
    [maxSize, allowedTypes, onFileError]
  );

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!validateFile(selectedFile)) {
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = allowedTypes.join(",");
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileSelect(target.files[0]);
      }
    };
    fileInput.click();
  };

  const resetFile = () => {
    setFile(null);
    setFileName("");
    setProgress(0);
  };

  // Simulate file upload process
  const uploadFile = useCallback(
    async (uploadFile: File = file!) => {
      if (!uploadFile) return;

      setIsUploading(true);
      setProgress(0);

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setProgress(i);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsUploading(false);
        return { success: true, fileName: uploadFile.name };
      } catch (error) {
        setIsUploading(false);
        if (onFileError) {
          onFileError("Failed to upload file");
        }
        return { success: false, error: "Upload failed" };
      }
    },
    [file, onFileError]
  );

  return {
    file,
    fileName,
    isUploading,
    progress,
    handleFileInputChange,
    handleDrop,
    triggerFileInput,
    resetFile,
    uploadFile,
    validateFile,
  };
}