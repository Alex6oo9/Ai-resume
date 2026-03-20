import { useRef, useState } from 'react';
import ImageCropModal from '../ImageCropModal';
import { Camera, Plus, Link as LinkIcon, Trash2, User, Target, Link2 } from 'lucide-react';
import type { ResumeFormData, AdditionalLink } from '../../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
  photoSupported?: boolean;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Design',
  'Healthcare',
  'Education',
  'Engineering',
  'Consulting',
  'Retail',
  'Hospitality',
  'Other',
];

export default function PersonalInfoStep({ data, onChange, photoSupported = true }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  const update = (field: keyof ResumeFormData, value: string | undefined) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!photoSupported) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPendingImageSrc(objectUrl);
    e.target.value = '';
  };

  const handlePhotoClick = () => {
    if (!photoSupported) return;
    photoInputRef.current?.click();
  };

  const handleCropSave = (croppedDataUrl: string) => {
    update('profilePhoto', croppedDataUrl);
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleCropCancel = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const addAdditionalLink = () => {
    const currentLinks = data.additionalLinks || [];
    if (currentLinks.length >= 3) return;
    const newLink: AdditionalLink = { id: Date.now().toString(), label: '', url: '' };
    onChange({ ...data, additionalLinks: [...currentLinks, newLink] });
  };

  const removeAdditionalLink = (id: string) => {
    const currentLinks = data.additionalLinks || [];
    onChange({ ...data, additionalLinks: currentLinks.filter((l) => l.id !== id) });
  };

  const updateAdditionalLink = (id: string, field: 'label' | 'url', value: string) => {
    const currentLinks = data.additionalLinks || [];
    onChange({
      ...data,
      additionalLinks: currentLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  return (
    <>
    <div className="space-y-4">
      {/* Profile Photo */}
      <div className={`rounded-xl border border-border overflow-hidden ${!photoSupported ? 'opacity-60' : ''}`}>
        <div className={`flex items-center gap-2.5 px-4 py-3 bg-muted/30 border-b border-border/50 ${!photoSupported ? 'opacity-75' : ''}`}>
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Camera className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Profile Photo</h3>
          <span className="ml-auto text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="p-4 flex items-center gap-6">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            disabled={!photoSupported}
          />
          <div
            className={`relative h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-background flex-shrink-0 group ${
              photoSupported ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
            onClick={handlePhotoClick}
          >
            {data.profilePhoto ? (
              <img src={data.profilePhoto} alt="Profile" className={`w-full h-full object-cover ${!photoSupported ? 'opacity-60' : ''}`} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera size={20} className={`${!photoSupported ? 'text-gray-300' : 'text-muted-foreground'}`} />
              </div>
            )}
            {photoSupported && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`bg-background ${!photoSupported ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 hover:bg-gray-100' : ''}`}
              disabled={!photoSupported}
              onClick={handlePhotoClick}
            >
              {data.profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 2MB</p>
            {data.profilePhoto && (
              <button
                type="button"
                disabled={!photoSupported}
                onClick={() => photoSupported && update('profilePhoto', undefined)}
                className={`text-sm transition-colors text-left px-1 rounded ${
                  !photoSupported
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-destructive hover:bg-destructive/10'
                }`}
              >
                Remove
              </button>
            )}
            {!photoSupported && (
              <p className="text-xs text-amber-400 font-bold mt-1 [text-shadow:0_0_8px_rgba(251,191,36,0.9),0_0_16px_rgba(251,191,36,0.5)]">
                Profile photos are not supported by ATS templates
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/30 border-b border-border/50">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Contact Details</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="">
                Full Name <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="e.g. Jane Doe"
                value={data.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Email <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Phone <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                City <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Country <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="country"
                placeholder="United States"
                value={data.country}
                onChange={(e) => update('country', e.target.value)}
                className=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Target Position */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/30 border-b border-border/50">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Target className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Target Position</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="">
                Target Role <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="targetRole"
                placeholder="e.g. Frontend Developer"
                value={data.targetRole}
                onChange={(e) => update('targetRole', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Industry <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Select
                value={data.targetIndustry}
                onValueChange={(val) => update('targetIndustry', val)}
              >
                <SelectTrigger id="targetIndustry" className="bg-background">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Target Country <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="targetCountry"
                placeholder="e.g. United States"
                value={data.targetCountry}
                onChange={(e) => update('targetCountry', e.target.value)}
                className=""
              />
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Target City
                <span className="ml-1 normal-case tracking-normal font-normal text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                id="targetCity"
                placeholder="e.g. San Francisco"
                value={data.targetCity || ''}
                onChange={(e) => update('targetCity', e.target.value)}
                className=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/30 border-b border-border/50">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Professional Links</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="">
                LinkedIn
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="linkedinUrl"
                  className="pl-9"
                  placeholder="linkedin.com/in/username"
                  value={data.linkedinUrl || ''}
                  onChange={(e) => update('linkedinUrl', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="">
                Portfolio / Website
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="portfolioUrl"
                  className="pl-9"
                  placeholder="yourwebsite.com"
                  value={data.portfolioUrl || ''}
                  onChange={(e) => update('portfolioUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Additional Links */}
          {data.additionalLinks && data.additionalLinks.length > 0 && (
            <div className="space-y-2">
              {data.additionalLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg border border-border/60"
                >
                  <span className="text-xs text-muted-foreground w-5 text-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <Input
                    value={link.label}
                    onChange={(e) => updateAdditionalLink(link.id, 'label', e.target.value)}
                    placeholder="Label"
                    maxLength={30}
                    className="w-28 bg-background text-xs"
                  />
                  <div className="relative flex-1 min-w-0">
                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={link.url}
                      onChange={(e) => updateAdditionalLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="pl-8 bg-background text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalLink(link.id)}
                    className="p-1 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(!data.additionalLinks || data.additionalLinks.length < 3) && (
            <button
              type="button"
              onClick={addAdditionalLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <Plus className="w-4 h-4" /> Add Custom Link
            </button>
          )}
        </div>
      </div>
    </div>

    {pendingImageSrc && (
      <ImageCropModal
        imageSrc={pendingImageSrc}
        onSave={handleCropSave}
        onClose={handleCropCancel}
      />
    )}
    </>
  );
}
