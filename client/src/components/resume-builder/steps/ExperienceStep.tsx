import { useEffect, useRef } from 'react';
import { Trash2, Plus, BriefcaseBusiness, CalendarRange } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_MAP: Record<string, string> = {
  Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
  Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12',
};

function toInputMonth(display: string): string {
  const m = display.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return '';
  return `${m[2]}-${MONTH_MAP[m[1]] ?? ''}`;
}

function fromInputMonth(yyyyMM: string): string {
  if (!yyyyMM) return '';
  const [year, month] = yyyyMM.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function parseDuration(duration: string) {
  const parts = duration.split(/\s*[–-]\s*/);
  const isPresent = parts[1]?.trim().toLowerCase() === 'present';
  return {
    from: toInputMonth(parts[0]?.trim() ?? ''),
    to: isPresent ? '' : toInputMonth(parts[1]?.trim() ?? ''),
    isPresent,
  };
}
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeFormData, Experience } from '../../../types';
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
import { RichTextEditor } from '../RichTextEditor';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyExperience: Experience = {
  type: 'internship',
  company: '',
  role: '',
  duration: '',
  responsibilities: '',
  industry: '',
};

const EMPLOYMENT_TYPES: { value: Experience['type']; label: string }[] = [
  { value: 'internship', label: 'Internship' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'volunteer', label: 'Volunteer' },
];

export default function ExperienceStep({ data, onChange }: Props) {
  const fromRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-add one empty card when the step first mounts with no entries
  useEffect(() => {
    if (data.experience.length === 0) {
      onChange({ ...data, experience: [{ ...emptyExperience }] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEntry = (index: number, field: keyof Experience, value: string) => {
    const updated = data.experience.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const addEntry = () => {
    onChange({ ...data, experience: [...data.experience, { ...emptyExperience }] });
  };

  const removeEntry = (index: number) => {
    onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
        <BriefcaseBusiness className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">
          Focus on your achievements and the impact you made. Use strong action verbs and quantify
          your results when possible.
        </p>
      </div>

      {data.experience.length === 0 && (
        <p className="text-sm italic text-muted-foreground">No experience added yet.</p>
      )}

      <AnimatePresence>
        {data.experience.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
            className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4 relative group"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                Work Experience
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                onClick={() => removeEntry(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label>
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Project Manager"
                  value={exp.role}
                  onChange={(e) => updateEntry(index, 'role', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={exp.company}
                  onChange={(e) => updateEntry(index, 'company', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Employment Type</Label>
                <Select
                  value={exp.type}
                  onValueChange={(val) => updateEntry(index, 'type', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Duration</Label>
                <div className="flex items-center gap-2">
                  {/* From */}
                  <div className="relative flex-1">
                    <input
                      type="month"
                      ref={(el) => { fromRefs.current[index] = el; }}
                      value={parseDuration(exp.duration).from}
                      onChange={(e) => {
                        const { to, isPresent } = parseDuration(exp.duration);
                        const toStr = isPresent ? 'Present' : (to ? fromInputMonth(to) : '');
                        const fromStr = fromInputMonth(e.target.value);
                        updateEntry(index, 'duration', toStr ? `${fromStr} – ${toStr}` : fromStr);
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark]"
                      placeholder="Start"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => fromRefs.current[index]?.showPicker()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <CalendarRange className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-muted-foreground text-sm shrink-0">–</span>

                  {/* To or Present */}
                  {parseDuration(exp.duration).isPresent ? (
                    <div className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                      Present
                    </div>
                  ) : (
                    <div className="relative flex-1">
                      <input
                        type="month"
                        ref={(el) => { toRefs.current[index] = el; }}
                        value={parseDuration(exp.duration).to}
                        onChange={(e) => {
                          const { from } = parseDuration(exp.duration);
                          const fromStr = from ? fromInputMonth(from) : '';
                          const toStr = fromInputMonth(e.target.value);
                          updateEntry(index, 'duration', fromStr ? `${fromStr} – ${toStr}` : toStr);
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark]"
                        placeholder="End"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => toRefs.current[index]?.showPicker()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <CalendarRange className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Present toggle */}
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parseDuration(exp.duration).isPresent}
                    onChange={(e) => {
                      const { from } = parseDuration(exp.duration);
                      const fromStr = from ? fromInputMonth(from) : '';
                      updateEntry(index, 'duration', e.target.checked
                        ? (fromStr ? `${fromStr} – Present` : 'Present')
                        : fromStr
                      );
                    }}
                    className="rounded border-input"
                  />
                  Currently working here
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Industry (optional)</Label>
                <Input
                  placeholder="e.g. Technology, Finance"
                  value={exp.industry || ''}
                  onChange={(e) => updateEntry(index, 'industry', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label>Key Responsibilities &amp; Achievements</Label>
              <RichTextEditor
                value={exp.responsibilities}
                onChange={(val) => updateEntry(index, 'responsibilities', val)}
                placeholder="• Spearheaded the development of..."
                minHeight="120px"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary py-6 text-muted-foreground transition-all"
        onClick={addEntry}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Another Experience
      </Button>
    </div>
  );
}
