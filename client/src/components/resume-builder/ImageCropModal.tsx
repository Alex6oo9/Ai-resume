import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropUtils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  imageSrc: string;
  onSave: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function ImageCropModal({ imageSrc, onSave, onClose }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onSave(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Crop Photo</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative bg-black" style={{ height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={true}
            minZoom={1}
            maxZoom={3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Sliders */}
        <div className="px-4 py-3 space-y-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14 flex-shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14 flex-shrink-0">Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Crop & Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
