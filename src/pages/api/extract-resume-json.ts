import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { extractTextFromFile } from '@/lib/pdf-utils';
import { generateJSONResume } from '@/lib/openai';
import { saveResumeData, generateFileId } from '@/lib/storage';
import { extractResumeSchema, validateApiKey } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ExtractResumeResponse, ApiError } from '@/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractResumeResponse | ApiError>
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

  const fileId = generateFileId();
  
  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Extract form data
    const apiKey = Array.isArray(fields.api_key) ? fields.api_key[0] : fields.api_key;
    const modelType = Array.isArray(fields.model_type) ? fields.model_type[0] : fields.model_type;
    const model = Array.isArray(fields.model) ? fields.model[0] : fields.model;
    
    // Validate form data
    const validation = extractResumeSchema.safeParse({
      api_key: apiKey,
      model_type: modelType,
      model: model,
      file_id: fileId,
    });

    if (!validation.success) {
      return res.status(400).json({
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`,
        file_id: fileId,
      });
    }

    const { api_key, model_type, model: modelName } = validation.data;

    // Validate API key
    if (!validateApiKey(api_key)) {
      return res.status(400).json({
        error: 'Invalid API key format',
        file_id: fileId,
      });
    }

    // Check if file is uploaded
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({
        error: 'No file uploaded',
        file_id: fileId,
      });
    }

    // Convert formidable file to File object
    const fileBuffer = await import('fs').then(fs => fs.promises.readFile(uploadedFile.filepath));
    const file = new File([fileBuffer], uploadedFile.originalFilename || 'resume', {
      type: uploadedFile.mimetype || 'application/octet-stream',
    });

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Extract text from file
    const text = await extractTextFromFile(file);
    console.log(`Text extracted, length: ${text.length}`);

    if (text.length < 50) {
      return res.status(400).json({
        error: 'Extracted text is too short. Please check the file.',
        file_id: fileId,
      });
    }

    // Generate JSON resume
    const jsonResume = await generateJSONResume(text, api_key, modelName, model_type);
    console.log(`JSON resume generated with keys: ${Object.keys(jsonResume)}`);

    // Validate that we have some content
    if (!jsonResume || Object.keys(jsonResume).length === 0) {
      return res.status(500).json({
        error: 'Generated resume JSON is empty. Please check your API key and try again.',
        file_id: fileId,
      });
    }

    // Save resume data
    const saved = saveResumeData(fileId, jsonResume);
    if (!saved) {
      console.warn(`Warning: Failed to save resume data for file_id: ${fileId}`);
    }

    const responseData: ExtractResumeResponse = {
      success: true,
      resume_json: jsonResume,
      extracted_text_length: text.length,
      file_id: fileId,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`Error in extract_resume_json for file_id ${fileId}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: `Failed to extract resume JSON: ${errorMessage}`,
      file_id: fileId,
    });
  }
}