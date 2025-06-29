import { NextApiRequest, NextApiResponse } from 'next';
import { generateAIEnhancement } from '@/lib/openai';
import { getResumeData, saveResumeData } from '@/lib/storage';
import { aiEnhanceSchema, validateApiKey } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { AIEnhanceResponse, ApiError } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIEnhanceResponse | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientId = getClientIdentifier(req as any);
  const rateLimit = checkRateLimit(clientId, 5, 60000); // 5 requests per minute
  
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }

  const data = req.body;
  const fileId = data.file_id || 'unknown';

  try {
    // Validate request data
    const validation = aiEnhanceSchema.safeParse(data);
    if (!validation.success) {
      return res.status(400).json({
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`,
        file_id: fileId,
      });
    }

    const {
      file_id,
      resume_json,
      job_description,
      api_key,
      model_type,
      model,
    } = validation.data;

    // Validate API key
    if (!validateApiKey(api_key)) {
      return res.status(400).json({
        error: 'Invalid API key format',
        file_id: fileId,
      });
    }

    // Get resume JSON
    let resumeData = resume_json;
    if (!resumeData && file_id) {
      resumeData = getResumeData(file_id);
      if (!resumeData) {
        return res.status(404).json({
          error: 'Resume data not found. Please re-upload your resume.',
          file_id: fileId,
        });
      }
    } else if (resumeData && file_id) {
      // Save the resume data for potential future use
      saveResumeData(file_id, resumeData);
    }

    if (!resumeData) {
      return res.status(400).json({
        error: 'Resume data is required',
        file_id: fileId,
      });
    }

    console.log(`Generating AI enhancement for file_id: ${fileId}`);

    // Generate AI enhancement
    const enhancementResult = await generateAIEnhancement(
      resumeData,
      job_description,
      api_key,
      model,
      model_type
    );

    // Add file_id to response
    const response: AIEnhanceResponse = {
      ...enhancementResult,
      file_id: fileId,
    } as AIEnhanceResponse;

    console.log(`AI enhancement completed for file_id: ${fileId}, success: ${response.success}`);

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error in ai_enhance for file_id ${fileId}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: `Failed to enhance resume: ${errorMessage}`,
      file_id: fileId,
    });
  }
}