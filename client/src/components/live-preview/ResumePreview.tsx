import { memo } from 'react';
import type { ResumeFormData } from '../../types';
import ResumeTemplateSwitcher from '../templates/ResumeTemplateSwitcher';

interface Props {
  data: ResumeFormData;
  templateId: string;
  onChooseTemplate: () => void;
  currentTemplateName?: string;
  zoom?: number;
  zoomPercent?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToWidth?: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}

/**
 * ResumePreview Component
 *
 * Main wrapper for the live preview panel.
 * Simulates an A4 page (8.5" x 11" aspect ratio) with proper scaling.
 * Contains sticky header with template selector and scrollable content area.
 *
 * Template components now own their own padding — no wrapper padding here.
 *
 * Memoized to prevent unnecessary re-renders during typing.
 */
function ResumePreview({
  data,
  templateId,
  onChooseTemplate,
  currentTemplateName,
  zoom = 1,
  zoomPercent = 100,
  onZoomIn,
  onZoomOut,
  onFitToWidth,
  canZoomIn = true,
  canZoomOut = true,
  containerRef,
}: Props) {
  const pageWidthPx = 816; // 8.5in * 96dpi

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Sticky Header with Zoom Controls and Template Button */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>

          {/* Zoom Controls */}
          {onZoomIn && onZoomOut && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onZoomOut}
                disabled={!canZoomOut}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Zoom out"
              >
                -
              </button>
              <span className="w-11 text-center text-xs tabular-nums text-gray-600">
                {zoomPercent}%
              </span>
              <button
                type="button"
                onClick={onZoomIn}
                disabled={!canZoomIn}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Zoom in"
              >
                +
              </button>
              {onFitToWidth && (
                <button
                  type="button"
                  onClick={onFitToWidth}
                  className="ml-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Fit to width"
                >
                  Fit
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onChooseTemplate}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>🎨</span>
            <span>
              {currentTemplateName
                ? currentTemplateName.replace(/_/g, ' ')
                : 'Choose Template'}
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Preview Container */}
      <div className="flex-1 overflow-auto p-6" ref={containerRef}>
        {/* Sizer div — dimensions = original * zoom, creates correct scrollable area */}
        <div
          className="mx-auto"
          style={{
            width: pageWidthPx * zoom,
          }}
        >
          {/* Absolute positioning container — full original size, scaled visually */}
          <div
            style={{
              width: pageWidthPx,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            {/* A4 Page Container — templates own their own padding */}
            <div
              className="bg-white shadow-lg"
              style={{
                width: '100%',
              }}
            >
              <ResumeTemplateSwitcher templateId={templateId} data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Controls Footer */}
      <div className="border-t border-gray-200 bg-white px-4 py-2">
        <p className="text-center text-xs text-gray-500">
          Preview updates automatically as you fill the form
        </p>
      </div>
    </div>
  );
}

export default memo(ResumePreview);
