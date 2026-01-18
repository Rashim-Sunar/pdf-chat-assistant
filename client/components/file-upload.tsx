'use client';

import * as React from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage(null);
    } else {
      setMessage('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('No file selected');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage('✅ PDF uploaded successfully');
      setFile(null);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        Upload PDF Document
      </h2>

      <label
        htmlFor="pdf-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-gray-400"
      >
        <Upload className="h-8 w-8 text-gray-500" />
        <span className="text-sm text-gray-600">
          Click to upload or drag & drop
        </span>
        <span className="text-xs text-gray-400">PDF only (max 10MB)</span>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {file && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-gray-50 p-3">
          <FileText className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-700 truncate">
            {file.name}
          </span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload PDF'
        )}
      </button>

      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default FileUploadComponent;
