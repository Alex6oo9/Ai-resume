
***

# Template Thumbnail Feature — Complete Implementation Spec

## Context & What Already Exists

Read these facts before touching any file:

- **`GET /api/templates`** already returns `thumbnailUrl` per template — the API contract is done [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/26d7fb5f-4afd-488a-aa8d-beeeb8e30116/SERVER-2.md)
- **`useTemplates()` hook** already fetches and exposes `thumbnailUrl` — no hook changes needed [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/4bb03feb-eb1b-4a05-83eb-644a6ba1b158/CLIENT.md)
- **`thumbnailUrl`** column exists in the `templates` DB table — it just has no values yet [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/26d7fb5f-4afd-488a-aa8d-beeeb8e30116/SERVER-2.md)
- **Puppeteer** is already installed in `server/` (used by PDF export) [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/c51b12be-5341-47e7-a038-67c99ca50080/Resume_Builder_Feature-3.md)
- **Template IDs** are: `modern`, `modern_yellow_split`, `dark_ribbon_modern`, `modern_minimalist_block`, `editorial_earth_tone`, `ats_clean`, `ats_lined` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/4bb03feb-eb1b-4a05-83eb-644a6ba1b158/CLIENT.md)
- **`ResumeTemplateSwitcher`** lives at `client/src/components/templates/ResumeTemplateSwitcher.tsx` and accepts `templateId` + form data props [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/c51b12be-5341-47e7-a038-67c99ca50080/Resume_Builder_Feature-3.md)
- **Router** uses `createBrowserRouter` — add routes there [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/4bb03feb-eb1b-4a05-83eb-644a6ba1b158/CLIENT.md)
- **Migrations** are numbered files in `server/src/migrations/` — last one is `028` so next is `029` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/26d7fb5f-4afd-488a-aa8d-beeeb8e30116/SERVER-2.md)

***

## Files to CREATE

### 1. `scripts/thumbnail-data.ts`

```typescript
import type { ResumeFormData } from '../client/src/types/index';

export const SAMPLE_RESUME_DATA: ResumeFormData = {
  fullName: 'Alexandra Chen',
  email: 'alex.chen@email.com',
  phone: '+1 (555) 234-5678',
  city: 'San Francisco',
  country: 'United States',
  linkedinUrl: 'linkedin.com/in/alexchen',
  portfolioUrl: '',
  additionalLinks: [],
  profilePhoto: undefined,
  targetRole: 'Senior Product Manager',
  targetIndustry: 'Technology',
  targetCountry: 'United States',
  targetCity: 'San Francisco',
  education: [
    {
      degreeType: 'Bachelor of Science',
      major: 'Computer Science',
      university: 'University of California, Berkeley',
      graduationDate: 'May 2019',
      gpa: '3.8',
      relevantCoursework: 'Data Structures, Algorithms, Human-Computer Interaction, Product Design',
      honors: 'Magna Cum Laude',
    },
  ],
  experience: [
    {
      type: 'full-time',
      company: 'Stripe',
      role: 'Senior Product Manager',
      duration: 'Jan 2022 – Present',
      responsibilities:
        'Led cross-functional team of 12 engineers and designers to ship payments dashboard\nIncreased user activation rate by 34% through onboarding redesign initiative\nDefined and executed product roadmap for developer tools segment worth $40M ARR\nCollaborated with sales and marketing to launch 3 major product features in 2023',
      industry: 'Fintech',
    },
    {
      type: 'full-time',
      company: 'Airbnb',
      role: 'Product Manager',
      duration: 'Jun 2019 – Dec 2021',
      responsibilities:
        'Owned host onboarding product used by 500K+ new hosts annually\nReduced host time-to-first-booking by 22% through UX improvements\nPartnered with data science team to build ML-powered pricing recommendations',
      industry: 'Travel & Hospitality',
    },
  ],
  projects: [
    {
      name: 'Internal Analytics Platform',
      description:
        'Built a real-time analytics dashboard used by 200+ internal employees to monitor product KPIs',
      technologies: 'React, TypeScript, D3.js, PostgreSQL',
      role: 'Lead Developer & PM',
      link: 'github.com/alexchen/analytics',
    },
    {
      name: 'Developer SDK Redesign',
      description:
        'Redesigned public-facing SDK documentation and reduced developer time-to-integration by 40%',
      technologies: 'Figma, Notion, Stripe API',
      role: 'Product Lead',
    },
  ],
  skills: {
    technical: [
      { category: 'Tools', items: ['Figma', 'Jira', 'Mixpanel', 'Amplitude', 'SQL', 'Tableau'] },
      { category: 'Languages', items: ['Python', 'TypeScript', 'SQL'] },
      { category: 'Methodologies', items: ['Agile', 'Scrum', 'OKRs', 'Design Thinking'] },
    ],
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Critical Thinking', 'Adaptability'],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Mandarin', proficiency: 'professional' },
    ],
  },
  professionalSummary:
    'Results-driven Product Manager with 5+ years of experience building B2B SaaS products at high-growth companies. Proven track record of shipping features that drive measurable business outcomes and exceptional user experiences. Passionate about developer tools, data-informed decision-making, and cross-functional collaboration.',
  certifications: 'AWS Certified Solutions Architect – Associate (2023)\nGoogle Analytics Certified (2022)',
  extracurriculars:
    'Mentor at Product School – coaching 10 aspiring PMs per cohort\nOrganizer of SF Product Meetup (500+ members)',
};
```

