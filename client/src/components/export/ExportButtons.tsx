import { useState } from 'react';

interface ExportButtonsProps {
  onExportPdf: () => Promise<void>;
  onExportMarkdown: () => Promise<void>;
}

export default function ExportButtons({
  onExportPdf,
  onExportMarkdown,
}: ExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mdLoading, setMdLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePdf = async () => {
    setPdfLoading(true);
    setError('');
    try {
      await onExportPdf();
    } catch {
      setError('Failed to export PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkdown = async () => {
    setMdLoading(true);
    setError('');
    try {
      await onExportMarkdown();
    } catch {
      setError('Failed to export Markdown. Please try again.');
    } finally {
      setMdLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Export Resume
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handlePdf}
          disabled={pdfLoading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pdfLoading ? 'Exporting PDF...' : 'Download PDF'}
        </button>

        <button
          onClick={handleMarkdown}
          disabled={mdLoading}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {mdLoading ? 'Exporting Markdown...' : 'Download Markdown'}
        </button>
      </div>
    </div>
  );
}
