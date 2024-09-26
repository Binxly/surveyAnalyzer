"use client";

import { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaSpinner, FaFilePdf, FaFile, FaExchangeAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { renderToString } from 'react-dom/server';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error analyzing survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePDF = () => {
    if (resultsRef.current && results) {
      const pdfContent = results.map((item: any) => {
        const renderedMarkdown = renderToString(
          <ReactMarkdown
            components={{
              h3: ({node, ...props}) => <h3 style={{fontSize: '18px', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: 'black'}} {...props} />,
              h4: ({node, ...props}) => <h4 style={{fontSize: '16px', fontWeight: 'bold', marginTop: '12px', marginBottom: '4px', color: 'black'}} {...props} />,
              ul: ({node, ...props}) => <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '8px', color: 'black'}} {...props} />,
              ol: ({node, ...props}) => <ol style={{listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '8px', color: 'black'}} {...props} />,
              li: ({node, ...props}) => <li style={{marginBottom: '4px', color: 'black'}} {...props} />,
              p: ({node, ...props}) => <p style={{marginBottom: '8px', color: 'black'}} {...props} />,
              code: ({node, inline, ...props}) => 
                inline ? (
                  <code style={{backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px', color: 'black'}} {...props} />
                ) : (
                  <code style={{display: 'block', backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap', color: 'black'}} {...props} />
                ),
            }}
          >
            {item.analysis}
          </ReactMarkdown>
        );

        return `
          <div style="background-color: white; color: black; padding: 20px; margin-bottom: 20px;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; color: black;">${item.question}</h2>
            <div>${renderedMarkdown}</div>
          </div>
        `;
      }).join('');

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="background-color: white; color: black; font-family: Arial, sans-serif;">
          ${pdfContent}
        </div>
      `;

      const opt = {
        margin: 15,
        filename: 'survey_analysis.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        fontsize: 10
      };

      // Wrap each item in a div with a class for page breaks
      const pdfContentWrapped = results.map((item: any, index: number) => `
        <div class="page-break-inside-avoid">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: black;">${item.question}</h2>
          <div>${renderToString(
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => <h3 style={{fontSize: '18px', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', color: 'black'}} {...props} />,
                h4: ({node, ...props}) => <h4 style={{fontSize: '16px', fontWeight: 'bold', marginTop: '12px', marginBottom: '4px', color: 'black'}} {...props} />,
                ul: ({node, ...props}) => <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '8px', color: 'black'}} {...props} />,
                ol: ({node, ...props}) => <ol style={{listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '8px', color: 'black'}} {...props} />,
                li: ({node, ...props}) => <li style={{marginBottom: '4px', color: 'black'}} {...props} />,
                p: ({node, ...props}) => <p style={{marginBottom: '8px', color: 'black', pageBreakInside: 'avoid'}} {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code style={{backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px', color: 'black'}} {...props} />
                  ) : (
                    <code style={{display: 'block', backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap', color: 'black'}} {...props} />
                  ),
              }}
            >
              {item.analysis}
            </ReactMarkdown>
          )}</div>
        </div>
      `).join('');

      const elementWrapped = document.createElement('div');
      elementWrapped.innerHTML = `
        <style>
          .page-break-inside-avoid {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
        </style>
        <div style="background-color: white; color: black; font-family: Arial, sans-serif;">
          ${pdfContentWrapped}
        </div>
      `;

      html2pdf().set(opt).from(elementWrapped).save();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-full bg-gray-900 text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Survey Analysis</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center justify-center w-full">
            {file ? (
              <div className="flex w-full h-64 border-2 border-gray-300 border-dashed rounded-lg">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-1/2 h-full cursor-pointer bg-gray-50 hover:bg-gray-100 border-r border-gray-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaExchangeAlt className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to replace</span></p>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv" />
                </label>
                <div className="flex flex-col items-center justify-center w-1/2 h-full bg-gray-50">
                  <FaFile className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 text-center px-4 truncate max-w-full">{file.name}</p>
                </div>
              </div>
            ) : (
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">CSV file (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv" />
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              'Analyze Survey'
            )}
          </button>
        </form>
        {results && (
          <div ref={resultsRef}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Results:</h2>
              <button
                onClick={handleSavePDF}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
              >
                <FaFilePdf className="mr-2" />
                Save as PDF
              </button>
            </div>
            {results.map((item: any, index: number) => (
              <div key={index} className="mb-6 bg-gray-800 shadow-md rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-invert"
                    components={{
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-md font-semibold mt-3 mb-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? (
                          <code className="bg-gray-600 rounded px-1 py-0.5" {...props} />
                        ) : (
                          <code className="block bg-gray-600 rounded p-2 whitespace-pre-wrap" {...props} />
                        ),
                    }}
                  >
                    {item.analysis}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}