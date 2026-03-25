import { Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumeFormData, Project } from '../../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '../RichTextEditor';


interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyProject: Project = {
  name: '',
  description: '',
  technologies: '',
  role: '',
};

export default function AdditionalStep({ data, onChange }: Props) {
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = data.projects.map((proj, i) =>
      i === index ? { ...proj, [field]: value } : proj
    );
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    onChange({ ...data, projects: [...data.projects, { ...emptyProject }] });
  };

  const removeProject = (index: number) => {
    onChange({ ...data, projects: data.projects.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-10">
      {/* Projects Section */}
      <section>
        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Projects</h3>
          <p className="text-sm text-muted-foreground">
            Showcase 2–3 relevant projects to demonstrate your skills.
          </p>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {data.projects.map((proj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
                className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4 relative group"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    Project
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Project Name</Label>
                    <Input
                      placeholder="e.g. E-commerce Platform"
                      value={proj.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Your Role</Label>
                    <Input
                      placeholder="e.g. Project Lead"
                      value={proj.role}
                      onChange={(e) => updateProject(index, 'role', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Technologies</Label>
                    <Input
                      placeholder="e.g. Excel, Tableau, Salesforce"
                      value={proj.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Link (optional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        className="pl-9"
                        placeholder="https://yourwebsite.com/project"
                        value={proj.link || ''}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={proj.description}
                    onChange={(val) => updateProject(index, 'description', val)}
                    placeholder="Describe what you built and your contribution..."
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
            onClick={addProject}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </section>

      {/* Certifications Section */}
      <section>
        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Certifications</h3>
          <p className="text-sm text-muted-foreground">List relevant certifications and licenses.</p>
        </div>
        <Label htmlFor="certifications" className="sr-only">Certifications</Label>
        <RichTextEditor
          id="certifications"
          value={data.certifications || ''}
          onChange={(val) => onChange({ ...data, certifications: val })}
          placeholder="e.g. PMP, Google Analytics Certified, HubSpot Marketing..."
          minHeight="100px"
        />
      </section>

      {/* Extracurriculars Section */}
      <section>
        <div className="mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Extracurricular Activities</h3>
          <p className="text-sm text-muted-foreground">
            Leadership roles, volunteering, or relevant hobbies.
          </p>
        </div>
        <Label htmlFor="extracurriculars" className="sr-only">Extracurricular Activities</Label>
        <RichTextEditor
          id="extracurriculars"
          value={data.extracurriculars || ''}
          onChange={(val) => onChange({ ...data, extracurriculars: val })}
          placeholder="e.g. President of Marketing Association, Volunteer Coordinator..."
          minHeight="100px"
        />
      </section>
    </div>
  );
}
