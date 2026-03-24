import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CoverLetterPage from '../CoverLetterPage';

const mockApiClient = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../utils/api', () => ({
  listResumes: vi.fn().mockResolvedValue({ resumes: [] }),
  generateCoverLetter: vi.fn(),
  getCoverLetter: vi.fn(),
  saveCoverLetter: vi.fn(),
  deleteCoverLetter: vi.fn(),
  extractKeywords: vi.fn(),
  listCoverLettersByResume: vi.fn(),
  regenerateCoverLetter: vi.fn(),
  parseResumeText: vi.fn(),
  improveCoverLetter: vi.fn(),
  apiClient: mockApiClient,
  default: mockApiClient,
}));

// Mock useCoverLetters hook
vi.mock('../../hooks/useCoverLetters', () => ({
  useCoverLetters: vi.fn(),
}));

// Mock TipTap editor to avoid complex DOM setup in tests
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => ''),
    commands: {
      setContent: vi.fn(),
      toggleBold: vi.fn(() => ({ run: vi.fn() })),
      toggleItalic: vi.fn(() => ({ run: vi.fn() })),
      toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
      toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      undo: vi.fn(() => ({ run: vi.fn() })),
      redo: vi.fn(() => ({ run: vi.fn() })),
    },
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
        undo: vi.fn(() => ({ run: vi.fn() })),
        redo: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    isActive: vi.fn(() => false),
    destroy: vi.fn(),
  })),
  EditorContent: ({ editor }: any) => (
    <div data-testid="tiptap-editor">{editor ? 'editor' : null}</div>
  ),
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

import * as api from '../../utils/api';
import { useCoverLetters } from '../../hooks/useCoverLetters';

