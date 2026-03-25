import { useRef } from 'react';
import { Trash2, Plus, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeFormData, Education } from '../../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '../RichTextEditor';

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

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyEducation: Education = {
  degreeType: '',
  major: '',
  university: '',
  graduationDate: '',
  relevantCoursework: '',
};

export default function EducationStep({ data, onChange }: Props) {
  const gradDateRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateEntry = (index: number, field: keyof Education, value: string) => {
    const updated = data.education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    onChange({ ...data, education: updated });
  };

  const addEntry = () => {
    onChange({ ...data, education: [...data.education, { ...emptyEducation }] });
  };

  const removeEntry = (index: number) => {
    onChange({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {data.education.map((edu, index) => (
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
                Education
              </h3>
              {data.education.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => removeEntry(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>
                  School / University <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Stanford University"
                  value={edu.university}
                  onChange={(e) => updateEntry(index, 'university', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Degree <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Bachelor of Science"
                  value={edu.degreeType}
                  onChange={(e) => updateEntry(index, 'degreeType', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Field of Study <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Business Administration"
                  value={edu.major}
                  onChange={(e) => updateEntry(index, 'major', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex justify-between">
                  <span>Graduation Date</span>
                  <span className="text-xs text-muted-foreground font-normal">Optional</span>
                </Label>
                <div className="relative">
                  <input
                    type="month"
                    ref={(el) => { gradDateRefs.current[index] = el; }}
                    value={toInputMonth(edu.graduationDate)}
                    onChange={(e) => updateEntry(index, 'graduationDate', fromInputMonth(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => gradDateRefs.current[index]?.showPicker()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>GPA (optional)</Label>
                <Input
                  placeholder="e.g. 3.8"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEntry(index, 'gpa', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Honors (optional)</Label>
                <Input
                  placeholder="e.g. Cum Laude, Dean's List"
                  value={edu.honors || ''}
                  onChange={(e) => updateEntry(index, 'honors', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="flex justify-between">
                <span>Relevant Coursework</span>
                <span className="text-xs text-muted-foreground font-normal">Optional</span>
              </Label>
              <RichTextEditor
                value={edu.relevantCoursework}
                onChange={(val) => updateEntry(index, 'relevantCoursework', val)}
                placeholder="e.g. Business Strategy, Financial Accounting, Marketing..."
                minHeight="80px"
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
        <Plus className="w-4 h-4 mr-2" /> Add Another Education
      </Button>
    </div>
  );
}
