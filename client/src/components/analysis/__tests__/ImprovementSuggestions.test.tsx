import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImprovementSuggestions from '../ImprovementSuggestions';

describe('ImprovementSuggestions', () => {
  const suggestions = ['Improve formatting', 'Add more skills'];

  const detailed = {
    actionVerbs: [
      { current: 'worked on', suggested: 'Engineered' },
    ],
    quantifiedAchievements: [
      { suggestion: 'Add metrics to experience' },
    ],
    missingSections: ['Certifications'],
    keywordOptimization: [
      { keyword: 'TypeScript', reason: 'In high demand' },
    ],
    formattingIssues: ['Add clear section headers'],
  };

  it('renders general suggestions list', () => {
    render(
      <ImprovementSuggestions
        suggestions={suggestions}
        detailed={null}
        loading={false}
        onAnalyze={() => {}}
      />
    );
    expect(screen.getByText('Improve formatting')).toBeInTheDocument();
    expect(screen.getByText('Add more skills')).toBeInTheDocument();
  });

  it('renders categorized improvements when detailed is present', () => {
    render(
      <ImprovementSuggestions
        suggestions={suggestions}
        detailed={detailed}
        loading={false}
        onAnalyze={() => {}}
      />
    );
    expect(screen.getByText(/Engineered/)).toBeInTheDocument();
    expect(screen.getByText('Add metrics to experience')).toBeInTheDocument();
    expect(screen.getByText('Certifications')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Add clear section headers')).toBeInTheDocument();
  });

  it('hides empty categories', () => {
    const partialDetailed = {
      ...detailed,
      missingSections: [],
      formattingIssues: [],
    };
    render(
      <ImprovementSuggestions
        suggestions={suggestions}
        detailed={partialDetailed}
        loading={false}
        onAnalyze={() => {}}
      />
    );
    expect(screen.queryByText('Missing Sections')).not.toBeInTheDocument();
    expect(screen.queryByText('Formatting Issues')).not.toBeInTheDocument();
  });

  it('shows Get Detailed Suggestions button when detailed=null', () => {
    const onAnalyze = vi.fn();
    render(
      <ImprovementSuggestions
        suggestions={suggestions}
        detailed={null}
        loading={false}
        onAnalyze={onAnalyze}
      />
    );
    const button = screen.getByRole('button', {
      name: /get detailed suggestions/i,
    });
    fireEvent.click(button);
    expect(onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <ImprovementSuggestions
        suggestions={suggestions}
        detailed={null}
        loading={true}
        onAnalyze={() => {}}
      />
    );
    expect(screen.getByTestId('improvements-loading')).toBeInTheDocument();
  });
});
