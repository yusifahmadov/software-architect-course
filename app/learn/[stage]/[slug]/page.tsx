import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SESSIONS, loadSession, sessionBySlug, sessionHref, sessionsInStage, stageOf } from "@/lib/sessions";
import { SessionToc } from "@/components/SessionToc";
import { SessionComplete } from "@/components/SessionComplete";

type Params = { stage: string; slug: string };

export function generateStaticParams(): Params[] {
  return SESSIONS.map((s) => ({ stage: s.stage, slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { stage, slug } = await params;
  const s = sessionBySlug(stage, slug);
  if (!s) return {};
  const { meta } = await loadSession(s);
  return { title: `${s.title} · architect.go`, description: meta.summary };
}

export default async function SessionPage({ params }: { params: Promise<Params> }) {
  const { stage, slug } = await params;
  const s = sessionBySlug(stage, slug);
  if (!s) notFound();
  const { default: Content, meta } = await loadSession(s);
  const st = stageOf(s);
  const siblings = sessionsInStage(stage);
  const i = siblings.findIndex((x) => x.key === s.key);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];

  return (
    <main className="wrap session">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/learn">Lessons</Link>
        <span aria-hidden="true">/</span>
        <span>
          <span className="mono accent">{st.code}</span> {st.short}
        </span>
        <span aria-hidden="true">/</span>
        <span className="mono">
          {s.index + 1} of {st.items.length}
        </span>
      </nav>

      <header className="session-head">
        <h1>{s.title}</h1>
        <p className="lede">{meta.summary}</p>
        <div className="session-facts">
          <span className="mono">{meta.minutes} min</span>
          <span>Roadmap item: {st.items[s.index]}</span>
        </div>
        <div className="outcomes">
          <p className="callout-label">By the end you can</p>
          <ul>
            {meta.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </header>

      <div className="session-grid">
        <SessionToc />
        <article className="prose" id="session-body">
          <Content />
          <SessionComplete itemKey={s.key} />
          <nav className="session-nav" aria-label="More lessons">
            {prev ? (
              <Link href={sessionHref(prev)} className="snav prev">
                <small>Previous</small>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={sessionHref(next)} className="snav next">
                <small>Next</small>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </div>
    </main>
  );
}
