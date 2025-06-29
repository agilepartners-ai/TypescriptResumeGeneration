import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { validateFileType, validateFileSize } from '@/lib/pdf-utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  isLoading?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isLoading = false,
  className
}: FileUploadProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 16MB.');
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload PDF, DOCX, or TXT files.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (!validateFileType(file)) {
        setError('Invalid file type. Please upload PDF, DOCX, or TXT files.');
        return;
      }
      
      if (!validateFileSize(file)) {
        setError('File is too large. Maximum size is 16MB.');
        return;
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 16 * 1024 * 1024,
    multiple: false,
    disabled: isLoading
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    onFileRemove();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
          isLoading && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50",
          selectedFile && "border-green-300 bg-green-50"
        )}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={handleRemoveFile}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                type="button"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className={cn(
              "mx-auto h-12 w-12 mb-4",
              isDragActive ? "text-primary" : "text-gray-400"
            )} />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports PDF, DOCX, and TXT files (max 16MB)
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}