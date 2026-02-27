import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import React from 'react';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { Template, SubscriptionTier } from '../types/template.types';
import type { ResumeFormData } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Named export for convenience
export const apiClient = api;

export default api;
