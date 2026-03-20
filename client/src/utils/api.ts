import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import React from 'react';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { Template, SubscriptionTier } from '../types/template.types';
import type { ResumeFormData, GenerateCoverLetterPayload } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Connectivity event helpers
function dispatchServerDown(code?: string) {
  window.dispatchEvent(new CustomEvent('server:down', { detail: { code } }));
}
function dispatchServerUp() {
  window.dispatchEvent(new CustomEvent('server:up'));
}
function dispatchServerError(status: number) {
  window.dispatchEvent(new CustomEvent('server:error', { detail: { status } }));
}

api.interceptors.response.use(
  (response) => {
    dispatchServerUp();
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error or timeout — server unreachable
      dispatchServerDown(error.code);
    } else if (error.response.status >= 500) {
      dispatchServerError(error.response.status);
    }
    // 401/403 pass through silently — handled by individual callers
    return Promise.reject(error);
  }
);

export async function uploadResume(formData: FormData, options?: { signal?: AbortSignal }) {
  const response = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: options?.signal,
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

export async function saveDraft(formData: Record<string, unknown>, resumeId?: string) {
  const response = await api.post('/resume/draft/save', { formData, resumeId });
  return response.data;
}

export async function loadDraft(id: string) {
  const response = await api.get(`/resume/draft/${id}`);
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

export async function getImprovements(resumeId: string, forceRefresh = false) {
  const response = await api.post('/analysis/improve', { resumeId, forceRefresh });
  return response.data;
}

export async function getAnalysisHistory(resumeId: string) {
  const response = await api.get(`/analysis/history/${resumeId}`);
  return response.data;
}

export async function reanalyzeResume(
  resumeId: string,
  params: {
    targetRole: string;
    targetCountry?: string;
    targetCity?: string;
    jobDescription?: string;
  }
) {
  const response = await api.post('/analysis/reanalyze', { resumeId, ...params });
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

export async function exportPdfWithTemplate(
  templateId: string,
  formData: ResumeFormData
): Promise<void> {
  // Render the selected React template into a hidden detached div
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:8.5in;';
  document.body.appendChild(container);
  const root = createRoot(container);

  flushSync(() => {
    root.render(
      React.createElement(ResumeTemplateSwitcher, { templateId, data: formData })
    );
  });

  const templateHtml = container.innerHTML;
  root.unmount();
  document.body.removeChild(container);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>* { box-sizing: border-box; } body { margin: 0; padding: 0; }</style>
</head>
<body>${templateHtml}</body>
</html>`;

  const response = await api.post('/export/pdf-from-html', { html: fullHtml }, {
    responseType: 'blob',
    timeout: 60000,
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

// Template API functions
export async function getTemplates(): Promise<{
  templates: Template[];
  userTier: SubscriptionTier;
}> {
  const response = await api.get('/templates');
  return response.data;
}

export async function getTemplateById(
  id: string
): Promise<{ template: Template }> {
  const response = await api.get(`/templates/${id}`);
  return response.data;
}

export async function switchResumeTemplate(
  resumeId: string,
  templateId: string
): Promise<{ message: string; template: Template }> {
  const response = await api.post(`/resume/${resumeId}/switch-template`, {
    templateId,
  });
  return response.data;
}

// Auth: email verification & password reset
export async function verifyEmail(token: string): Promise<{ message: string; autoLogin?: boolean; user?: { id: string; email: string; name: string } }> {
  const response = await api.get('/auth/verify-email', { params: { token } });
  return response.data;
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
}

// Cover Letter API functions
export async function getCoverLetter(id: string) {
  const response = await api.get(`/cover-letter/${id}`);
  return response.data;
}

export async function generateCoverLetter(payload: GenerateCoverLetterPayload) {
  const response = await api.post('/cover-letter/generate', payload);
  return response.data;
}

export async function saveCoverLetter(id: string, content: string) {
  const response = await api.put(`/cover-letter/${id}`, { content });
  return response.data;
}

export async function extractKeywords(payload: Record<string, unknown>, jobDescription?: string) {
  const response = await api.post('/cover-letter/extract-keywords', { ...payload, jobDescription });
  return response.data;
}

export async function listCoverLetters() {
  const response = await api.get('/cover-letter/');
  return response.data;
}

export async function listCoverLettersByResume(resumeId: string) {
  const response = await api.get(`/cover-letter/resume/${resumeId}`);
  return response.data;
}

export async function regenerateCoverLetter(id: string, payload: GenerateCoverLetterPayload) {
  const response = await api.post(`/cover-letter/${id}/regenerate`, payload);
  return response.data;
}

export async function deleteCoverLetter(id: string) {
  const response = await api.delete(`/cover-letter/${id}`);
  return response.data;
}

export async function parseResumeText(file: File): Promise<{ parsedText: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/resume/parse-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function improveCoverLetter(id: string, payload: Record<string, unknown>) {
  const response = await api.post(`/cover-letter/${id}/improve`, payload);
  return response.data;
}

// Named export for convenience
export const apiClient = api;

export default api;
