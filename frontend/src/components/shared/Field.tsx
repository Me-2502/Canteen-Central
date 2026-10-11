/** Shared class names for inputs inside management forms. */
export const formInputCls = "h-11 rounded-xl border-border bg-card px-4 font-normal";

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold">
      <span className="pl-1">{label}</span>
      {children}
      {error && <span className="block pl-1 text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}
