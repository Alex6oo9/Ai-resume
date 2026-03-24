import { useState, useEffect } from 'react';
import type { CoverLetter, GenerateCoverLetterPayload, Keywords, ProgressStep } from '../types';
import {
  listCoverLettersByResume as listCoverLettersByResumeApi,
  getCoverLetter as getCoverLetterApi,
  generateCoverLetter as generateCoverLetterApi,
  regenerateCoverLetter as regenerateCoverLetterApi,
  saveCoverLetter as saveCoverLetterApi,
  deleteCoverLetter as deleteCoverLetterApi,
  extractKeywords as extractKeywordsApi,
  uploadResumeSimple as uploadResumeSimpleApi,
  improveCoverLetter as improveCoverLetterApi,
} from '../utils/api';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type CoverLetterMode = 'new' | 'edit';
export type ResumeInputMode = 'existing' | 'upload';

export interface ExtractedContactInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface UseCoverLettersReturn {
  coverLetters: CoverLetter[];
  activeLetter: CoverLetter | null;
  mode: CoverLetterMode;
  keywords: Keywords;
  progressStep: ProgressStep;
  isLoading: boolean;
  isSaving: boolean;
  savedIndicator: boolean;
  error: string | null;
  // Resume input mode
  resumeInputMode: ResumeInputMode;
  uploadedResumeText: string | null;
  uploadedFileName: string | null;
  uploadedResumeId: string | null;
  uploadedResumeFilePath: string | null;
  isParsing: boolean;
  parseError: string | null;
  extractedContactInfo: ExtractedContactInfo | null;
  // Methods
  startNew: () => void;
  selectLetter: (letter: CoverLetter) => void;
  loadLetter: (letterId: string) => Promise<void>;
  create: (payload: GenerateCoverLetterPayload) => Promise<{ resumeSaved?: boolean }>;
  regenerate: (letterId: string, payload: GenerateCoverLetterPayload) => Promise<void>;
  save: (content: string) => Promise<void>;
  remove: (letterId: string) => Promise<void>;
  reset: () => void;
  setResumeInputMode: (mode: ResumeInputMode) => void;
  parseUploadedFile: (file: File) => Promise<void>;
  improve: (letterId: string, whyThisCompany?: string, achievementToHighlight?: string) => Promise<void>;
}

