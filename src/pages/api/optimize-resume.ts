import { NextApiRequest, NextApiResponse } from 'next';
import { generateJSONResume, tailorResume } from '@/lib/openai';
import { getResumeData, saveResumeData } from '@/lib/storage';
import { optimizeResumeSchema, validateApiKey } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ApiError } from '@/types';

const templateCommands = {
  "Simple": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Awesome": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "BGJC": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Deedy": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "Modern": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Plush": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "Alta": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
};

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
    const validation = optimizeResumeSchema.safeParse(data);
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
      template,
      api_key,
      model_type,
      model,
      section_ordering,
      improve_resume,
    } = validation.data;

    // Validate API key
    if (!validateApiKey(api_key)) {
      return res.status(400).json({
        error: 'Invalid API key format',
        file_id: fileId,
      });
    }

    // Validate template
    if (!(template in templateCommands)) {
      return res.status(400).json({
        error: `Invalid template. Available templates: ${Object.keys(templateCommands).join(', ')}`,
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

    console.log(`Optimizing resume for file_id: ${fileId}, template: ${template}`);

    // Improve resume if requested
    let optimizedJson = resumeData;
    if (improve_resume) {
      const resumeText = JSON.stringify(resumeData, null, 2);
      const combinedText = `${resumeText}\n\nOptimize this resume for the following job:\n${job_description}`;
      
      console.log('Improving resume with AI...');
      const optimizedText = await tailorResume(combinedText, api_key, model, model_type);
      
      console.log('Re-generating JSON from optimized text...');
      optimizedJson = await generateJSONResume(optimizedText, api_key, model, model_type);
    }

    // For now, return a simple JSON response
    // In a full implementation, you would generate LaTeX and render to PDF
    const optimizedResumeText = `
Optimized Resume (${template} Template)

${JSON.stringify(optimizedJson, null, 2)}

Template: ${template}
Section Ordering: ${section_ordering.join(', ')}
Improved: ${improve_resume}
    `.trim();

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="optimized_resume_${fileId}_${template.toLowerCase()}.json"`);
    
    res.status(200).send(Buffer.from(optimizedResumeText, 'utf-8'));
  } catch (error) {
    console.error(`Error in optimize_resume for file_id ${fileId}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: `Failed to optimize resume: ${errorMessage}`,
      file_id: fileId,
    });
  }
}