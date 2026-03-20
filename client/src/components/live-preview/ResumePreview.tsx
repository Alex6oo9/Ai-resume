import { memo } from 'react';
import type { ResumeFormData } from '../../types';
import ResumeTemplateSwitcher from '../templates/ResumeTemplateSwitcher';

interface Props {
  data: ResumeFormData;
  templateId: string;
  onChooseTemplate?: () => void;
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
 * Pure canvas — no header or footer.
 * The floating toolbar in the parent handles zoom controls and template selection.
 *
 * Template components own their own padding — no wrapper padding here.
 * Memoized to prevent unnecessary re-renders during typing.
 */
function ResumePreview({
  data,
  templateId,
  zoom = 1,
  containerRef,
}: Props) {
  const pageWidthPx = 816; // 8.5in * 96dpi

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Preview Container */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar" ref={containerRef}>
        {/* Sizer div — dimensions = original * zoom, creates correct scrollable area */}
        <div
          className="mx-auto"
          style={{ width: pageWidthPx * zoom }}
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
            <div className="bg-white shadow-lg" style={{ width: '100%' }}>
              <ResumeTemplateSwitcher templateId={templateId} data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ResumePreview);
