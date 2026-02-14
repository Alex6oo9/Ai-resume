# Template Thumbnails

This directory contains preview images for resume templates.

## Required Files

- `ats-preview.png` - Preview of ATS Template
- `simple-preview.png` - Preview of Simple Template

## Specifications

- **Dimensions**: 400px × 520px (A4 aspect ratio)
- **Format**: PNG with transparency or white background
- **Content**: Sample resume showing template styling

## How to Create Thumbnails

### Option 1: Manual Screenshots (Fastest)

1. Build a sample resume in each template
2. Take a screenshot
3. Crop to 400×520px
4. Save as PNG in this directory

### Option 2: Design Tool (Recommended)

1. Use Figma, Photoshop, or Canva
2. Create 400×520px canvas
3. Design sample resume with template styles:
   - **ATS Template**: Arial font, black text, no colors, minimal spacing
   - **Simple Template**: Calibri font, dark gray headings, section dividers
4. Export as PNG

### Option 3: Puppeteer Script (Automated)

Run this script to generate thumbnails from actual template renderers:

\`\`\`bash
# After implementing template renderer components
npm run generate-thumbnails
\`\`\`

*(Script not yet implemented - can add in Phase 4)*

## Sample Data to Use

**Name**: Jane Doe
**Email**: jane.doe@email.com
**Phone**: +1-555-123-4567
**Location**: San Francisco, CA

**Summary**: Recent Computer Science graduate with experience in full-stack development...

**Education**:
- B.S. Computer Science
- Massachusetts Institute of Technology
- GPA: 3.8/4.0
- Graduated: May 2024

**Experience**:
- Software Engineering Intern | Google | Summer 2023
- Data Analysis Intern | Microsoft | Summer 2022

**Skills**:
- Programming: Python, JavaScript, SQL
- Tools: React, Node.js, PostgreSQL
- Soft Skills: Communication, Teamwork, Problem-solving

## Temporary Placeholders

For development, you can use placeholder images from:
- https://via.placeholder.com/400x520/FFFFFF/000000?text=ATS+Template
- https://via.placeholder.com/400x520/F5F5F5/333333?text=Simple+Template

Or create simple colored rectangles with text overlays in any image editor.

## TODO

- [ ] Create ats-preview.png
- [ ] Create simple-preview.png
- [ ] Test images display correctly in template selector
