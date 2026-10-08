"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  {
    href: "/",
    label: "Path",
    matches: (path: string) => path === "/",
    icon: <path d="M4 20c4 0 4-6 8-6s4 6 8 6M4 10c4 0 4-6 8-6s4 6 8 6" />,
  },
  {
    href: "/learn",
    label: "Lessons",
    matches: (path: string) => path.startsWith("/learn"),
    icon: <path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" />,
  },
  {
    href: "/course",
    label: "Go course",
    matches: (path: string) => path.startsWith("/course"),
    icon: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="shell">
      <nav className="rail" aria-label="Main">
        <Link href="/" className="rail-brand" aria-label="architect.go, home">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="4" cy="17" r="2.6" fill="currentColor" />
            <circle cx="11" cy="11" r="2.6" fill="currentColor" />
            <circle cx="18" cy="5" r="2.6" fill="var(--accent)" />
            <path d="M4 17 11 11 18 5" stroke="currentColor" strokeWidth="1.4" opacity=".5" />
          </svg>
          <span>
            architect<b>.go</b>
          </span>
        </Link>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="rail-link" aria-current={item.matches(path) ? "page" : undefined}>
            <NavIcon>{item.icon}</NavIcon>
            <span>{item.label}</span>
          </Link>
        ))}
        <div className="rail-spacer" />
        <ThemeToggle />
      </nav>
      <div className="shell-main">{children}</div>
    </div>
  );
}
