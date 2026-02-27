import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeBuilderPage from '../ResumeBuilderPage';
import { ToastContext } from '../../contexts/ToastContext';

vi.mock('../../utils/api', () => ({
  buildResume: vi.fn(),
  apiClient: {
    post: vi.fn().mockResolvedValue({
      data: {
        technical: [],
        soft: [],
        languages: [],
      },
    }),
  },
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
    // Clear any pending timers from timed-out tests to prevent state contamination
    vi.clearAllTimers();
  });

  it('renders the builder page with step indicator and first step', () => {
    renderPage();

    expect(screen.getByText(/build your resume/i)).toBeInTheDocument();
    // Step indicator shows "Personal Info" (merged Basic Info + Target Role)
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    // First step should show full name field
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('navigates to next step on Next click', async () => {
    renderPage();

    // Should start at step 1 (Personal Info)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

    // Fill required fields in step 1
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0000' } });
    fireEvent.change(screen.getByLabelText(/^city \*/i), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText(/^country \*/i), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/target role/i), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText(/target industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/target country/i), { target: { value: 'US' } });

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Should now be at step 2 (Education)
    expect(screen.getByLabelText(/degree type/i)).toBeInTheDocument();
  }, 15000);

  it('navigates back on Back click', async () => {
    renderPage();

    // Fill required fields in step 1
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0000' } });
    fireEvent.change(screen.getByLabelText(/^city \*/i), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText(/^country \*/i), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/target role/i), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText(/target industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/target country/i), { target: { value: 'US' } });

    // Go to step 2 (Education)
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/degree type/i)).toBeInTheDocument();

    // Go back to step 1 (Personal Info)
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

    // Fill required fields in step 1 (Personal Info)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0000' } });
    fireEvent.change(screen.getByLabelText(/^city \*/i), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText(/^country \*/i), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/target role/i), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText(/target industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/target country/i), { target: { value: 'US' } });

    // Navigate to Education step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Fill Education fields using fireEvent for speed
    fireEvent.change(screen.getByLabelText(/degree type/i), { target: { value: 'Bachelor' } });
    fireEvent.change(screen.getByLabelText(/major/i), { target: { value: 'CS' } });
    fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'MIT' } });
    fireEvent.change(screen.getByLabelText(/graduation date/i), { target: { value: '2024-05' } });

    // Navigate to Experience step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Navigate to Projects step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Navigate to Skills step - this will trigger auto-generation
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for Skills auto-generation to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Navigate to Summary step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Verify we're on Summary step by waiting for the Summary field
    await waitFor(
      () => {
        expect(screen.getByLabelText(/^summary/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Fill professional summary (min 100 chars)
    const summary = 'Motivated software developer with strong skills in React and Node.js. ' +
      'Seeking opportunities to grow and contribute to innovative projects in the tech industry.';
    fireEvent.change(screen.getByLabelText(/^summary/i), { target: { value: summary } });

    // Navigate to Additional (last) step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Should show Submit button on last step
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  }, 15000);

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

    // Fill required fields in step 1 (Personal Info)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0000' } });
    fireEvent.change(screen.getByLabelText(/^city \*/i), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText(/^country \*/i), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/target role/i), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText(/target industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/target country/i), { target: { value: 'US' } });

    // Navigate to Education step and fill required fields
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.change(screen.getByLabelText(/degree type/i), { target: { value: 'Bachelor' } });
    fireEvent.change(screen.getByLabelText(/major/i), { target: { value: 'CS' } });
    fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'MIT' } });
    fireEvent.change(screen.getByLabelText(/graduation date/i), { target: { value: '2024-05' } });

    // Navigate through Experience, Projects to Skills
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Experience
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Projects
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Skills

    // Give React time to process the auto-generation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to Summary step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Verify we're on Summary step
    await waitFor(
      () => {
        expect(screen.getByLabelText(/^summary/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Fill professional summary (min 100 chars)
    const summary = 'Motivated software developer with strong skills in React and Node.js. ' +
      'Seeking opportunities to grow and contribute to innovative projects in the tech industry.';
    fireEvent.change(screen.getByLabelText(/^summary/i), { target: { value: summary } });

    // Navigate to Additional (last) step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Should show success message "Analysis complete!"
    expect(await screen.findByText(/analysis complete/i)).toBeInTheDocument();
    expect(mockBuildResume).toHaveBeenCalledTimes(1);
  }, 10000);

  it('shows error on API failure', async () => {
    mockBuildResume.mockRejectedValue({
      response: { data: { error: 'Server error occurred' } }
    });

    renderPage();

    // Fill required fields in step 1 (Personal Info)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0000' } });
    fireEvent.change(screen.getByLabelText(/^city \*/i), { target: { value: 'NYC' } });
    fireEvent.change(screen.getByLabelText(/^country \*/i), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/target role/i), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText(/target industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/target country/i), { target: { value: 'US' } });

    // Navigate to Education step and fill required fields
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.change(screen.getByLabelText(/degree type/i), { target: { value: 'Bachelor' } });
    fireEvent.change(screen.getByLabelText(/major/i), { target: { value: 'CS' } });
    fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'MIT' } });
    fireEvent.change(screen.getByLabelText(/graduation date/i), { target: { value: '2024-05' } });

    // Navigate through Experience, Projects to Skills
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Experience
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Projects
    await userEvent.click(screen.getByRole('button', { name: /next/i })); // → Skills

    // Give React time to process the auto-generation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to Summary step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Verify we're on Summary step
    await waitFor(
      () => {
        expect(screen.getByLabelText(/^summary/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Fill professional summary (min 100 chars)
    const summary = 'Motivated software developer with strong skills in React and Node.js. ' +
      'Seeking opportunities to grow and contribute to innovative projects in the tech industry.';
    fireEvent.change(screen.getByLabelText(/^summary/i), { target: { value: summary } });

    // Navigate to Additional (last) step
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Should show the error message
    expect(await screen.findByText(/server error occurred/i)).toBeInTheDocument();
  }, 10000);
});
