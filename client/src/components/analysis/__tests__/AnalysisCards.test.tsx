import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MatchScoreCard from '../MatchScoreCard';
import AtsScoreCard from '../AtsScoreCard';

describe('MatchScoreCard', () => {
  const defaultProps = {
    matchPercentage: 75,
    strengths: ['Strong React skills', 'Good communication'],
    weaknesses: ['No TypeScript', 'Limited experience'],
    loading: false,
  };

  it('renders match percentage prominently', () => {
    render(<MatchScoreCard {...defaultProps} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders strengths list', () => {
    render(<MatchScoreCard {...defaultProps} />);
    expect(screen.getByText('Strong React skills')).toBeInTheDocument();
    expect(screen.getByText('Good communication')).toBeInTheDocument();
  });

  it('renders weaknesses list', () => {
    render(<MatchScoreCard {...defaultProps} />);
    expect(screen.getByText('No TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Limited experience')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    render(<MatchScoreCard {...defaultProps} loading={true} />);
    expect(screen.getByTestId('match-loading')).toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });
});

describe('AtsScoreCard', () => {
  const breakdown = {
    formatCompliance: 35,
    keywordMatch: 30,
    sectionCompleteness: 18,
    totalScore: 83,
    keywords: {
      matched: ['React', 'JavaScript'],
      missing: ['TypeScript', 'CSS'],
    },
  };

  it('renders total score and sub-scores', () => {
    render(
      <AtsScoreCard
        atsBreakdown={breakdown}
        loading={false}
        onCalculate={() => {}}
      />
    );
    expect(screen.getByText('83')).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it('renders matched and missing keywords', () => {
    render(
      <AtsScoreCard
        atsBreakdown={breakdown}
        loading={false}
        onCalculate={() => {}}
      />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
  });

  it('shows Calculate button when no data', () => {
    const onCalculate = vi.fn();
    render(
      <AtsScoreCard
        atsBreakdown={null}
        loading={false}
        onCalculate={onCalculate}
      />
    );
    const button = screen.getByRole('button', {
      name: /calculate ats score/i,
    });
    fireEvent.click(button);
    expect(onCalculate).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when computing', () => {
    render(
      <AtsScoreCard
        atsBreakdown={null}
        loading={true}
        onCalculate={() => {}}
      />
    );
    expect(screen.getByTestId('ats-loading')).toBeInTheDocument();
  });
});
