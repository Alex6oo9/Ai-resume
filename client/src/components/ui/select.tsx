import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectCtxType {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
}

const SelectCtx = createContext<SelectCtxType>({
  value: '',
  onValueChange: () => {},
  options: [],
});

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const options: SelectOption[] = [];

  const extract = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const type = child.type as any;
      if (type === SelectContent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extract((child.props as any).children);
      } else if (type === SelectItem) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = child.props as any;
        options.push({ value: p.value, label: String(p.children) });
      }
    });
  };
  extract(children);

  return (
    <SelectCtx.Provider value={{ value, onValueChange, options }}>
      {children}
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({
  id,
  className,
  children: _children,
}: {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { value, onValueChange, options } = useContext(SelectCtx);
  return (
    <div className={cn('relative transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 rounded-md', className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground shadow-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:[color-scheme:dark] [&>option]:bg-background dark:[&>option]:bg-zinc-900"
      >
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center transition-transform duration-200">
        <svg
          className="h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export function SelectValue({ placeholder: _placeholder }: { placeholder?: string }) {
  return null;
}

export function SelectContent({ children: _children }: { children?: React.ReactNode }) {
  return null;
}

export function SelectItem({
  value: _value,
  children: _children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return null;
}
