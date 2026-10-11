import { motion } from "motion/react";

interface SegmentedSwitchProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Unique per switch on a page, so each pill animates independently. */
  id: string;
  className?: string;
}

/** Full-width pill switch with a sliding highlight, like the log in / sign up toggle. */
export function SegmentedSwitch<T extends string>({ options, value, onChange, id, className = "" }: SegmentedSwitchProps<T>) {
  return (
    <div role="tablist" className={`grid rounded-full border border-border bg-card p-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={`relative z-10 h-11 rounded-full text-sm font-semibold transition-colors ${value === o.value ? "text-primary-foreground" : ""}`}>
          {value === o.value && (
            <motion.span layoutId={`${id}-pill`} className="absolute inset-0 -z-10 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 400, damping: 32 }} />
          )}
          {o.label}
        </button>
      ))}
    </div>
  );
}