export function useCoverLetters(resumeId: string | null): UseCoverLettersReturn {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [activeLetter, setActiveLetter] = useState<CoverLetter | null>(null);
  const [mode, setMode] = useState<CoverLetterMode>('new');
  const [keywords, setKeywords] = useState<Keywords>({ matched: [], missing: [] });
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resume input mode
  const [resumeInputMode, setResumeInputModeState] = useState<ResumeInputMode>('existing');
  const [uploadedResumeText, setUploadedResumeText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [uploadedResumeFilePath, setUploadedResumeFilePath] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [extractedContactInfo, setExtractedContactInfo] = useState<ExtractedContactInfo | null>(null);

  useEffect(() => {
    setCoverLetters([]);
    setActiveLetter(null);
    setMode('new');
    setKeywords({ matched: [], missing: [] });
    setProgressStep('idle');
    setError(null);

    if (!resumeId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    listCoverLettersByResumeApi(resumeId)
      .then((response) => {
        if (!cancelled) {
          const letters = response.coverLetters;
          setCoverLetters(letters);
          if (letters.length > 0) {
            setActiveLetter(letters[0]);
            setMode('edit');
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || err?.message || 'Failed to load cover letters'
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

  const startNew = () => {
    setActiveLetter(null);
    setMode('new');
    setProgressStep('idle');
    setKeywords({ matched: [], missing: [] });
    setError(null);
  };

  const selectLetter = (letter: CoverLetter) => {
    setActiveLetter(letter);
    setMode('edit');
    setProgressStep('idle');
    setError(null);
  };

  const setResumeInputMode = (mode: ResumeInputMode) => {
    setResumeInputModeState(mode);
    if (mode === 'existing') {
      setUploadedResumeText(null);
      setUploadedFileName(null);
      setUploadedResumeId(null);
      setUploadedResumeFilePath(null);
      setParseError(null);
    } else {
      // switching to upload — clear existing-mode data if needed
      setParseError(null);
    }
  };

  const parseUploadedFile = async (file: File): Promise<void> => {
    setIsParsing(true);
    setParseError(null);
    setUploadedResumeText(null);
    setUploadedFileName(null);
    setUploadedResumeId(null);
    setUploadedResumeFilePath(null);
    try {
      // Save PDF to Cloudinary + DB so it appears in Dashboard "Uploaded" tab
      const { resume } = await uploadResumeSimpleApi(file);
      setUploadedResumeId(resume.id);
      setUploadedResumeFilePath(resume.file_path);
      setUploadedResumeText(resume.parsed_text ?? null);
      setUploadedFileName(file.name);
    } catch (err: any) {
      setParseError(
        err?.response?.data?.message || err?.message || 'Failed to upload PDF'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const loadLetter = async (letterId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await getCoverLetterApi(letterId);
      const letter = response.coverLetter;
      setCoverLetters([letter]);
      setActiveLetter(letter);
      setMode('edit');
      setProgressStep('idle');
      setError(null);
      if (letter.resume_id) {
        listCoverLettersByResumeApi(letter.resume_id)
          .then((r) => setCoverLetters(r.coverLetters))
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load cover letter');
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (payload: GenerateCoverLetterPayload): Promise<{ resumeSaved?: boolean }> => {
    setError(null);

    let matchedKeywords: string[];
    let missingKeywords: string[];

    // If user uploaded a PDF in this session, treat it as an existing resume via its saved ID
    const isUploadMode = resumeInputMode === 'upload' && uploadedResumeId;

    try {
      setProgressStep('extracting');

      // Extract keywords using the saved resumeId (upload mode) or provided resumeId
      const kwPayload = isUploadMode
        ? { resumeId: uploadedResumeId! }
        : { resumeId: payload.resumeId! };

      const res = await extractKeywordsApi(kwPayload, payload.jobDescription);
      matchedKeywords = res.matchedKeywords;
      missingKeywords = res.missingKeywords;
      setKeywords({ matched: matchedKeywords, missing: missingKeywords });
      if (res.contactInfo) setExtractedContactInfo(res.contactInfo);
      setProgressStep('keywords-ready');
      await sleep(1200);

      setProgressStep('generating');

      const genPayload: GenerateCoverLetterPayload = {
        ...payload,
        matchedKeywords,
        missingKeywords,
      };

      if (isUploadMode) {
        genPayload.resumeId = uploadedResumeId!;
        delete genPayload.resumeText;
      }

      const genRes = await generateCoverLetterApi(genPayload);
      const newLetter = genRes.coverLetter;

      setCoverLetters((prev) => [newLetter, ...prev]);
      setActiveLetter(newLetter);
      setMode('edit');
      setProgressStep('done');
      return { resumeSaved: genRes.resumeSaved === true };
    } catch (err: any) {
      setProgressStep('error');
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to generate cover letter'
      );
      return {};
    }
  };

  const regenerate = async (letterId: string, payload: GenerateCoverLetterPayload): Promise<void> => {
    setError(null);

    try {
      setProgressStep('generating');
      const res = await regenerateCoverLetterApi(letterId, payload);
      const updated = res.coverLetter;
      setCoverLetters((prev) => prev.map((cl) => (cl.id === letterId ? updated : cl)));
      setActiveLetter(updated);
      setProgressStep('done');
    } catch (err: any) {
      setProgressStep('error');
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to regenerate cover letter'
      );
    }
  };

  const save = async (content: string): Promise<void> => {
    if (!activeLetter || !activeLetter.id) return;

    setIsSaving(true);
    try {
      const response = await saveCoverLetterApi(activeLetter.id, content);
      const updated = response.coverLetter;
      setCoverLetters((prev) =>
        prev.map((cl) => (cl.id === activeLetter.id ? { ...cl, content: updated.content } : cl))
      );
      setActiveLetter((prev) => (prev ? { ...prev, content: updated.content } : prev));
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

  const remove = async (letterId: string): Promise<void> => {
    try {
      await deleteCoverLetterApi(letterId);
      const remaining = coverLetters.filter((cl) => cl.id !== letterId);
      setCoverLetters(remaining);
      if (activeLetter?.id === letterId) {
        if (remaining.length > 0) {
          setActiveLetter(remaining[0]);
          setMode('edit');
        } else {
          setActiveLetter(null);
          setMode('new');
        }
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to delete cover letter'
      );
    }
  };

  const reset = () => {
    setProgressStep('idle');
    setError(null);
    setExtractedContactInfo(null);
  };

  const improve = async (
    letterId: string,
    whyThisCompany?: string,
    achievementToHighlight?: string
  ): Promise<void> => {
    setError(null);
    try {
      setProgressStep('generating');
      const res = await improveCoverLetterApi(letterId, { whyThisCompany, achievementToHighlight });
      const updated = res.coverLetter;
      setCoverLetters((prev) => prev.map((cl) => (cl.id === letterId ? updated : cl)));
      setActiveLetter(updated);
      setProgressStep('done');
    } catch (err: any) {
      setProgressStep('error');
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to improve cover letter'
      );
    }
  };

  return {
    coverLetters,
    activeLetter,
    mode,
    keywords,
    progressStep,
    isLoading,
    isSaving,
    savedIndicator,
    error,
    resumeInputMode,
    uploadedResumeText,
    uploadedFileName,
    uploadedResumeId,
    uploadedResumeFilePath,
    isParsing,
    parseError,
    extractedContactInfo,
    startNew,
    selectLetter,
    loadLetter,
    create,
    regenerate,
    save,
    remove,
    reset,
    setResumeInputMode,
    parseUploadedFile,
    improve,
  };
}
