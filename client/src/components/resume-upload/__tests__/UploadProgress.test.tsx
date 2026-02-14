import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UploadProgress, { UploadStatus } from '../UploadProgress';

describe('UploadProgress', () => {
  it('shows uploading state', () => {
    render(<UploadProgress status="uploading" />);
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it('shows parsing state', () => {
    render(<UploadProgress status="parsing" />);
    expect(screen.getByText(/parsing/i)).toBeInTheDocument();
  });

  it('shows analyzing state', () => {
    render(<UploadProgress status="analyzing" />);
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it('shows success state', () => {
    render(<UploadProgress status="success" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it('shows error state with message', () => {
    render(<UploadProgress status="error" errorMessage="Upload failed" />);
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it('shows error state with default message', () => {
    render(<UploadProgress status="error" />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
