import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StepIndicator from '../StepIndicator';

const steps = [
  'Basic Info',
  'Target Role',
  'Education',
  'Experience',
  'Skills',
  'Additional',
];

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);

    for (const step of steps) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it('marks completed steps', () => {
    render(<StepIndicator steps={steps} currentStep={3} />);

    // Steps 0, 1, 2 should be completed
    const indicators = screen.getAllByTestId(/^step-/);
    expect(indicators[0]).toHaveAttribute('data-status', 'completed');
    expect(indicators[1]).toHaveAttribute('data-status', 'completed');
    expect(indicators[2]).toHaveAttribute('data-status', 'completed');
  });

  it('marks the current step', () => {
    render(<StepIndicator steps={steps} currentStep={3} />);

    const indicators = screen.getAllByTestId(/^step-/);
    expect(indicators[3]).toHaveAttribute('data-status', 'current');
  });

  it('marks upcoming steps', () => {
    render(<StepIndicator steps={steps} currentStep={3} />);

    const indicators = screen.getAllByTestId(/^step-/);
    expect(indicators[4]).toHaveAttribute('data-status', 'upcoming');
    expect(indicators[5]).toHaveAttribute('data-status', 'upcoming');
  });

  it('shows step numbers', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