***

### 2. `scripts/generate-thumbnails.ts`

```typescript
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const TEMPLATE_IDS = [
  'modern',
  'modern_yellow_split',
  'dark_ribbon_modern',
  'modern_minimalist_block',
  'editorial_earth_tone',
  'ats_clean',
  'ats_lined',
];

const OUTPUT_DIR = path.resolve(__dirname, '../client/public/thumbnails');
const DEV_SERVER_URL = 'http://localhost:5173';
// A4 at 96dpi = 816 × 1056px
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const SCALE = 2; // retina quality

async function generateThumbnails(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  for (const templateId of TEMPLATE_IDS) {
    console.log(`\nGenerating: ${templateId}`);
    const page = await browser.newPage();

    await page.setViewport({
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      deviceScaleFactor: SCALE,
    });

    const url = `${DEV_SERVER_URL}/thumbnail-preview?template=${templateId}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait until the template component signals it is fully painted
    await page.waitForSelector('[data-thumbnail-ready="true"]', { timeout: 15000 });

    // Extra wait for web fonts to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const outputPath = path.join(OUTPUT_DIR, `${templateId}.png`);
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT },
    });

    await page.close();
    console.log(`  ✅ Saved: ${outputPath}`);
  }

  await browser.close();
  console.log('\n✅ All thumbnails generated successfully!');
  console.log(`Output: ${OUTPUT_DIR}`);
}

generateThumbnails().catch((err) => {
  console.error('Thumbnail generation failed:', err);
  process.exit(1);
});
```

***

### 3. `client/src/pages/ThumbnailPreviewPage.tsx`

```tsx
import { useSearchParams } from 'react-router-dom';
import { SAMPLE_RESUME_DATA } from '../../../scripts/thumbnail-data';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { TemplateId } from '../components/templates/types';

const VALID_TEMPLATE_IDS: TemplateId[] = [
  'modern',
  'modern_yellow_split',
  'dark_ribbon_modern',
  'modern_minimalist_block',
  'editorial_earth_tone',
  'ats_clean',
  'ats_lined',
];

