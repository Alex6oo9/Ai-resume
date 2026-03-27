import { useState, useEffect } from 'react';
import { Sparkles, Globe, Plus, X, ChevronDown, CheckCircle2, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeFormData, LanguageSkill } from '../../../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_CATEGORIES = 5;

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
  suggestions?: string[];
  isGenerating?: boolean;
  generationError?: string | null;
  targetRole?: string;
  targetIndustry?: string;
  onRegenerate?: () => void;
}

export default function SkillsStep({
  data,
  onChange,
  suggestions: _skillSuggestions = [],
  isGenerating: isGeneratingSkills = false,
  onRegenerate: onRegenerateSkills,
}: Props) {
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [softOpen, setSoftOpen] = useState(true);
  const [langInput, setLangInput] = useState('');
  const [langProficiency, setLangProficiency] = useState<LanguageSkill['proficiency']>('fluent');

  const categories = data.skills.technical;

  const [openCategories, setOpenCategories] = useState<Set<number>>(
    () => new Set(categories.map((_, i) => i))
  );

  const toggleCategory = (index: number) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  useEffect(() => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      categories.forEach((_, i) => next.add(i));
      return next;
    });
  }, [categories.length]);

  const PROFICIENCIES: { value: LanguageSkill['proficiency']; label: string }[] = [
    { value: 'native', label: 'Native' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'professional', label: 'Professional' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'basic', label: 'Basic' },
  ];

  const PROFICIENCY_DOT: Record<LanguageSkill['proficiency'], string> = {
    native:       'bg-emerald-500',
    fluent:       'bg-blue-500',
    professional: 'bg-cyan-500',
    intermediate: 'bg-amber-500',
    basic:        'bg-zinc-400',
  };

  const addSkillToCategory = (catIndex: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const cat = categories[catIndex];
    if (!cat) return;
    if (cat.items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, items: [...c.items, trimmed] } : c
    );
    onChange({ ...data, skills: { ...data.skills, technical: newCats } });
  };

  const removeSkillFromCategory = (catIndex: number, itemIndex: number) => {
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c
    );
    onChange({ ...data, skills: { ...data.skills, technical: newCats } });
  };

  const updateCategoryName = (catIndex: number, name: string) => {
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, category: name } : c
    );
    onChange({ ...data, skills: { ...data.skills, technical: newCats } });
  };

  const addCategory = () => {
    if (categories.length >= MAX_CATEGORIES) return;
    const newIndex = categories.length;
    onChange({
      ...data,
      skills: { ...data.skills, technical: [...categories, { category: '', items: [] }] },
    });
    setOpenCategories(prev => new Set([...prev, newIndex]));
  };

  const removeCategory = (catIndex: number) => {
    if (categories.length <= 1) {
      // Reset the last category to empty instead of removing it
      onChange({ ...data, skills: { ...data.skills, technical: [{ category: '', items: [] }] } });
      return;
    }
    onChange({
      ...data,
      skills: { ...data.skills, technical: categories.filter((_, i) => i !== catIndex) },
    });
    setOpenCategories(prev => {
      const next = new Set<number>();
      prev.forEach(i => {
        if (i < catIndex) next.add(i);
        else if (i > catIndex) next.add(i - 1);
      });
      return next;
    });
  };

  const addSoftSkill = () => {
    const trimmed = softSkillInput.trim();
    if (!trimmed) return;
    if (data.skills.soft.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange({ ...data, skills: { ...data.skills, soft: [...data.skills.soft, trimmed] } });
    setSoftSkillInput('');
  };

  const removeSoftSkill = (index: number) => {
    onChange({ ...data, skills: { ...data.skills, soft: data.skills.soft.filter((_, i) => i !== index) } });
  };

  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (!trimmed) return;
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: [...data.skills.languages, { language: trimmed, proficiency: langProficiency }],
      },
    });
    setLangInput('');
  };

  const updateLanguageProficiency = (index: number, value: string) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: data.skills.languages.map((l, i) =>
          i === index ? { ...l, proficiency: value as LanguageSkill['proficiency'] } : l
        ),
      },
    });
  };

  const removeLanguage = (index: number) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: data.skills.languages.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* AI Suggestion Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-indigo-950/50 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Skill Suggestions
          </h3>
          <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
            Let AI scan your experience and suggest the most relevant skills for your industry.
          </p>
          {!isGeneratingSkills && categories.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Skills auto-filled — edit freely or regenerate
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-200 gap-2 shrink-0"
          onClick={onRegenerateSkills}
          disabled={isGeneratingSkills}
        >
          {isGeneratingSkills ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-white" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> {categories.length > 0 ? 'Regenerate' : 'Suggest Skills'}
            </>
          )}
        </Button>
      </div>

      {/* Category Cards + Soft Skills Card */}
      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {categories.map((cat, catIndex) => {
            const isOpen = openCategories.has(catIndex);
            return (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl border border-border bg-card shadow-sm overflow-hidden group transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleCategory(catIndex)}
                  className="flex w-full items-center justify-between py-4 px-5 font-medium transition-all hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Category name..."
                      className="truncate text-base font-semibold rounded-md px-2 py-0.5 -mx-2 bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/30 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150 min-w-0 w-full cursor-text"
                    />
                    <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 min-w-[1.25rem]">
                      {cat.items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); removeCategory(catIndex); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeCategory(catIndex); } }}
                      className="h-8 w-8 rounded-md inline-flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-2 grid grid-cols-1 gap-6">
                    <div>
                      <div className="flex flex-wrap gap-2 mt-1 min-h-[40px] items-start">
                        {cat.items.length === 0 && (
                          <span className="text-sm text-muted-foreground italic px-2 py-1">
                            No skills added yet — type below and press Enter or Add.
                          </span>
                        )}
                        <AnimatePresence>
                          {cat.items.map((skill, skillIndex) => (
                            <motion.span
                              key={`${skill}-${skillIndex}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              layout
                              className="group/skill flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkillFromCategory(catIndex, skillIndex)}
                                className="h-4 w-4 rounded-full inline-flex items-center justify-center opacity-50 group-hover/skill:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                                aria-label={`Remove ${skill}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Skill Input Row */}
                      <div className="relative mt-3">
                        <Input
                          className="bg-background pr-20"
                          placeholder="Add a skill (e.g. Excel, Project Management) and press Enter..."
                          value={skillInputs[catIndex] || ''}
                          onChange={(e) => setSkillInputs({ ...skillInputs, [catIndex]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillToCategory(catIndex, skillInputs[catIndex] || '');
                              setSkillInputs({ ...skillInputs, [catIndex]: '' });
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 gap-1.5"
                          onClick={() => {
                            addSkillToCategory(catIndex, skillInputs[catIndex] || '');
                            setSkillInputs({ ...skillInputs, [catIndex]: '' });
                          }}
                          disabled={!skillInputs[catIndex]?.trim()}
                        >
                          <Plus className="w-3 h-3" /> Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Soft Skills Card — same style as technical categories, fixed name, no delete */}
        <motion.div
          key="soft-skills"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => setSoftOpen(prev => !prev)}
            className="flex w-full items-center justify-between py-4 px-5 font-medium transition-all hover:bg-muted/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span className="text-base font-semibold px-2 py-0.5">Soft Skills</span>
              <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 min-w-[1.25rem]">
                {data.skills.soft.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${softOpen ? 'rotate-180' : ''}`} />
          </button>

          {softOpen && (
            <div className="px-5 pb-5 pt-2 grid grid-cols-1 gap-6">
              <div>
                <div className="flex flex-wrap gap-2 mt-1 min-h-[40px] items-start">
                  {data.skills.soft.length === 0 && (
                    <span className="text-sm text-muted-foreground italic px-2 py-1">
                      No skills added yet — type below and press Enter or Add.
                    </span>
                  )}
                  <AnimatePresence>
                    {data.skills.soft.map((skill, index) => (
                      <motion.span
                        key={`soft-${skill}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        className="group/skill flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSoftSkill(index)}
                          className="h-4 w-4 rounded-full inline-flex items-center justify-center opacity-50 group-hover/skill:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="relative mt-3">
                  <Input
                    className="bg-background pr-20"
                    placeholder="Add a skill (e.g. Communication, Teamwork) and press Enter..."
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSoftSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 gap-1.5"
                    onClick={addSoftSkill}
                    disabled={!softSkillInput.trim()}
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {categories.length < MAX_CATEGORIES && (
        <button
          type="button"
          onClick={addCategory}
          className="w-full border-dashed border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors py-6 text-muted-foreground flex items-center justify-center gap-2 rounded-lg"
        >
          <Plus className="w-5 h-5" /> Add New Skill Category
        </button>
      )}

      {/* Languages Section */}
      <div className="mt-10 pt-6 border-t border-border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Languages
          </h3>
          <p className="text-sm text-muted-foreground">
            Add languages you speak and your proficiency level.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-4">
          {data.skills.languages.length > 0 && (
            <div className="space-y-2">
              <AnimatePresence>
                {data.skills.languages.map((lang, index) => (
                  <motion.div
                    key={`${lang.language}-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Globe className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">{lang.language}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${PROFICIENCY_DOT[lang.proficiency]}`} />
                      <Select
                        value={lang.proficiency}
                        onValueChange={(val) => updateLanguageProficiency(index, val)}
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center mt-2 p-3 rounded-xl border border-dashed border-border bg-muted/20 hover:border-primary/40 transition-colors">
            <div className="relative flex-1 min-w-[140px]">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9 bg-background"
                placeholder="e.g. English, Mandarin..."
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
            </div>
            <Select
              value={langProficiency}
              onValueChange={(val) => setLangProficiency(val as LanguageSkill['proficiency'])}
            >
              <SelectTrigger className="w-[110px] sm:w-[130px] shrink-0 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="shrink-0 gap-2 px-4"
              onClick={addLanguage}
              disabled={!langInput.trim()}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
