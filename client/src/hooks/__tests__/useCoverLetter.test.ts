import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCoverLetter } from '../useCoverLetter';

// Mock api module
vi.mock('../../utils/api', () => ({
  getCoverLetter: vi.fn(),
  generateCoverLetter: vi.fn(),
  saveCoverLetter: vi.fn(),
  extractKeywords: vi.fn(),
}));

import * as api from '../../utils/api';

const RESUME_ID = 'test-resume-id';

const mockCoverLetter = {
  id: 'cl-id',
  resume_id: RESUME_ID,
  content: 'Dear Hiring Manager...',
  generated_content: 'Dear Hiring Manager...',
  tone: 'professional' as const,
  word_count_target: 'medium' as const,
  company_name: 'Acme Corp',
  hiring_manager_name: 'John Smith',
  job_title: null,
  custom_instructions: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const basePayload = {
  resumeId: RESUME_ID,
  fullName: 'Jane Doe',
  jobDescription: 'Software engineer role',
  companyName: 'Acme Corp',
  tone: 'professional' as const,
  wordCountTarget: 'medium' as const,
  matchedKeywords: [],
  missingKeywords: [],
};

describe('useCoverLetter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.extractKeywords).mockResolvedValue({
      data: { matchedKeywords: [], missingKeywords: [] },
    } as any);
  });

  it('fetches existing cover letter on mount when one exists', async () => {
    vi.mocked(api.getCoverLetter).mockResolvedValue({ data: { coverLetter: mockCoverLetter } } as any);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.coverLetter).toEqual(mockCoverLetter);
    expect(result.current.coverLetter?.content).toBe('Dear Hiring Manager...');
    expect(result.current.coverLetter?.generated_content).toBe('Dear Hiring Manager...');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets coverLetter to null on 404 without setting error', async () => {
    const err = { response: { status: 404 } };
    vi.mocked(api.getCoverLetter).mockRejectedValue(err);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.coverLetter).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets progressStep to generating during generation, done after', async () => {
    vi.mocked(api.getCoverLetter).mockRejectedValue({ response: { status: 404 } });

    vi.mocked(api.generateCoverLetter).mockResolvedValue({ data: { coverLetter: mockCoverLetter } } as any);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.generate(basePayload);
    });

    expect(result.current.progressStep).toBe('done');
  });

  it('updates coverLetter state including generated_content after successful generate', async () => {
    vi.mocked(api.getCoverLetter).mockRejectedValue({ response: { status: 404 } });
    vi.mocked(api.generateCoverLetter).mockResolvedValue({ data: { coverLetter: mockCoverLetter } } as any);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.generate(basePayload);
    });

    expect(result.current.coverLetter).toEqual(mockCoverLetter);
    expect(result.current.coverLetter?.generated_content).toBe('Dear Hiring Manager...');
  });

  it('sets isSaving to true during save, false after', async () => {
    vi.mocked(api.getCoverLetter).mockResolvedValue({ data: { coverLetter: mockCoverLetter } } as any);

    let resolveSave!: (value: any) => void;
    const savePromise = new Promise((resolve) => { resolveSave = resolve; });
    vi.mocked(api.saveCoverLetter).mockReturnValue(savePromise as any);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      result.current.save('Updated content');
    });

    expect(result.current.isSaving).toBe(true);

    await act(async () => {
      resolveSave({ data: { coverLetter: { ...mockCoverLetter, content: 'Updated content' } } });
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('save updates only coverLetter.content, leaves generated_content unchanged', async () => {
    const initialLetter = { ...mockCoverLetter, generated_content: 'AI original text' };
    vi.mocked(api.getCoverLetter).mockResolvedValue({ data: { coverLetter: initialLetter } } as any);
    vi.mocked(api.saveCoverLetter).mockResolvedValue({
      data: { coverLetter: { ...initialLetter, content: 'User edited' } },
    } as any);

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.save('User edited');
    });

    expect(result.current.coverLetter?.content).toBe('User edited');
    expect(result.current.coverLetter?.generated_content).toBe('AI original text');
  });

  it('sets error on API failure during generate', async () => {
    vi.mocked(api.getCoverLetter).mockRejectedValue({ response: { status: 404 } });
    vi.mocked(api.generateCoverLetter).mockRejectedValue({
      response: { data: { message: 'AI error' } },
    });

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.generate(basePayload);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.progressStep).toBe('error');
  });

  it('sets error on API failure during save', async () => {
    vi.mocked(api.getCoverLetter).mockResolvedValue({ data: { coverLetter: mockCoverLetter } } as any);
    vi.mocked(api.saveCoverLetter).mockRejectedValue({
      response: { data: { message: 'Save failed' } },
    });

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.save('Some content');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isSaving).toBe(false);
  });

  it('reset clears progressStep and error', async () => {
    vi.mocked(api.getCoverLetter).mockRejectedValue({ response: { status: 404 } });
    vi.mocked(api.generateCoverLetter).mockRejectedValue(new Error('AI error'));

    const { result } = renderHook(() => useCoverLetter(RESUME_ID));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.generate(basePayload);
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.reset();
    });

    expect(result.current.progressStep).toBe('idle');
    expect(result.current.error).toBeNull();
  });
});
