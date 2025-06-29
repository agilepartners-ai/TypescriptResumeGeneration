import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { ProcessingIndicator, SuccessIndicator } from './ProcessingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtractResumeResponse, ProcessingState, ModelType } from '@/types';
import { generateId } from '@/lib/utils';

interface ResumeExtractorProps {
  onExtractionComplete: (result: ExtractResumeResponse) => void;
}

export function ResumeExtractor({ onExtractionComplete }: ResumeExtractorProps) {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [apiKey, setApiKey] = useState('');
  const [modelType, setModelType] = useState<ModelType>('DeepSeek');
  const [model, setModel] = useState('deepseek-chat');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isLoading: false,
    progress: 0,
    stage: ''
  });
  const [result, setResult] = useState<ExtractResumeResponse>();

  const handleExtract = async () => {
    if (!selectedFile || !apiKey) return;

    setProcessingState({
      isLoading: true,
      progress: 10,
      stage: 'Uploading file...'
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', apiKey);
      formData.append('model_type', modelType);
      formData.append('model', model);
      formData.append('file_id', generateId());

      setProcessingState(prev => ({
        ...prev,
        progress: 30,
        stage: 'Extracting text from document...'
      }));

      const response = await fetch('/api/extract-resume-json', {
        method: 'POST',
        body: formData,
      });

      setProcessingState(prev => ({
        ...prev,
        progress: 70,
        stage: 'Generating structured resume data...'
      }));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract resume');
      }

      setProcessingState(prev => ({
        ...prev,
        progress: 100,
        stage: 'Complete!'
      }));

      setTimeout(() => {
        setProcessingState({
          isLoading: false,
          progress: 0,
          stage: ''
        });
        setResult(data);
        onExtractionComplete(data);
      }, 500);

    } catch (error) {
      setProcessingState({
        isLoading: false,
        progress: 0,
        stage: '',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(undefined);
    setResult(undefined);
    setProcessingState({
      isLoading: false,
      progress: 0,
      stage: ''
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Extract Resume Data</CardTitle>
        <CardDescription>
          Upload your resume to extract structured data using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          onFileSelect={setSelectedFile}
          onFileRemove={() => setSelectedFile(undefined)}
          selectedFile={selectedFile}
          isLoading={processingState.isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={processingState.isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelType">Model Type</Label>
            <Select
              id="modelType"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
              disabled={processingState.isLoading}
            >
              <option value="DeepSeek">DeepSeek</option>
              <option value="OpenAI">OpenAI</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="Model name (e.g., deepseek-chat, gpt-4)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={processingState.isLoading}
          />
        </div>

        <ProcessingIndicator state={processingState} />

        {result && (
          <SuccessIndicator 
            message={`Resume extracted successfully! Found ${Object.keys(result.resume_json).length} sections with ${result.extracted_text_length} characters of text.`}
          />
        )}

        <div className="flex space-x-3">
          <Button
            onClick={handleExtract}
            disabled={!selectedFile || !apiKey || processingState.isLoading}
            className="flex-1"
          >
            {processingState.isLoading ? 'Processing...' : 'Extract Resume Data'}
          </Button>
          
          {(result || processingState.error) && (
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={processingState.isLoading}
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}