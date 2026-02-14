import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function uploadResume(formData: FormData) {
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function buildResume(formData: Record<string, unknown>) {
  const response = await api.post('/resume/build', formData);
  return response.data;
}

export async function getResume(id: string) {
  const response = await api.get(`/resume/${id}`);
  return response.data;
}

export async function listResumes() {
  const response = await api.get('/resume');
  return response.data;
}

export async function deleteResume(id: string) {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
}

export async function getMatchAnalysis(resumeId: string) {
  const response = await api.post('/analysis/match', { resumeId });
  return response.data;
}

export async function getAtsScore(resumeId: string) {
  const response = await api.post('/analysis/ats-score', { resumeId });
  return response.data;
}

export async function getImprovements(resumeId: string) {
  const response = await api.post('/analysis/improve', { resumeId });
  return response.data;
}

export async function exportPdf(resumeId: string): Promise<void> {
  const response = await api.get(`/export/pdf/${resumeId}`, {
    responseType: 'blob',
    timeout: 30000,
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportMarkdown(resumeId: string): Promise<void> {
  const response = await api.get(`/export/markdown/${resumeId}`, {
    responseType: 'blob',
    timeout: 30000,
  });

  const blob = new Blob([response.data], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default api;
