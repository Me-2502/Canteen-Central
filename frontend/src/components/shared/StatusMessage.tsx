import { Link } from "react-router-dom";

/** Full-width message for not-found and error states on detail pages. */
export function StatusMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-medium">{title}</h1>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
      <Link to="/menu" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Back to the menu
      </Link>
    </div>
  );
}
