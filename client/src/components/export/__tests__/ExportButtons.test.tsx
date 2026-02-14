import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportButtons from '../ExportButtons';

describe('ExportButtons', () => {
  const defaultProps = {
    onExportPdf: vi.fn(),
    onExportMarkdown: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onExportPdf = vi.fn().mockResolvedValue(undefined);
    defaultProps.onExportMarkdown = vi.fn().mockResolvedValue(undefined);
  });

  it('renders both export buttons', () => {
    render(<ExportButtons {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /download markdown/i })
    ).toBeInTheDocument();
  });

  it('calls onExportPdf when PDF button is clicked', async () => {
    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    await waitFor(() => {
      expect(defaultProps.onExportPdf).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onExportMarkdown when Markdown button is clicked', async () => {
    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', { name: /download markdown/i })
    );

    await waitFor(() => {
      expect(defaultProps.onExportMarkdown).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state for PDF button while exporting', async () => {
    let resolveExport: () => void;
    const slowExport = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });
    defaultProps.onExportPdf = vi.fn().mockReturnValue(slowExport);

    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    await waitFor(() => {
      expect(screen.getByText(/exporting pdf/i)).toBeInTheDocument();
    });

    resolveExport!();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  it('shows loading state for Markdown button while exporting', async () => {
    let resolveExport: () => void;
    const slowExport = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });
    defaultProps.onExportMarkdown = vi.fn().mockReturnValue(slowExport);

    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', { name: /download markdown/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/exporting markdown/i)).toBeInTheDocument();
    });

    resolveExport!();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /download markdown/i })
      ).toBeInTheDocument();
    });
  });

  it('shows error message on PDF export failure', async () => {
    defaultProps.onExportPdf = vi
      .fn()
      .mockRejectedValue(new Error('PDF failed'));

    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to export pdf/i)).toBeInTheDocument();
    });
  });

  it('shows error message on Markdown export failure', async () => {
    defaultProps.onExportMarkdown = vi
      .fn()
      .mockRejectedValue(new Error('MD failed'));

    render(<ExportButtons {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', { name: /download markdown/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/failed to export markdown/i)
      ).toBeInTheDocument();
    });
  });
});
