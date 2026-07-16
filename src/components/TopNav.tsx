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
    <header className="sticky top-0 z-[700] flex items-center gap-5 px-5 h-14 border-b border-black/5 bg-white/80 backdrop-blur-xl shrink-0">
      <Link
        href="/"
        className="text-[15px] font-semibold tracking-tight shrink-0 text-slate-900"
      >
        TripBoard
      </Link>
      <nav className="flex items-center gap-0.5">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[13px] px-3 py-1.5 rounded-full transition-colors ${
                active
                  ? "bg-slate-900/[0.06] text-slate-900 font-medium"
                  : "text-slate-500 hover:text-slate-900"
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
