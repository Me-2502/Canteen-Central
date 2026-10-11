import { Clock, Globe, Mail, MapPin, Phone, Star } from "lucide-react";
import type { Canteen } from "./types";

const formatTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** Canteen name, picture and contact details. Shared by the read and manage views. */
export function CanteenHeader({ canteen, actions }: { canteen: Canteen; actions?: React.ReactNode }) {
  const details = [
    { icon: MapPin, value: canteen.address },
    { icon: Phone, value: canteen.phoneNumber },
    { icon: Mail, value: canteen.mailid },
    {
      icon: Clock,
      value: canteen.startTime && canteen.endTime
        ? `${formatTime(canteen.startTime)} – ${formatTime(canteen.endTime)}`
        : null,
    },
  ].filter((d) => d.value);

  return (
    <section className="grid gap-8 rounded-[2.5rem] bg-forest p-8 text-white dark:bg-cream dark:text-forest md:grid-cols-[1fr_2fr]">
      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
        {canteen.imageUrl && <img src={canteen.imageUrl} alt={canteen.name} className="size-full object-cover" />}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-sage dark:text-forest/60">CANTEEN</p>
            <h1 className="mt-2 text-5xl font-medium">{canteen.name}</h1>
            {canteen.ownerName && <p className="mt-2 text-sm text-cream/80 dark:text-forest/70">Run by {canteen.ownerName}</p>}
          </div>
          {actions}
        </div>

        <p className="flex items-center gap-2 text-sm font-semibold">
          <Star size={14} fill="currentColor" />
          {canteen.ratingCount > 0 ? `${canteen.rating.toFixed(1)} (${canteen.ratingCount} ratings)` : "No ratings yet"}
        </p>

        <ul className="space-y-2 text-sm text-cream/90 dark:text-forest/80">
          {details.map(({ icon: Icon, value }) => (
            <li key={value} className="flex items-center gap-2"><Icon size={14} /> {value}</li>
          ))}
          {canteen.url && (
            <li>
              <a href={canteen.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                <Globe size={14} /> {canteen.url}
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
