import React, { useState } from 'react';
import Head from 'next/head';
import { ResumeExtractor } from '@/components/ResumeExtractor';
import { ExtractResumeResponse } from '@/types';

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractResumeResponse>();

  const handleExtractionComplete = (result: ExtractResumeResponse) => {
    setExtractedData(result);
  };

  return (
    <>
      <Head>
        <title>Resume Processor - AI-Powered Resume Analysis</title>
        <meta name="description" content="Extract, analyze, and optimize your resume with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Resume Processor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract structured data from your resume, generate tailored cover letters, 
              and optimize your resume for specific job opportunities using advanced AI.
            </p>
          </div>

          <div className="space-y-8">
            <ResumeExtractor onExtractionComplete={handleExtractionComplete} />

            {extractedData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Extracted Resume Data
                </h2>
                <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(extractedData.resume_json, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>File ID: <code className="bg-gray-100 px-2 py-1 rounded">{extractedData.file_id}</code></p>
                  <p>Extracted Text Length: {extractedData.extracted_text_length} characters</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Available Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cover Letter Generator
                </h3>
                <p className="text-gray-600">
                  Generate personalized cover letters tailored to specific job descriptions
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Resume Optimizer
                </h3>
                <p className="text-gray-600">
                  Optimize your resume content and format for better ATS compatibility
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Enhancement
                </h3>
                <p className="text-gray-600">
                  Get AI-powered suggestions to improve your resume content and structure
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}