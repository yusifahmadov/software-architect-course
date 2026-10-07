"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEVELS } from "@/lib/roadmap";
import { useProgress } from "@/lib/progress";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const path = usePathname();
  const p = useProgress();
  const total = LEVELS.reduce((n, l) => n + l.items.length, 0);
  const done = p.ready ? LEVELS.reduce((n, l) => n + p.stageCount(l), 0) : 0;
  const level = LEVELS[p.ready ? p.currentLevel : 0];

  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href="/" className="brand" aria-label="architect.go, home">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="4" cy="17" r="2.6" fill="currentColor" />
            <circle cx="11" cy="11" r="2.6" fill="currentColor" />
            <circle cx="18" cy="5" r="2.6" fill="var(--accent)" />
            <path d="M4 17 11 11 18 5" stroke="currentColor" strokeWidth="1.4" opacity=".5" />
          </svg>
          <span>
            architect<span className="accent">.go</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>
            Roadmap
          </Link>
          <Link href="/learn" aria-current={path.startsWith("/learn") ? "page" : undefined}>
            Lessons
          </Link>
          <Link href="/course" aria-current={path === "/course" ? "page" : undefined}>
            Go course
          </Link>
        </nav>
        <div className="status" aria-label={`You are at ${level.code} ${level.short}. ${done} of ${total} items done.`}>
          <span className="mono accent">{level.code}</span>
          <span className="status-bar" aria-hidden="true">
            <i style={{ width: `${(100 * done) / total}%` }} />
          </span>
          <span className="mono status-pct">{Math.round((100 * done) / total)}%</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
