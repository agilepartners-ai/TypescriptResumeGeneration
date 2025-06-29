import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ProcessingState } from '@/types';

interface ProcessingIndicatorProps {
  state: ProcessingState;
  className?: string;
}

export function ProcessingIndicator({ state, className }: ProcessingIndicatorProps) {
  const { isLoading, progress, stage, error } = state;

  if (!isLoading && !error) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {isLoading && (
        <>
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-700">{stage}</span>
          </div>
          
          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{progress}%</p>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Processing Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuccessIndicator({ message, className }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md ${className}`}>
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-green-800">Success</p>
        <p className="text-xs text-green-600 mt-1">{message}</p>
      </div>
    </div>
  );
}