import type { Metadata } from "next";
import Link from "next/link";
import { LEVELS, TRACKS } from "@/lib/roadmap";
import { SESSIONS, loadSession, sessionFor, sessionHref } from "@/lib/sessions";
import { LessonTick } from "@/components/LessonTick";

export const metadata: Metadata = {
  title: "Lessons · architect.go",
  description: "One deep lesson for every item on the software architecture roadmap, taught in Go.",
};

export default async function LearnIndex() {
  const minutes = Object.fromEntries(
    await Promise.all(SESSIONS.map(async (s) => [s.key, (await loadSession(s)).meta.minutes] as const)),
  );
  const totalItems = [...LEVELS, ...TRACKS].reduce((n, s) => n + s.items.length, 0);

  return (
    <main className="wrap">
      <section className="hero">
        <p className="pill">
          <span className="dot" aria-hidden="true" />
          {SESSIONS.length} of {totalItems} lessons written
        </p>
        <h1>
          Lessons
          <br />
          <span className="dim-text">one for every item on the roadmap.</span>
        </h1>
        <p className="lede">
          Each lesson builds the idea from scratch, shows it working in Go, names the mistakes people actually make, and
          ends with a quiz and exercises. Lessons are added level by level, starting with Foundations.
        </p>
      </section>

      {[...LEVELS, ...TRACKS].map((st) => (
        <section key={st.id} className="lesson-group" aria-labelledby={`g-${st.id}`}>
          <header>
            <span className={st.id.startsWith("t") ? "mono track-code" : "mono accent"}>{st.code}</span>
            <h2 id={`g-${st.id}`}>{st.title}</h2>
            <span className="mono dim-text">{st.when}</span>
          </header>
          <ol className="rows">
            {st.items.map((item, i) => {
              const key = `${st.id}.${i}`;
              const s = sessionFor(key);
              return (
                <li key={key}>
                  {s ? (
                    <Link href={sessionHref(s)} className="row lesson-row">
                      <LessonTick itemKey={key} n={i + 1} />
                      <span className="row-main">
                        <b>{s.title}</b>
                        <small>{item}</small>
                      </span>
                      <span className="row-when mono">{minutes[key]} min</span>
                      <span className="chev" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ) : (
                    <div className="row lesson-row is-soon">
                      <span className="tick mono">{i + 1}</span>
                      <span className="row-main">
                        <b>{item}</b>
                      </span>
                      <span className="row-when">Being written</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <div style={{ height: 96 }} />
    </main>
  );
}
