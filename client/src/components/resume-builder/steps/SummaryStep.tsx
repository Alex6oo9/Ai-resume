import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ResumeFormData } from '../../../types';
import { apiClient } from '../../../utils/api';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

export default function SummaryStep({ data, onChange }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = data.professionalSummary || '';
  const charCount = summary.length;
  const minChars = 100;
  const maxChars = 500;

  const isTooShort = charCount > 0 && charCount < minChars;
  const isGood = charCount >= minChars && charCount <= maxChars;
  const isMax = charCount >= maxChars;

  const handleGenerateSummary = async () => {
    if (summary.trim()) {
      const confirmed = window.confirm(
        'This will replace your existing summary. Are you sure you want to continue?'
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        targetRole: data.targetRole,
        targetIndustry: data.targetIndustry,
        targetCountry: data.targetCountry,
        education: data.education.map((edu) => ({
          degree: edu.degreeType,
          field: edu.major,
          institution: edu.university,
        })),
        experience: data.experience.map((exp) => ({
          position: exp.role,
          company: exp.company,
          type: exp.type,
        })),
        projects: data.projects.map((proj) => ({ name: proj.name })),
        skills: { technical: data.skills.technical },
      };

      const response = await apiClient.post<{ summary: string }>('/ai/generate-summary', payload);
      onChange({ ...data, professionalSummary: response.data.summary });
    } catch (err: unknown) {
      console.error('Failed to generate summary:', err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (value: string) => {
    if (value.length <= maxChars) {
      onChange({ ...data, professionalSummary: value });
      setError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-muted-foreground max-w-[70%]">
          Write a brief professional summary that highlights your key achievements and career goals.
        </p>
        <Button
          type="button"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-2 shrink-0"
          onClick={handleGenerateSummary}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-white" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate with AI
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="professionalSummary" className="text-sm font-medium mb-1.5 block">
          Professional Summary
        </Label>
        <Textarea
          id="professionalSummary"
          placeholder="e.g. Results-driven Software Engineer with 5+ years of experience building scalable web applications..."
          className="min-h-[200px] resize-y p-4 leading-relaxed"
          value={summary}
          onChange={(e) => handleChange(e.target.value)}
        />

        <div className="flex justify-between items-center pt-2 px-1">
          <div className="text-xs">
            {isTooShort && (
              <span className="text-destructive font-medium">Minimum 100 characters recommended</span>
            )}
            {isMax && <span className="text-muted-foreground">Maximum length reached</span>}
          </div>
          <div
            className={`text-xs ${
              isTooShort
                ? 'text-destructive font-medium'
                : isGood
                  ? 'text-green-600 font-medium'
                  : 'text-muted-foreground'
            }`}
          >
            {charCount} / 500 characters
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 mt-8 border border-border">
        <h4 className="font-semibold mb-2 text-sm">Tips for a great summary:</h4>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm">
          <li>Keep it concise (3–5 sentences)</li>
          <li>Mention your current role and years of experience</li>
          <li>Highlight 1–2 major achievements or key skills</li>
          <li>State your career objective or what you're looking for</li>
        </ul>
      </div>
    </div>
  );
}