const mockCoverLetter = {
  id: 'cl-id',
  resume_id: 'resume-1',
  user_id: 'user-1',
  content: 'Dear Hiring Manager, I am excited to apply for...',
  generated_content: 'Dear Hiring Manager, I am excited to apply for...',
  tone: 'professional' as const,
  word_count_target: 'medium' as const,
  company_name: 'Acme Corp',
  hiring_manager_name: 'John Smith',
  job_title: null,
  job_description: null,
  custom_instructions: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// defaultHookReturn matches the UseCoverLettersReturn interface
const defaultHookReturn = {
  coverLetters: [],
  activeLetter: null,
  mode: 'new' as const,
  keywords: { matched: [], missing: [] },
  progressStep: 'idle' as const,
  isLoading: false,
  isSaving: false,
  savedIndicator: false,
  error: null,
  resumeInputMode: 'existing' as const,
  uploadedResumeText: null,
  uploadedFileName: null,
  uploadedResumeId: null,
  uploadedResumeFilePath: null,
  isParsing: false,
  parseError: null,
  startNew: vi.fn(),
  selectLetter: vi.fn(),
  loadLetter: vi.fn(),
  create: vi.fn(),
  regenerate: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  reset: vi.fn(),
  setResumeInputMode: vi.fn(),
  parseUploadedFile: vi.fn(),
  improve: vi.fn(),
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/cover-letter/new']}>
      <Routes>
        <Route path="/cover-letter/new" element={<CoverLetterPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CoverLetterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCoverLetters).mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders generate button and key form controls on load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Generate Cover Letter/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/e.g. Acme Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Short/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium/i)).toBeInTheDocument();
    expect(screen.getByText(/Long/i)).toBeInTheDocument();
  });

  it('renders empty state when no cover letter and not generating', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Ready to generate/i)).toBeInTheDocument();
    });
  });

  it('shows 3-step progress panel when progressStep is extracting', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      progressStep: 'extracting',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Scanning resume and job description/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Analyzing keyword matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Writing your ATS-optimized cover letter/i)).toBeInTheDocument();
  });

  it('shows 3-step progress panel when progressStep is generating', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      progressStep: 'generating',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Writing your ATS-optimized cover letter/i)).toBeInTheDocument();
    });
  });

  it('renders TipTap editor when activeLetter is set', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
    });
  });

  it('Generate button shows Generating... text and is disabled when progressStep is generating', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      progressStep: 'generating',
    });
    renderPage();
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Generating\.\.\./i });
      expect(btn).toBeDisabled();
    });
  });

  it('Generate button shows Regenerate when mode is edit', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
      mode: 'edit',
      coverLetters: [mockCoverLetter],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /↺ Regenerate/i })).toBeInTheDocument();
    });
  });

  it('Generate button shows confirmation dialog when mode is edit and button is clicked', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
      mode: 'edit',
      coverLetters: [mockCoverLetter],
    });
    vi.mocked(api.listResumes).mockResolvedValue({
      resumes: [{ id: 'resume-1', target_role: 'Frontend Developer', target_country: 'US' }],
    } as any);

    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Frontend Developer/i })).toBeInTheDocument();
    });

    // Enable the Generate button by filling required fields
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'resume-1' } });
    fireEvent.change(screen.getByPlaceholderText(/Paste the job description/i), {
      target: { value: 'React developer needed' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Acme Corp/i), {
      target: { value: 'Acme Corp' },
    });

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /↺ Regenerate/i });
      expect(btn).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /↺ Regenerate/i }));
    expect(screen.getByText(/Regenerate cover letter\?/i)).toBeInTheDocument();
  });

  it('mode is new shows Generate Cover Letter button, calls create on click', async () => {
    const mockCreate = vi.fn();
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      mode: 'new',
      create: mockCreate,
    });
    vi.mocked(api.listResumes).mockResolvedValue({
      resumes: [{ id: 'resume-1', target_role: 'Dev', target_country: 'US' }],
    } as any);

    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Dev/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'resume-1' } });
    fireEvent.change(screen.getByPlaceholderText(/Paste the job description/i), {
      target: { value: 'React developer needed' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Acme Corp/i), {
      target: { value: 'Acme Corp' },
    });

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Generate Cover Letter/i });
      expect(btn).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('Job Title field is present in the form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Job title \(optional\)/i)).toBeInTheDocument();
    });
  });

  it('letters list renders when coverLetters.length > 0', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      coverLetters: [mockCoverLetter],
      activeLetter: mockCoverLetter,
      mode: 'edit',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/\+ New/i)).toBeInTheDocument();
      expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
    });
  });

  it('clicking + New button calls startNew', async () => {
    const mockStartNew = vi.fn();
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      coverLetters: [mockCoverLetter],
      activeLetter: mockCoverLetter,
      mode: 'edit',
      startNew: mockStartNew,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/\+ New/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/\+ New/i));
    expect(mockStartNew).toHaveBeenCalledTimes(1);
  });

  it('clicking letter card calls selectLetter', async () => {
    const mockSelectLetter = vi.fn();
    const secondLetter = { ...mockCoverLetter, id: 'cl-id-2', company_name: 'Beta Corp' };
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      coverLetters: [mockCoverLetter, secondLetter],
      activeLetter: mockCoverLetter,
      mode: 'edit',
      selectLetter: mockSelectLetter,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Beta Corp')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Beta Corp'));
    expect(mockSelectLetter).toHaveBeenCalledWith(secondLetter);
  });

  it('delete button on letter card shows delete confirm dialog', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      coverLetters: [mockCoverLetter],
      activeLetter: mockCoverLetter,
      mode: 'edit',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    await waitFor(() => {
      expect(screen.getByText(/Delete this cover letter\?/i)).toBeInTheDocument();
    });
  });

  it('confirming delete calls remove with letter id', async () => {
    const mockRemove = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      coverLetters: [mockCoverLetter],
      activeLetter: mockCoverLetter,
      mode: 'edit',
      remove: mockRemove,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    await waitFor(() => {
      expect(screen.getByText(/Delete this cover letter\?/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
    expect(mockRemove).toHaveBeenCalledWith(mockCoverLetter.id);
  });

  it('error card is shown when progressStep is error', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      progressStep: 'error',
      error: 'Failed to generate cover letter',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate cover letter/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('Try again button in error card calls reset()', async () => {
    const mockReset = vi.fn();
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      progressStep: 'error',
      error: 'Failed to generate cover letter',
      reset: mockReset,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('Save Changes button is disabled when isSaving is true', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
      isSaving: true,
    });
    renderPage();
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Saving\.\.\./i });
      expect(btn).toBeDisabled();
    });
  });

  it('savedIndicator shows Saved ✓ in the save button', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
      savedIndicator: true,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Saved ✓/i)).toBeInTheDocument();
    });
  });

  it('Refine with AI accordion appears when activeLetter is set', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
      mode: 'edit',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Refine with AI/i)).toBeInTheDocument();
    });
  });

  it('Download .txt button is shown when activeLetter is set', async () => {
    vi.mocked(useCoverLetters).mockReturnValue({
      ...defaultHookReturn,
      activeLetter: mockCoverLetter,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download .txt/i })).toBeInTheDocument();
    });
  });
});