export default function ThumbnailPreviewPage() {
  const [params] = useSearchParams();
  const rawTemplate = params.get('template') ?? 'modern';
  const templateId: TemplateId = VALID_TEMPLATE_IDS.includes(rawTemplate as TemplateId)
    ? (rawTemplate as TemplateId)
    : 'modern';

  return (
    // 816px matches ResumePreview sizer (8.5in at 96dpi). No transform scaling needed.
    // data-thumbnail-ready signals Puppeteer that the component has mounted and painted.
    <div
      style={{ width: 816, margin: 0, padding: 0, background: 'white' }}
      data-thumbnail-ready="true"
    >
      <ResumeTemplateSwitcher
        templateId={templateId}
        data={SAMPLE_RESUME_DATA}
      />
    </div>
  );
}
```

> **Note for Claude Code:** `ResumeTemplateSwitcher` prop names (`data`, `formData`, etc.) — check the actual component signature in `client/src/components/templates/ResumeTemplateSwitcher.tsx` and match them exactly. Also check how `ResumePreview.tsx` calls `ResumeTemplateSwitcher` and use the same prop pattern.

***

### 4. `server/src/migrations/029_update_template_thumbnails.ts`

Look at an existing migration file (e.g. `028_allow_null_resume_id_cover_letters.ts`) to match the exact export/runner pattern. Then create:

```typescript
import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  const thumbnails: Record<string, string> = {
    modern:                  '/thumbnails/modern.png',
    modern_yellow_split:     '/thumbnails/modern_yellow_split.png',
    dark_ribbon_modern:      '/thumbnails/dark_ribbon_modern.png',
    modern_minimalist_block: '/thumbnails/modern_minimalist_block.png',
    editorial_earth_tone:    '/thumbnails/editorial_earth_tone.png',
    ats_clean:               '/thumbnails/ats_clean.png',
    ats_lined:               '/thumbnails/ats_lined.png',
  };

  for (const [slug, url] of Object.entries(thumbnails)) {
    await pool.query(
      'UPDATE templates SET thumbnail_url = $1 WHERE name = $2',
      [url, slug]
    );
  }

  console.log('Migration 029: template thumbnail_url values updated.');
}

export async function down(pool: Pool): Promise<void> {
  await pool.query('UPDATE templates SET thumbnail_url = NULL');
  console.log('Migration 029 rolled back: thumbnail_url cleared.');
}
```

***

## Files to MODIFY

### 5. `client/src/components/live-preview/templateTypes.ts`

Add `thumbnailUrl` to `TemplateBasicInfo`. Find the interface and add the field:

```typescript
export interface TemplateBasicInfo {
  id: string;
  name: TemplateId;
  displayName: string;
  description: string;
  category: 'modern' | 'ats';
  thumbnailUrl: string | null;   // ← ADD THIS LINE
  isAtsFriendly: boolean;
  isPremium: boolean;            // already exists, keep it
  requiredTier: 'free' | 'monthly' | 'annual';
  isLocked: boolean;
}
```

> **Note for Claude Code:** Open the actual file first and only add `thumbnailUrl: string | null` to the existing interface. Do not remove any existing fields.

***

### 6. `client/src/components/live-preview/TemplateSwitcher.tsx`

This is the main UI change. Open the existing file and apply the following changes:

**6a. Add the two thumbnail sub-components** at the top of the file (after imports):

```tsx
// ─── Thumbnail sub-components ──────────────────────────────────────────────

interface TemplateThumbnailProps {
  thumbnailUrl: string | null;
  displayName: string;
}

function TemplateThumbnailPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
      style={{ aspectRatio: '210 / 297' }}
    >
      <span className="text-xs font-medium text-gray-400">{label}</span>
    </div>
  );
}

