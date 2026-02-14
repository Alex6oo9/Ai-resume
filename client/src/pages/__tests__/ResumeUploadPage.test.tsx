import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeUploadPage from '../ResumeUploadPage';
import { ToastContext } from '../../contexts/ToastContext';

// Mock the API module
vi.mock('../../utils/api', () => ({
  uploadResume: vi.fn(),
  default: { post: vi.fn() },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { uploadResume } from '../../utils/api';

const mockUploadResume = uploadResume as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <ToastContext.Provider value={{ showToast: vi.fn() }}>
      <MemoryRouter>
        <ResumeUploadPage />
      </MemoryRouter>
    </ToastContext.Provider>
  );
}

describe('ResumeUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the upload page with dropzone and form', () => {
    renderPage();

    expect(screen.getByText(/upload.*resume/i)).toBeInTheDocument();
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
  });

  it('disables submit when no file is selected', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/target role/i), 'Developer');
    await userEvent.type(screen.getByLabelText(/country/i), 'US');
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    // Should show an error about needing a file
    expect(screen.getByText(/please upload.*pdf/i)).toBeInTheDocument();
    expect(mockUploadResume).not.toHaveBeenCalled();
  });

  it('completes upload flow successfully with mocked API', async () => {
    mockUploadResume.mockResolvedValue({
      resume: {
        id: 'resume-123',
        match_percentage: 85,
        ai_analysis: {
          strengths: ['Good skills'],
          weaknesses: ['Missing experience'],
          suggestions: ['Add projects'],
        },
      },
    });

    renderPage();

    // Step 1: Upload a file via drop
    const dropzone = screen.getByTestId('dropzone');
    const pdfFile = new File(['fake pdf'], 'resume.pdf', {
      type: 'application/pdf',
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [pdfFile] },
    });

    // File should be shown
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();

    // Step 2: Fill in form fields
    await userEvent.type(screen.getByLabelText(/target role/i), 'Frontend Dev');
    await userEvent.type(screen.getByLabelText(/country/i), 'US');

    // Step 3: Submit
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    // Should show success (mock resolves instantly so uploading state is transient)
    expect(await screen.findByText(/complete/i)).toBeInTheDocument();

    // API should have been called with FormData
    expect(mockUploadResume).toHaveBeenCalledTimes(1);
    const callArg = mockUploadResume.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(FormData);
  });

  it('shows error state on API failure', async () => {
    mockUploadResume.mockRejectedValue(new Error('Server error'));

    renderPage();

    // Upload file
    const dropzone = screen.getByTestId('dropzone');
    const pdfFile = new File(['fake pdf'], 'resume.pdf', {
      type: 'application/pdf',
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [pdfFile] },
    });

    // Fill form
    await userEvent.type(screen.getByLabelText(/target role/i), 'Developer');
    await userEvent.type(screen.getByLabelText(/country/i), 'US');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    // Should show error
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
