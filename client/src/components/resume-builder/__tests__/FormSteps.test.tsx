import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import PersonalInfoStep from '../steps/PersonalInfoStep';
import EducationStep from '../steps/EducationStep';
import ExperienceStep from '../steps/ExperienceStep';
import ProjectsStep from '../steps/ProjectsStep';
import SkillsStep from '../steps/SkillsStep';
import SummaryStep from '../steps/SummaryStep';
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
  linkedinUrl: '',
  portfolioUrl: '',
  additionalLinks: [],
  targetRole: '',
  targetIndustry: '',
  targetCountry: '',
  targetCity: '',
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
  skills: {
    technical: [],
    soft: [],
    languages: [{ language: '', proficiency: 'basic' }],
  },
  professionalSummary: '',
  certifications: '',
  extracurriculars: '',
};

// ─── PersonalInfoStep (merged Basic + Target Role) ──────────────────────────

describe('PersonalInfoStep', () => {
  it('renders all basic info fields', () => {
    render(<PersonalInfoStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/portfolio/i)).toBeInTheDocument();
    // Use exact match to avoid confusion with "Target City"
    expect(screen.getByLabelText(/^city \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^country \*$/i)).toBeInTheDocument();
  });

  it('renders target role fields', () => {
    render(<PersonalInfoStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target city/i)).toBeInTheDocument();
  });

  it('calls onChange when full name is typed', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={PersonalInfoStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');

    expect(spy).toHaveBeenCalled();
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.fullName).toBe('Jane');
  });

  it('calls onChange when target role is typed', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={PersonalInfoStep} initial={emptyFormData} onChangeSpy={spy} />);

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

// ─── SkillsStep (updated for nested structure) ──────────────────────────────

describe('SkillsStep', () => {
  it('renders skills section headers', () => {
    render(<SkillsStep data={emptyFormData} onChange={vi.fn()} />);

    // Use getAllByText since some text appears multiple times (in labels and descriptions)
    const technicalSkillsElements = screen.getAllByText(/technical skills/i);
    expect(technicalSkillsElements.length).toBeGreaterThan(0);

    const softSkillsElements = screen.getAllByText(/soft skills/i);
    expect(softSkillsElements.length).toBeGreaterThan(0);

    const languagesElements = screen.getAllByText(/languages/i);
    expect(languagesElements.length).toBeGreaterThan(0);
  });

  it('shows AI-generated skills banner when targetRole and targetIndustry are provided', () => {
    render(
      <SkillsStep
        data={emptyFormData}
        onChange={vi.fn()}
        isGenerating={false}
        generationError={null}
        targetRole="Software Engineer"
        targetIndustry="Technology"
      />
    );

    expect(screen.getByText(/AI-generated skills for/i)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology/i)).toBeInTheDocument();
  });
});

// ─── SummaryStep (new step for professional summary) ────────────────────────

describe('SummaryStep', () => {
  it('renders professional summary field', () => {
    render(<SummaryStep data={emptyFormData} onChange={vi.fn()} />);

    // The label is "Summary" not "Professional Summary"
    expect(screen.getByLabelText(/^summary/i)).toBeInTheDocument();
  });

  it('renders AI generate button', () => {
    render(<SummaryStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument();
  });

  it('calls onChange when summary is typed', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={SummaryStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(
      screen.getByLabelText(/^summary/i),
      'Motivated'
    );

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.professionalSummary).toBe('Motivated');
  });

  it('shows character count', () => {
    render(<SummaryStep data={emptyFormData} onChange={vi.fn()} />);

    // Character count is split across two spans: "0" and " / 500 characters"
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/\/ 500 characters/i)).toBeInTheDocument();
  });
});

// ─── AdditionalStep (Professional Summary removed) ──────────────────────────

describe('AdditionalStep', () => {
  it('renders certifications and extracurriculars fields', () => {
    render(<AdditionalStep data={emptyFormData} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/certifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/extracurricular/i)).toBeInTheDocument();
  });

  it('calls onChange for certifications', async () => {
    const spy = vi.fn();
    render(<Wrapper Component={AdditionalStep} initial={emptyFormData} onChangeSpy={spy} />);

    await userEvent.type(
      screen.getByLabelText(/certifications/i),
      'AWS'
    );

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall.certifications).toBe('AWS');
  });
});
