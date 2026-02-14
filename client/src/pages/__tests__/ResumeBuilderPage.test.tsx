import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeBuilderPage from '../ResumeBuilderPage';
import { ToastContext } from '../../contexts/ToastContext';

vi.mock('../../utils/api', () => ({
  buildResume: vi.fn(),
  default: { post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { buildResume } from '../../utils/api';
const mockBuildResume = buildResume as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <ToastContext.Provider value={{ showToast: vi.fn() }}>
      <MemoryRouter>
        <ResumeBuilderPage />
      </MemoryRouter>
    </ToastContext.Provider>
  );
}

describe('ResumeBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the builder page with step indicator and first step', () => {
    renderPage();

    expect(screen.getByText(/build your resume/i)).toBeInTheDocument();
    // Step indicator has "Basic Info" and step content has "Basic Information"
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    // First step should show full name field
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('navigates to next step on Next click', async () => {
    renderPage();

    // Should start at step 1 (Basic Info)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Should now be at step 2 (Target Role)
    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
  });

  it('navigates back on Back click', async () => {
    renderPage();

    // Go to step 2
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();

    // Go back to step 1
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('does not show Back button on first step', () => {
    renderPage();

    expect(
      screen.queryByRole('button', { name: /back/i })
    ).not.toBeInTheDocument();
  });

  it('shows Submit button on last step', async () => {
    renderPage();

    // Navigate through all steps to reach the last one (7 steps, 6 Next clicks)
    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submits form data and shows success on last step', async () => {
    mockBuildResume.mockResolvedValue({
      resume: {
        id: 'resume-123',
        match_percentage: 85,
        ai_analysis: {
          strengths: ['Good'],
          weaknesses: ['Improve'],
          suggestions: ['Add more'],
        },
      },
    });

    renderPage();

    // Navigate to last step
    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Should show success
    expect(await screen.findByText(/complete/i)).toBeInTheDocument();
    expect(mockBuildResume).toHaveBeenCalledTimes(1);
  });

  it('shows error on API failure', async () => {
    mockBuildResume.mockRejectedValue(new Error('Server error'));

    renderPage();

    // Navigate to last step
    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});
