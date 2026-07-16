"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Explore" },
  { href: "/trip", label: "Trip" },
  { href: "/plan", label: "Planner" },
];

export default function TopNav() {
  const pathname = usePathname();
  return (
    <header className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
      <Link href="/" className="text-lg font-bold shrink-0">
        🗽 TripBoard
      </Link>
      <nav className="flex items-center gap-1">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-1.5 rounded-lg transition ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
