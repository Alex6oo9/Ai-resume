import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResumeAnalysisPage from '../ResumeAnalysisPage';
import { ToastContext } from '../../contexts/ToastContext';
import * as api from '../../utils/api';

vi.mock('../../utils/api');

const mockResume = {
  resume: {
    id: 'resume-1',
    target_role: 'Frontend Developer',
    target_country: 'United States',
    target_city: null,
    job_description: null,
    parsed_text: 'John Doe...',
    match_percentage: 75,
    ats_score: null,
    template_id: 'modern_minimal',
    form_data: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-0100',
      city: 'New York',
      country: 'United States',
      targetRole: 'Frontend Developer',
      targetCountry: 'United States',
      targetIndustry: 'Technology',
      education: [],
      experience: [],
      projects: [],
      skills: { technical: [], soft: [], languages: [] },
      professionalSummary: '',
    },
    ai_analysis: {
      strengths: ['Good React skills'],
      weaknesses: ['No TypeScript'],
      suggestions: ['Learn TypeScript'],
    },
  },
};

const mockMatchData = {
  matchPercentage: 75,
  strengths: ['Good React skills'],
  weaknesses: ['No TypeScript'],
  suggestions: ['Learn TypeScript'],
};

const mockTemplates = { templates: [], userTier: 'free' as const };

function renderPage() {
  return render(
    <ToastContext.Provider value={{ showToast: vi.fn() }}>
      <MemoryRouter initialEntries={['/resume/resume-1']}>
        <Routes>
          <Route path="/resume/:id" element={<ResumeAnalysisPage />} />
        </Routes>
      </MemoryRouter>
    </ToastContext.Provider>
  );
}

describe('ResumeAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getResume as ReturnType<typeof vi.fn>).mockResolvedValue(mockResume);
    (api.getMatchAnalysis as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockMatchData
    );
    (api.getTemplates as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockTemplates
    );
  });

  it('calls getResume and getMatchAnalysis on mount', async () => {
    renderPage();

    await waitFor(() => {
      expect(api.getResume).toHaveBeenCalledWith('resume-1');
      expect(api.getMatchAnalysis).toHaveBeenCalledWith('resume-1');
    });
  });

  it('renders MatchScoreCard with fetched data', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    expect(screen.getByText('Good React skills')).toBeInTheDocument();
    expect(screen.getByText('No TypeScript')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    (api.getResume as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('Calculate ATS Score button calls getAtsScore', async () => {
    const atsBreakdown = {
      formatCompliance: 35,
      keywordMatch: 30,
      sectionCompleteness: 18,
      totalScore: 83,
      keywords: { matched: ['React'], missing: ['TypeScript'] },
    };
    (api.getAtsScore as ReturnType<typeof vi.fn>).mockResolvedValue({
      atsBreakdown,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    const atsButton = screen.getByRole('button', {
      name: /calculate ats score/i,
    });
    fireEvent.click(atsButton);

    await waitFor(() => {
      expect(api.getAtsScore).toHaveBeenCalledWith('resume-1');
      expect(screen.getByText('83')).toBeInTheDocument();
    });
  });

  it('Get Detailed Suggestions button calls getImprovements', async () => {
    const improvements = {
      suggestions: ['Learn TypeScript'],
      detailed: {
        actionVerbs: [],
        quantifiedAchievements: [],
        missingSections: ['Certifications'],
        keywordOptimization: [],
        formattingIssues: [],
      },
    };
    (api.getImprovements as ReturnType<typeof vi.fn>).mockResolvedValue(
      improvements
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    const improveButton = screen.getByRole('button', {
      name: /get detailed suggestions/i,
    });
    fireEvent.click(improveButton);

    await waitFor(() => {
      expect(api.getImprovements).toHaveBeenCalledWith('resume-1', false);
      expect(screen.getByText('Certifications')).toBeInTheDocument();
    });
  });

  it('shows Back to Dashboard link', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it('renders export buttons', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /download markdown/i })
    ).toBeInTheDocument();
  });

  it('PDF button triggers exportPdfWithTemplate', async () => {
    (api.exportPdfWithTemplate as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    await waitFor(() => {
      expect(api.exportPdfWithTemplate).toHaveBeenCalledWith(
        'modern_minimal',
        mockResume.resume.form_data
      );
    });
  });

  it('Markdown button triggers exportMarkdown', async () => {
    (api.exportMarkdown as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /download markdown/i })
    );

    await waitFor(() => {
      expect(api.exportMarkdown).toHaveBeenCalledWith('resume-1');
    });
  });
});
