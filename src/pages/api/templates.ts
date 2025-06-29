import { NextApiRequest, NextApiResponse } from 'next';
import { TemplatesResponse } from '@/types';

const templateCommands = {
  "Simple": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Awesome": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "BGJC": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Deedy": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "Modern": ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
  "Plush": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
  "Alta": ["xelatex", "-interaction=nonstopmode", "resume.tex"],
};

export default function handler(req: NextApiRequest, res: NextApiResponse<TemplatesResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      templates: [], 
      template_info: {} 
    });
  }

  const templates = Object.keys(templateCommands);
  
  const responseData: TemplatesResponse = {
    templates,
    template_info: {
      "Simple": "Basic single-column layout",
      "Modern": "Clean modern design with color accents",
      "Awesome": "Professional two-column layout",
      "Deedy": "Two-column design with emphasis on skills",
      "BGJC": "Traditional academic style",
      "Plush": "Elegant two-column with modern typography",
      "Alta": "Contemporary design with subtle colors"
    }
  };

  res.status(200).json(responseData);
}