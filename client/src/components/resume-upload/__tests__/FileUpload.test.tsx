import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  it('renders the dropzone with instructions', () => {
    render(<FileUpload file={null} onFileSelect={vi.fn()} onFileRemove={vi.fn()} />);

    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf/i)).toBeInTheDocument();
  });

  it('accepts a PDF file via file input', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload file={null} onFileSelect={onFileSelect} onFileRemove={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(['fake pdf content'], 'resume.pdf', {
      type: 'application/pdf',
    });

    await userEvent.upload(input, pdfFile);

    expect(onFileSelect).toHaveBeenCalledWith(pdfFile);
  });

  it('rejects non-PDF files', () => {
    const onFileSelect = vi.fn();
    render(<FileUpload file={null} onFileSelect={onFileSelect} onFileRemove={vi.fn()} />);

    const dropzone = screen.getByTestId('dropzone');
    const txtFile = new File(['text content'], 'resume.txt', {
      type: 'text/plain',
    });

    // Use drop to bypass the accept attribute filtering
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [txtFile] },
    });

    // Should not call onFileSelect for non-PDF files
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/only pdf/i)).toBeInTheDocument();
  });

  it('shows file info when a file is selected', () => {
    const file = new File(['fake pdf'], 'my-resume.pdf', {
      type: 'application/pdf',
    });

    render(<FileUpload file={file} onFileSelect={vi.fn()} onFileRemove={vi.fn()} />);

    expect(screen.getByText('my-resume.pdf')).toBeInTheDocument();
  });

  it('calls onFileRemove when remove button is clicked', async () => {
    const onFileRemove = vi.fn();
    const file = new File(['fake pdf'], 'resume.pdf', {
      type: 'application/pdf',
    });

    render(<FileUpload file={file} onFileSelect={vi.fn()} onFileRemove={onFileRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeButton);

    expect(onFileRemove).toHaveBeenCalledTimes(1);
  });

  it('accepts a PDF file via drop', () => {
    const onFileSelect = vi.fn();
    render(<FileUpload file={null} onFileSelect={onFileSelect} onFileRemove={vi.fn()} />);

    const dropzone = screen.getByTestId('dropzone');
    const pdfFile = new File(['fake pdf'], 'resume.pdf', {
      type: 'application/pdf',
    });

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [pdfFile] },
    });

    expect(onFileSelect).toHaveBeenCalledWith(pdfFile);
  });
});
