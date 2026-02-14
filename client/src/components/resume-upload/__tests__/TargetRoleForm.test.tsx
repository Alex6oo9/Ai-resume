import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TargetRoleForm from '../TargetRoleForm';

describe('TargetRoleForm', () => {
  it('renders all input fields', () => {
    render(<TargetRoleForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('validates required fields — shows errors on empty submit', async () => {
    const onSubmit = vi.fn();
    render(<TargetRoleForm onSubmit={onSubmit} loading={false} />);

    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(screen.getByText(/role is required/i)).toBeInTheDocument();
    expect(screen.getByText(/country is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn();
    render(<TargetRoleForm onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByLabelText(/target role/i), 'Frontend Developer');
    await userEvent.type(screen.getByLabelText(/country/i), 'United States');
    await userEvent.type(screen.getByLabelText(/city/i), 'New York');

    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      targetRole: 'Frontend Developer',
      targetCountry: 'United States',
      targetCity: 'New York',
    });
  });

  it('submits without city (city is optional)', async () => {
    const onSubmit = vi.fn();
    render(<TargetRoleForm onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByLabelText(/target role/i), 'Backend Developer');
    await userEvent.type(screen.getByLabelText(/country/i), 'Germany');

    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      targetRole: 'Backend Developer',
      targetCountry: 'Germany',
      targetCity: '',
    });
  });

  it('shows loading state on submit button', () => {
    render(<TargetRoleForm onSubmit={vi.fn()} loading={true} />);

    const button = screen.getByRole('button', { name: /analyzing/i });
    expect(button).toBeDisabled();
  });
});
