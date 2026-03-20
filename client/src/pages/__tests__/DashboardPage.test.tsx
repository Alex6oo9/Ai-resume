import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import * as api from '../../utils/api';

vi.mock('../../utils/api');

const mockUser = { id: 'user-1', email: 'test@example.com', created_at: '2024-01-01' };
const mockShowToast = vi.fn();
const mockAuthValue = {
  user: mockUser,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
} as any;

function renderDashboard() {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <ToastContext.Provider value={{ showToast: mockShowToast }}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.listCoverLetters as ReturnType<typeof vi.fn>).mockResolvedValue({ coverLetters: [] });
  });

  it('renders Create New Resume and Analyze PDF action cards', () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [],
    });
    renderDashboard();

    expect(screen.getByText('Create New Resume')).toBeInTheDocument();
    expect(screen.getByText('Analyze PDF')).toBeInTheDocument();
  });

  it('calls listResumes on mount', async () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [],
    });
    renderDashboard();

    await waitFor(() => {
      expect(api.listResumes).toHaveBeenCalledTimes(1);
    });
  });

  it('renders resume cards with details', async () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [
        {
          id: 'r1',
          target_role: 'Frontend Developer',
          match_percentage: 75,
          ats_score: 83,
          created_at: '2024-06-15T10:00:00Z',
        },
        {
          id: 'r2',
          target_role: 'Backend Developer',
          match_percentage: 60,
          ats_score: null,
          created_at: '2024-06-14T10:00:00Z',
        },
      ],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows "No resumes yet" when empty', async () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no documents yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('renders delete buttons for each resume', async () => {
    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [
        {
          id: 'r1',
          target_role: 'Frontend Developer',
          match_percentage: 75,
          ats_score: null,
          created_at: '2024-06-15T10:00:00Z',
        },
      ],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    // Open the card menu to reveal Delete button
    const menuBtn = screen.getByLabelText(/menu for frontend developer/i);
    await userEvent.click(menuBtn);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('deletes resume after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [
        {
          id: 'r1',
          target_role: 'Frontend Developer',
          match_percentage: 75,
          ats_score: null,
          created_at: '2024-06-15T10:00:00Z',
        },
      ],
    });
    (api.deleteResume as ReturnType<typeof vi.fn>).mockResolvedValue({
      message: 'Resume deleted',
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    // Open menu then click Delete
    await user.click(screen.getByLabelText(/menu for frontend developer/i));
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(api.deleteResume).toHaveBeenCalledWith('r1');
    });

    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Resume deleted');
  });

  it('does not delete when user cancels confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    (api.listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [
        {
          id: 'r1',
          target_role: 'Frontend Developer',
          match_percentage: 75,
          ats_score: null,
          created_at: '2024-06-15T10:00:00Z',
        },
      ],
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    // Open menu then click Delete
    await user.click(screen.getByLabelText(/menu for frontend developer/i));
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(api.deleteResume).not.toHaveBeenCalled();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });
});
