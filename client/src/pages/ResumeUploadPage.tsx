import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import FileUpload from '../components/resume-upload/FileUpload';
import TargetRoleForm, {
  TargetRoleData,
} from '../components/resume-upload/TargetRoleForm';
import UploadProgress, {
  UploadStatus,
} from '../components/resume-upload/UploadProgress';
import { uploadResume } from '../utils/api';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    for (const id of timeoutIdsRef.current) {
      clearTimeout(id);
    }
    timeoutIdsRef.current = [];
  };

  // Cleanup on unmount / back navigation
  useEffect(() => {
    return () => {
      clearTimeouts();
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    clearTimeouts();
    setStatus(null);
    setErrorMessage('');
  };

  const handleSubmit = async (data: TargetRoleData) => {
    if (!file) {
      setFileError('Please upload a PDF file first');
      return;
    }

    setFileError('');
    setStatus('uploading');
    setErrorMessage('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Schedule timed progress transitions
    timeoutIdsRef.current.push(
      setTimeout(() => setStatus('parsing'), 1500),
      setTimeout(() => setStatus('analyzing'), 3000)
    );

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', data.targetRole);
      formData.append('targetCountry', data.targetCountry);
      if (data.targetCity) {
        formData.append('targetCity', data.targetCity);
      }
      if (data.jobDescription) {
        formData.append('jobDescription', data.jobDescription);
      }

      const result = await uploadResume(formData, { signal: controller.signal });

      clearTimeouts();
      setStatus('success');
      showToast('Resume uploaded and analyzed successfully');

      // Navigate after brief delay so user sees success state
      const navTimeout = setTimeout(() => {
        navigate(`/resume/${result.resume.id}`);
      }, 500);
      timeoutIdsRef.current.push(navTimeout);
    } catch (err: any) {
      clearTimeouts();

      // Don't show error on intentional cancellation
      if (axios.isCancel(err)) {
        return;
      }

      setStatus('error');
      setErrorMessage(
        err?.response?.data?.error || err?.message || 'Something went wrong'
      );
    }
  };

  const isInProgress =
    status === 'uploading' || status === 'parsing' || status === 'analyzing';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Upload Your Resume
      </h1>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-medium text-foreground">
            Step 1: Select your resume
          </h2>
          <FileUpload
            file={file}
            onFileSelect={(f) => {
              setFile(f);
              setFileError('');
            }}
            onFileRemove={() => setFile(null)}
          />
          {fileError && (
            <p className="mt-2 text-sm text-red-600">{fileError}</p>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-lg font-medium text-foreground">
            Step 2: Target position details
          </h2>
          <TargetRoleForm
            onSubmit={handleSubmit}
            loading={isInProgress}
          />
        </div>

        {status && (
          <div className="space-y-3">
            <UploadProgress status={status} errorMessage={errorMessage} />
            {isInProgress && (
              <button
                onClick={handleCancel}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
