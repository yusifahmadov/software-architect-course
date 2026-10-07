"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; text: string };

export function SessionToc() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const hs = [...document.querySelectorAll<HTMLHeadingElement>("#session-body h2[id]")];
    setEntries(hs.map((h) => ({ id: h.id, text: h.textContent?.replace(/^#/, "").trim() ?? "" })));
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  return (
    <aside className="toc" aria-label="On this page">
      <p className="callout-label">On this page</p>
      <ol>
        {entries.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} aria-current={active === e.id ? "true" : undefined}>
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
