# Survey Analysis Application

This project is a web-based application designed to analyze survey data using AI-powered insights. It consists of a Next.js frontend, a FastAPI backend, and a Python script for processing survey data.

## Key Components

1. Frontend (app/page.tsx)
2. Backend API (api.py)
3. Survey Analysis Script (analyze.py)

## Functionality

### Frontend (app/page.tsx)

The frontend is built using Next.js and React, providing a user-friendly interface for uploading CSV files containing survey data and displaying the analysis results.

Key features:
- File upload component with drag-and-drop functionality
- Analysis submission button
- Results display with markdown rendering
- PDF export functionality

### Backend API (api.py)

The backend is implemented using FastAPI, providing a simple API endpoint for file upload and analysis.

Key functionality:
- `/analyze` POST endpoint for file upload
- CORS middleware to allow requests from the frontend
- Temporary file handling for uploaded CSV files
- Integration with the analyze.py script for survey processing

### Survey Analysis Script (analyze.py)

This Python script is responsible for processing the survey data and generating AI-powered insights.

Key functionality:
1. CSV parsing: `read_csv()` function reads the uploaded CSV file
2. Prompt creation: `create_prompt()` generates a prompt for the AI model based on survey questions and answers
3. AI API integration: `call_ai_api()` sends the prompt to the OpenAI API (GPT-4) for analysis
4. Survey processing: `process_survey()` orchestrates the entire analysis process for each question in the survey
5. Markdown output: `write_to_markdown()` saves the analysis results in a formatted markdown file

The AI analysis provides the following insights for each survey question:
- Summary of key points
- Overall sentiment analysis
- Main topics or themes
- Response categorization
- Key terms used in responses
- Trending sentiments and emerging trends
- Alignment with provided examples (if applicable)
- Confidence rating of the analysis

## Workflow

1. User uploads a CSV file containing survey data through the frontend.
2. The file is sent to the backend API (`/analyze` endpoint).
3. The backend saves the file temporarily and calls the `process_survey()` function from analyze.py.
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
- The AI analysis is performed using OpenAI's GPT-4o-mini model, providing in-depth insights into the survey data.