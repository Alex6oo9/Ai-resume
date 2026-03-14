import { useState, useEffect } from 'react';
import type { CoverLetter, GenerateCoverLetterPayload, Keywords, ProgressStep } from '../types';
import {
  getCoverLetter,
  generateCoverLetter as generateCoverLetterApi,
  saveCoverLetter,
  extractKeywords as extractKeywordsApi,
} from '../utils/api';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UseCoverLetterReturn {
  coverLetter: CoverLetter | null;
  keywords: Keywords;
  progressStep: ProgressStep;
  isLoading: boolean;
  isSaving: boolean;
  savedIndicator: boolean;
  error: string | null;
  generate: (payload: GenerateCoverLetterPayload) => Promise<void>;
  save: (content: string) => Promise<void>;
  reset: () => void;
}

export function useCoverLetter(resumeId: string | null): UseCoverLetterReturn {
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [keywords, setKeywords] = useState<Keywords>({ matched: [], missing: [] });
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when resumeId changes
    setCoverLetter(null);
    setKeywords({ matched: [], missing: [] });
    setProgressStep('idle');
    setError(null);

    if (!resumeId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getCoverLetter(resumeId)
      .then((response) => {
        if (!cancelled) {
          setCoverLetter(response.data.coverLetter);
        }
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 404) {
          setError(
            err?.response?.data?.message || err?.message || 'Failed to load cover letter'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  const generate = async (payload: GenerateCoverLetterPayload): Promise<void> => {
    setError(null);

    let matchedKeywords: string[];
    let missingKeywords: string[];

    try {
      setProgressStep('extracting');
      const res = await extractKeywordsApi(
        payload.resumeId ? { resumeId: payload.resumeId } : { resumeText: payload.resumeText || '' },
        payload.jobDescription
      );
      matchedKeywords = res.data.matchedKeywords;
      missingKeywords = res.data.missingKeywords;
      setKeywords({ matched: matchedKeywords, missing: missingKeywords });
      setProgressStep('keywords-ready');
      await sleep(1200);

      setProgressStep('generating');
      const genRes = await generateCoverLetterApi({
        ...payload,
        matchedKeywords,
        missingKeywords,
      });
      setCoverLetter(genRes.data.coverLetter);
      setProgressStep('done');
    } catch (err: any) {
      setProgressStep('error');
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to generate cover letter'
      );
    }
  };

  const save = async (content: string): Promise<void> => {
    const id = resumeId || coverLetter?.resume_id;
    if (!id) return;

    setIsSaving(true);
    try {
      const response = await saveCoverLetter(id, content);
      const updated = response.data.coverLetter;
      setCoverLetter((prev) => (prev ? { ...prev, content: updated.content } : updated));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to save cover letter'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setProgressStep('idle');
    setError(null);
  };

  return {
    coverLetter,
    keywords,
    progressStep,
    isLoading,
    isSaving,
    savedIndicator,
    error,
    generate,
    save,
    reset,
  };
}
