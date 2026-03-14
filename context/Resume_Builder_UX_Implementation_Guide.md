# Resume Builder Design System & Implementation Guide

This document outlines the UI/UX architecture for the Resume Builder feature (`/build`). It is designed to ensure a flawless implementation of a split-pane interface with complete support for both Light and Dark modes.

## 1. Architectural Layout (Split-Pane)
The builder uses a dual-pane layout locked to the viewport height (`100vh`). This prevents the entire page from scrolling and instead allows the left (form) and right (preview) panes to scroll independently.

*   **Wrapper (`min-h-screen h-screen flex flex-col overflow-hidden`)**: Locks the viewport.
*   **Header (`h-16 flex-none`)**: Sticky top nav spanning both columns.
*   **Grid (`flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden`)**: The remaining height is split into columns.
*   **Left Pane - Form (`lg:col-span-5 h-full overflow-y-auto`)**: The interactive workspace.
*   **Right Pane - Preview (`lg:col-span-7 h-full overflow-y-auto`)**: The live rendering of the document.

---

## 2. Color System & Theming Strategy
The interface relies on CSS variables for dark mode switching (e.g., `bg-background`, `text-foreground`, `bg-card`).

### A. The Editing Interface (Left Pane)
This area respects the system theme fully.
*   **Background:** `bg-background` (Light: White | Dark: #0a0a0a)
*   **Elevated Elements (Cards/Inputs):** `bg-card` (Light: White | Dark: #121212)
*   **Borders:** `border-border` (Light: #e5e5e5 | Dark: #27272a)
*   **Inputs:** `bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20`
*   **Text:** `text-foreground` and `text-muted-foreground`.

### B. The Live Preview Canvas (Right Pane)
**CRITICAL RULE:** The right pane background respects dark mode, but the *Resume Document itself must always remain strictly Light Mode (White paper, black text)*.

*   **Pane Background:** `bg-muted/30` (Light: very light gray | Dark: very dark gray/black `#09090b`).
*   **The Document (`max-w-[850px] min-h-[1056px]`)**: 
    *   **MUST** have: `bg-white text-black shadow-2xl`.
    *   **MUST NOT** use semantic colors like `text-foreground` or `bg-card` inside the document container. Hardcode the colors (e.g., `text-gray-900`, `text-gray-600`, `border-gray-200`) so it always looks like printed paper.

---

## 3. Component Details & UX Patterns

### A. Section Accordions / Cards
Repeatable sections (like Work Experience or Education) should be housed in elevated cards to group the inputs clearly.
*   **Container classes:** `bg-card border border-border p-6 rounded-[1.5rem] shadow-sm relative group`.
*   **Delete Action:** A trash icon positioned absolutely in the top right: `absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100`.

### B. Input Typography
*   **Labels:** Small, semi-bold, with high contrast. `text-sm font-semibold text-foreground/90`. Add small Lucide icons (14px) next to labels for visual flair.
*   **Inputs:** Large, accessible hit areas. `h-11 rounded-xl`.

### C. AI Generation Buttons (Magic Moments)
For textareas (like Summary or Job Responsibilities), attach a floating "AI Generate" button to encourage usage.
*   **Button classes:** `absolute -top-3 -right-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-transform`.

### D. Stepper Navigation
A clear progress indicator is crucial. Use a horizontal stepper in the left pane header.
*   **Active state:** Primary color border, filled background, glowing shadow.
*   **Completed state:** Solid primary color with a checkmark.
*   **Pending state:** Muted border/background.

---

## 4. Mobile Responsiveness
On mobile, the split-pane breaks down.
1.  The left form pane takes up 100% width.
2.  The right preview pane is hidden by default.
3.  Implement a floating "Toggle Preview" pill button fixed to the bottom of the screen (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`). Clicking this switches the view from the Form to the Preview.

---

## 5. CSS/Tailwind Cheat Sheet for Specific Elements

### Custom Scrollbar (Left & Right Panes)
```css
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.3); border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--primary) / 0.5); }
```

### Subtle Document Background Pattern (Right Pane)
```jsx
<div className="absolute inset-0 pattern-dots opacity-[0.15] text-primary pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
```