function TemplateThumbnail({ thumbnailUrl, displayName }: TemplateThumbnailProps) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');

  React.useEffect(() => {
    setStatus('loading');
  }, [thumbnailUrl]);

  if (!thumbnailUrl) {
    return <TemplateThumbnailPlaceholder label={displayName} />;
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100"
      style={{ aspectRatio: '210 / 297' }}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      <img
        src={thumbnailUrl}
        alt={`${displayName} template preview`}
        className={`h-full w-full object-cover object-top transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status === 'error' && (
        <div className="absolute inset-0">
          <TemplateThumbnailPlaceholder label={displayName} />
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
```

**6b. Replace the template card markup** inside the `.map()` loop. Find the existing card element rendered per template and replace it entirely with:

```tsx
<div
  key={template.id}
  className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200
    ${
      selectedTemplate === template.name
        ? 'border-violet-500 shadow-lg shadow-violet-100'
        : 'border-gray-200 hover:border-violet-300 hover:shadow-md'
    }
    ${template.isLocked ? 'opacity-60' : ''}`}
  onClick={() => {
    if (!template.isLocked) {
      onSelectTemplate(template.name);
    }
  }}
>
  {/* ── Thumbnail ── */}
  <TemplateThumbnail
    thumbnailUrl={template.thumbnailUrl}
    displayName={template.displayName}
  />

  {/* ── Lock overlay ── */}
  {template.isLocked && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
        🔒 {template.requiredTier}
      </span>
    </div>
  )}

  {/* ── Selected checkmark badge ── */}
  {selectedTemplate === template.name && (
    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 shadow-md">
      <svg
        className="h-3.5 w-3.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )}

  {/* ── Card footer: title + badges + description ── */}
  <div className="border-t border-gray-100 p-3">
    <div className="flex items-center gap-1.5">
      <h3 className="truncate text-sm font-semibold text-gray-800">{template.displayName}</h3>
      {template.isAtsFriendly && (
        <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
          ATS
        </span>
      )}
    </div>
    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{template.description}</p>
  </div>
</div>
```

**6c. Update the grid className** — find the `<div className="grid ...">` wrapping the cards and change:

```tsx
// BEFORE (whatever it currently is, likely):
className="grid grid-cols-2 gap-3 ..."

// AFTER:
className="grid grid-cols-2 gap-4 sm:grid-cols-3"
```

***

### 7. Router file (find the file containing `createBrowserRouter`)

Based on the docs, the router is likely at `client/src/main.tsx` or `client/src/router.tsx`. Open it and add the thumbnail preview route. It must have **no auth wrapper and no layout wrapper**:

```tsx
import ThumbnailPreviewPage from './pages/ThumbnailPreviewPage';

// Inside the createBrowserRouter([...]) array, add:
{
  path: '/thumbnail-preview',
  element: <ThumbnailPreviewPage />,
},
```

***

### 8. Root-level `package.json` (or `server/package.json`)

Check where `puppeteer` is installed (most likely `server/package.json`). Add the script to that `package.json`:

```json
{
  "scripts": {
    "generate:thumbnails": "ts-node --project tsconfig.json ../../scripts/generate-thumbnails.ts"
  }
}
```

> **Note for Claude Code:** Adjust the `ts-node` path and tsconfig reference based on the project's actual directory structure. If there's a root-level `package.json` with workspace scripts, add it there instead. If `ts-node` is not installed, use `npx ts-node`.

Also create `client/public/thumbnails/.gitkeep` so the directory is tracked by git before thumbnails are generated:

```bash
mkdir -p client/public/thumbnails
touch client/public/thumbnails/.gitkeep
```

***

## How to Run After Implementation

```bash
# Step 1 — Run the DB migration
# (use whatever command your project uses to run migrations, e.g.:)
cd server && npx ts-node src/migrate.ts
# or: npm run migrate

# Step 2 — Start the client dev server (must be running for Puppeteer to visit it)
cd client && npm run dev
# Wait until Vite prints "ready in Xms"

# Step 3 — In a second terminal, run the generator
npm run generate:thumbnails

# Step 4 — Verify 7 PNGs exist
ls client/public/thumbnails/
# modern.png  modern_yellow_split.png  dark_ribbon_modern.png
# modern_minimalist_block.png  editorial_earth_tone.png
# ats_clean.png  ats_lined.png

# Step 5 — Test the UI
# Open http://localhost:5173/build → click "Choose Template" → thumbnails should appear
```

***

## Adding a New Template in the Future

```
1. Build the React component as usual (client/src/components/templates/NewTemplate.tsx)
2. Add the id to TemplateId union in client/src/components/templates/types.ts
3. Register it in ResumeTemplateSwitcher.tsx
4. Add it to TEMPLATE_IDS array in scripts/generate-thumbnails.ts
5. Run: npm run generate:thumbnails  (dev server must be running)
6. Write a migration to INSERT the new template row with thumbnail_url = '/thumbnails/new_id.png'
7. Run the migration
```

***

## Checklist for Claude Code

```
□ Create scripts/thumbnail-data.ts
□ Create scripts/generate-thumbnails.ts
□ Create client/src/pages/ThumbnailPreviewPage.tsx
   └─ Verify ResumeTemplateSwitcher prop names match actual component
□ Create server/src/migrations/029_update_template_thumbnails.ts
   └─ Match export pattern of existing migration files
□ Modify client/src/components/live-preview/templateTypes.ts
   └─ Add thumbnailUrl: string | null to TemplateBasicInfo
□ Modify client/src/components/live-preview/TemplateSwitcher.tsx
   └─ Add TemplateThumbnail + TemplateThumbnailPlaceholder components
   └─ Replace card body markup
   └─ Update grid className
□ Add /thumbnail-preview route to createBrowserRouter (no auth, no layout)
□ Add generate:thumbnails npm script
□ Create client/public/thumbnails/.gitkeep
```