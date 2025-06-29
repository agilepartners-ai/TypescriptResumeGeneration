# Resume Processor - Next.js TypeScript Application

A modern, AI-powered resume processing application built with Next.js and TypeScript. This application provides comprehensive resume analysis, optimization, and cover letter generation capabilities.

## 🚀 Features

### Core Functionality
- **Resume Text Extraction**: Extract text from PDF, DOCX, and TXT files
- **AI-Powered JSON Conversion**: Convert unstructured resume text to structured JSON data
- **Cover Letter Generation**: Create personalized cover letters tailored to job descriptions
- **Resume Optimization**: Enhance resumes for specific job opportunities
- **AI Enhancement Analysis**: Get detailed feedback and improvement suggestions

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Next.js API Routes**: RESTful API endpoints with proper error handling
- **Rate Limiting**: Built-in protection against API abuse
- **File Storage**: Efficient resume data storage and retrieval
- **Cross-browser Compatibility**: Tested on Chrome, Safari, and IE
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: OpenAI and DeepSeek API support
- **PDF Processing**: pdf-parse for text extraction
- **Document Processing**: mammoth for DOCX files
- **State Management**: React hooks with proper error handling
- **Validation**: Zod for runtime type checking
- **UI Components**: Custom component library with accessibility

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-processor-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   DEEPSEEK_API_KEY=your_deepseek_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and available endpoints.

### Extract Resume JSON
```
POST /api/extract-resume-json
```
Extracts structured data from uploaded resume files.

### Generate Cover Letter
```
POST /api/generate-cover-letter
```
Generates personalized cover letters.

### Optimize Resume
```
POST /api/optimize-resume
```
Optimizes resume content for specific job opportunities.

### AI Enhancement
```
POST /api/ai-enhance
```
Provides detailed analysis and improvement suggestions.

### Get Templates
```
GET /api/templates
```
Returns available resume templates.

## 🎨 Component Architecture

### Atomic Design Structure
```
src/components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── FileUpload.tsx      # File upload with drag & drop
├── ProcessingIndicator.tsx  # Loading states
└── ResumeExtractor.tsx # Main resume processing
```

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Zod schemas for all inputs
- **File Type Validation**: Secure file upload handling
- **API Key Validation**: Proper authentication checks
- **Error Handling**: Comprehensive error management

## 🌐 Browser Compatibility

- **Chrome**: Full support (latest versions)
- **Safari**: Full support (latest versions)
- **Internet Explorer**: Basic support (IE 11+)
- **Firefox**: Full support (latest versions)
- **Edge**: Full support (latest versions)

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop**: Full-featured desktop experience

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Efficient API response caching
- **Lazy Loading**: Components loaded on demand

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 🔄 Migration from Python

This application is a complete TypeScript conversion of the original Python Flask backend, maintaining:

- **API Compatibility**: Same endpoints and response formats
- **Feature Parity**: All original functionality preserved
- **Enhanced Performance**: Improved with Next.js optimizations
- **Better Type Safety**: Full TypeScript implementation
- **Modern Architecture**: Component-based design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.