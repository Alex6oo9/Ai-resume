# Resume Builder UI Flow & Layout Architecture

This document explains the implementation details of the Resume Builder's layout, specifically focusing on the collapsible sidebar, vertical navigation, and layout animations. It is intended as a reference for replicating this exact UI flow and CSS structure.

## 1. High-Level Layout Architecture

The page (`Builder.tsx`) uses a standard two-pane layout inside a full-screen flex container. We use Framer Motion for smooth width adjustments.

```tsx
<div className="flex h-screen w-full bg-background overflow-hidden font-sans relative">
  {/* Left Panel (Form/Nav) */}
  <motion.div>...</motion.div>

  {/* Right Panel (Live Preview) */}
  <motion.div layout className="flex-1 h-full ...">...</motion.div>
</div>
```

### Key Tailwind Classes:
- `flex h-screen w-full`: Makes the root container take exactly 100% of viewport height and width.
- `overflow-hidden`: Prevents page-level scrolling. All scrolling is handled *inside* the respective panels.
- `bg-background`: Uses standard CSS variables for theme support (dark/light mode).
- `relative`: Necessary so absolute positioned elements (like the floating toolbar) stay inside the layout bounds.

## 2. Left Panel: Expanding & Collapsing Logic

The Left panel toggles between an "Open" state (Form View) and a "Closed" state (Vertical Nav View). 

### Animation & Sizing
We use Framer Motion to animate the width of the panel.

```tsx
<motion.div 
  initial={false}
  animate={{ 
    width: isLeftPanelOpen 
      ? (window.innerWidth >= 1024 ? "45vw" : "100vw")  // Open State
      : (window.innerWidth >= 1024 ? "280px" : "80px")  // Closed State
  }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  className="flex flex-col h-full border-r border-border bg-card z-30 shadow-[4px_0_24px_rgba(0,0,0,0.04)] relative overflow-hidden shrink-0"
>
  <AnimatePresence mode="wait">
    {isLeftPanelOpen ? <OpenPanel /> : <ClosedPanel />}
  </AnimatePresence>
</motion.div>
```

### Tailwind Breakdown:
- `shrink-0`: Prevents the panel from being crushed by the right panel. It *must* respect the width set by Framer Motion.
- `border-r border-border`: Subtle dividing line.
- `shadow-[4px_0_24px_rgba(0,0,0,0.04)]`: Custom drop shadow extending rightwards to create visual elevation over the preview panel.
- `flex flex-col h-full`: Sets up internal flex layout so the header can be fixed at the top, the form/nav can scroll in the middle, and the footer sits at the bottom.

## 3. The Vertical Navigation (Closed State)

When the panel is collapsed, we render a vertical step tracker. On mobile, it's just circles (80px wide). On desktop, it's 280px wide and shows both the circles and the text labels.

```tsx
<div className="w-[80px] lg:w-[280px] h-full flex flex-col bg-card shrink-0">
  {/* Nav Container */}
  <div className="flex-1 w-full flex flex-col py-8 px-0 lg:px-6 overflow-y-auto custom-scrollbar">
    <div className="space-y-0 relative flex flex-col items-center lg:items-stretch">
      {STEPS.map((step, index) => (
        <div className="relative group flex flex-col items-center lg:items-start w-full">
           
           {/* The Clickable Button */}
           <button onClick={() => openPanelAndSetStep(index)} className="relative flex items-center gap-4 w-full py-3 lg:py-4 px-0 lg:px-2 text-center lg:text-left z-10 justify-center lg:justify-start">
             {/* Circle Indicator */}
             <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ...">
               ...
             </span>
             {/* Text Label (Hidden on Mobile) */}
             <span className="text-sm font-medium hidden lg:block">
               {step.title}
             </span>
           </button>
           
           {/* Connecting Line */}
           <div className="relative lg:absolute lg:top-[52px] lg:left-[26px] w-0.5 h-6 lg:h-8 bg-border z-0 my-0 lg:my-0">
             <div className="w-full bg-primary transition-all duration-500" style={{ height: isCompleted ? '100%' : '0%' }} />
           </div>

        </div>
      ))}
    </div>
  </div>
</div>
```

### Tailwind Breakdown:
- **Responsive Layout (`lg:items-stretch` vs `items-center`)**: On mobile (under 1024px), elements are centered in an 80px column. On desktop (`lg:`), they stretch to fill the 280px width to allow left-aligned text.
- **Connecting Lines (`lg:absolute lg:top-[52px] lg:left-[26px]`)**: 
  - On mobile, the connecting line is rendered `relative` between the flex items.
  - On desktop, because the button is a row (icon + text), the line is positioned `absolute` specifically under the icon (`left-[26px]`).
- **Dynamic Circle Styling**:
  - *Active & Incomplete*: `border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]` (Purple ring with soft glow).
  - *Active & Complete*: `border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]` (Solid purple fill + glow).
  - *Complete*: `border-primary bg-primary text-primary-foreground`.
  - *Incomplete*: `border-border bg-background text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground`.

## 4. "Finish & View" State Logic

To mark the final state as completed without adding an extra dummy step, we introduced a `hasFinished` boolean state. 

```tsx
const isCompleted = hasFinished ? true : index < currentStep;
```
When the user clicks "Finish & View" on the last step:
1. `setHasFinished(true)` is triggered.
2. `setIsLeftPanelOpen(false)` is triggered.
3. Every step in the map evaluates `isCompleted` to `true`, turning all circles solid purple with checkmarks instantly.

## 5. Right Panel: Preview Area & Floating Toolbar

The right panel fills the remaining space and contains a static background, the live preview, and a floating action bar.

```tsx
<motion.div layout className="flex-1 h-full bg-muted/30 relative overflow-hidden flex flex-col">
  {/* Decorative Background */}
  <div className="absolute inset-0 pattern-dots opacity-30 text-primary pointer-events-none" />
  
  {/* Scrollable Preview Area */}
  <div className="flex-1 w-full h-full relative pt-16 sm:pt-20">
     <LivePreview formData={formData} template={template} />
  </div>
</motion.div>
```

### Floating Toolbar
Instead of putting tools inside the scrolling preview or the collapsing sidebar, we use an `absolute` positioned toolbar anchored to the top right of the screen `z-40`.

```tsx
<div className="absolute top-4 right-6 z-40 flex items-center gap-2 bg-background/60 backdrop-blur-md p-1.5 rounded-full border border-border/50 shadow-sm transition-all hover:bg-background/80">
   {/* Tools... */}
</div>
```
- `absolute top-4 right-6 z-40`: Anchors it to the top right of the whole viewport.
- `bg-background/60 backdrop-blur-md`: Creates the frosted glass effect.
- `rounded-full`: Makes it a pill shape.

### Animation Note (`layout` prop)
The `motion.div` for the Right Panel uses the `layout` prop. This tells Framer Motion to automatically animate this container as its sibling (the left panel) changes width. There is no need to manually calculate the width of the right panel, flexbox (`flex-1`) combined with `layout` handles the resize animation perfectly.