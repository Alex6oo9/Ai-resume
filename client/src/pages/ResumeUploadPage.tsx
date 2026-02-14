import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (data: TargetRoleData) => {
    if (!file) {
      setFileError('Please upload a PDF file first');
      return;
    }

    setFileError('');
    setStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', data.targetRole);
      formData.append('targetCountry', data.targetCountry);
      if (data.targetCity) {
        formData.append('targetCity', data.targetCity);
      }

      const result = await uploadResume(formData);
      setStatus('success');
      showToast('Resume uploaded and analyzed successfully');

      // Navigate to analysis page after short delay
      setTimeout(() => {
        navigate(`/resume/${result.resume.id}`);
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.response?.data?.error || err?.message || 'Something went wrong'
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Upload Your Resume
      </h1>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-medium text-gray-700">
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
          <h2 className="mb-2 text-lg font-medium text-gray-700">
            Step 2: Target position details
          </h2>
          <TargetRoleForm
            onSubmit={handleSubmit}
            loading={status !== null && status !== 'success' && status !== 'error'}
          />
        </div>

        {status && (
          <UploadProgress status={status} errorMessage={errorMessage} />
        )}
      </div>
    </div>
  );
}
