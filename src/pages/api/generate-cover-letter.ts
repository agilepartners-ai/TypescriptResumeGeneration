import { NextApiRequest, NextApiResponse } from 'next';
import { generateCoverLetterContent } from '@/lib/openai';
import { getResumeData, saveResumeData } from '@/lib/storage';
import { generateCoverLetterSchema, validateApiKey } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ApiError } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientId = getClientIdentifier(req as any);
  const rateLimit = checkRateLimit(clientId, 3, 60000); // 3 requests per minute
  
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }

  const data = req.body;
  const fileId = data.file_id || 'unknown';

  try {
    // Validate request data
    const validation = generateCoverLetterSchema.safeParse(data);
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
      personal_info,
      company_info,
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

    console.log(`Generating cover letter for file_id: ${fileId}`);

    // Generate cover letter content
    const resumeInfo = JSON.stringify(resumeData, null, 2);
    const bodyContent = await generateCoverLetterContent(
      api_key,
      job_description,
      company_info.position,
      company_info.company_name,
      company_info.location,
      resumeInfo,
      model,
      model_type
    );

    console.log(`Cover letter content generated, length: ${bodyContent.length}`);

    // For now, return a simple text response
    // In a full implementation, you would generate a PDF using a library like jsPDF
    const coverLetterText = `
Cover Letter for ${personal_info.name}

${personal_info.name}
${personal_info.phone}
${personal_info.email}
${personal_info.address || ''}

${new Date().toLocaleDateString()}

${company_info.hiring_manager || 'Hiring Manager'}
${company_info.company_name}
${company_info.department ? company_info.department + '\n' : ''}${company_info.location}

Dear ${company_info.hiring_manager || 'Hiring Manager'},

${bodyContent}

Sincerely,
${personal_info.name}
    `.trim();

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="cover_letter_${fileId}.txt"`);
    
    res.status(200).send(Buffer.from(coverLetterText, 'utf-8'));
  } catch (error) {
    console.error(`Error in generate_cover_letter for file_id ${fileId}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: `Failed to generate cover letter: ${errorMessage}`,
      file_id: fileId,
    });
  }
}