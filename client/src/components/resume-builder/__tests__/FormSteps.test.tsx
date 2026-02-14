import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import BasicInfoStep from '../steps/BasicInfoStep';
import TargetRoleStep from '../steps/TargetRoleStep';
import EducationStep from '../steps/EducationStep';
import ExperienceStep from '../steps/ExperienceStep';
import ProjectsStep from '../steps/ProjectsStep';
import SkillsStep from '../steps/SkillsStep';
import AdditionalStep from '../steps/AdditionalStep';
import type { ResumeFormData } from '../../../types';

// Stateful wrapper so controlled inputs work with userEvent.type
function Wrapper({
  Component,
  initial,
  onChangeSpy,
}: {
  Component: React.ComponentType<{ data: ResumeFormData; onChange: (d: ResumeFormData) => void }>;
  initial: ResumeFormData;
  onChangeSpy?: (d: ResumeFormData) => void;
}) {
  const [data, setData] = useState(initial);
  const handleChange = (d: ResumeFormData) => {
    setData(d);
    onChangeSpy?.(d);
  };
  return <Component data={data} onChange={handleChange} />;
}

const emptyFormData: ResumeFormData = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  targetRole: '',
  targetCountry: '',
  education: [
    {
      degreeType: '',
      major: '',
      university: '',
      graduationDate: '',
      relevantCoursework: '',
    },
  ],
  experience: [],
  projects: [],
  technicalSkills: '',
  softSkills: [],
  languages: [{ name: '', proficiency: 'basic' }],
  professionalSummary: '',
};

// ─── BasicInfoStep ───────────────────────────────────────────────────────────

describe('BasicInfoStep', () => {
  it('renders all basic info fields', () => {
    render(<BasicInfoStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/portfolio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^city$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^country$/i)).toBeInTheDocument();
  });

  it('calls onChange when fields are typed into', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={BasicInfoStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');

    expect(spy).toHaveBeenCalled();
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.fullName).toBe('Jane');
  });
});

// ─── TargetRoleStep ──────────────────────────────────────────────────────────

describe('TargetRoleStep', () => {
  it('renders target role fields', () => {
    render(<TargetRoleStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target city/i)).toBeInTheDocument();
  });

  it('calls onChange with updated target role', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={TargetRoleStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(screen.getByLabelText(/target role/i), 'Dev');

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.targetRole).toBe('Dev');
  });
});

// ─── EducationStep ───────────────────────────────────────────────────────────

describe('EducationStep', () => {
  it('renders education fields for the first entry', () => {
    render(<EducationStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/degree type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/major/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/university/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/graduation date/i)).toBeInTheDocument();
  });

  it('can add another education entry', async () => {
    const onChange = vi.fn();
    render(<EducationStep data={emptyFormData} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /add education/i }));

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.education).toHaveLength(2);
  });
});

// ─── ExperienceStep ──────────────────────────────────────────────────────────

describe('ExperienceStep', () => {
  it('renders with add experience button', () => {
    render(<ExperienceStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument();
    expect(screen.getByText(/no experience added/i)).toBeInTheDocument();
  });

  it('can add an experience entry', async () => {
    const onChange = vi.fn();
    render(<ExperienceStep data={emptyFormData} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /add experience/i }));

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.experience).toHaveLength(1);
  });
});

// ─── ProjectsStep ────────────────────────────────────────────────────────────

describe('ProjectsStep', () => {
  it('renders with add project button', () => {
    render(<ProjectsStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
  });

  it('can add a project entry', async () => {
    const onChange = vi.fn();
    render(<ProjectsStep data={emptyFormData} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /add project/i }));

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.projects).toHaveLength(1);
  });
});

// ─── SkillsStep ──────────────────────────────────────────────────────────────

describe('SkillsStep', () => {
  it('renders skills fields', () => {
    render(<SkillsStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/technical skills/i)).toBeInTheDocument();
    expect(screen.getByText(/soft skills/i)).toBeInTheDocument();
  });

  it('calls onChange for technical skills', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={SkillsStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(
      screen.getByLabelText(/technical skills/i),
      'React'
    );

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.technicalSkills).toBe('React');
  });
});

// ─── AdditionalStep ──────────────────────────────────────────────────────────

describe('AdditionalStep', () => {
  it('renders additional info fields', () => {
    render(<AdditionalStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/professional summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/certifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/extracurricular/i)).toBeInTheDocument();
  });

  it('calls onChange for professional summary', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={AdditionalStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(
      screen.getByLabelText(/professional summary/i),
      'Motivated'
    );

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.professionalSummary).toBe('Motivated');
  });
});
