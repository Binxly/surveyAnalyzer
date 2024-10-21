# Survey Analysis Application

This project is a web-based application designed to analyze survey data using AI-powered insights.

### Frontend (app/page.tsx)

The frontend is built using Next.js and React.

Key features:
- File upload component with drag-and-drop functionality
- Analysis submission button
- Results display with markdown rendering
- PDF export functionality

## Workflow

1. User uploads a CSV file containing survey data through the frontend.
2. The file is sent to the backend API (`/analyze` endpoint).
3. The backend saves the file temporarily and calls the `process_survey()` function from analyze.
4. For each question in the survey:
   a. The responses are formatted into a prompt.
   b. The prompt is sent to the OpenAI API for analysis.
   c. The AI-generated analysis is stored.
5. The backend returns the analysis results to the frontend.
6. The frontend displays the results, rendering the markdown content.
7. Users can view the analysis on the web page or export it as a PDF.

## Important Details

- The project uses environment variables for API keys (e.g., OpenAI API key).
- The frontend is styled using Tailwind CSS for a responsive design.
- The PDF export functionality uses html2pdf.js to convert the analysis results into a downloadable PDF file.
- The backend uses temporary file handling to process uploaded CSV files securely.
- The AI analysis is performed using OpenAI's GPT-4o-mini model.
