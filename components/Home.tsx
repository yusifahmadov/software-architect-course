"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LEVELS, TRACKS, parentLevel, type Stage } from "@/lib/roadmap";
import { LESSONS } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { RoadmapGraph } from "./RoadmapGraph";
import { StageSheet } from "./StageSheet";

function Meter({ stage }: { stage: Stage }) {
  const p = useProgress();
  const n = p.ready ? p.stageCount(stage) : 0;
  return (
    <span className="meter-row" aria-label={`${n} of ${stage.items.length} done`}>
      <span className="bar">
        <i style={{ width: `${(100 * n) / stage.items.length}%` }} />
      </span>
      <span className="mono">
        {n}/{stage.items.length}
      </span>
    </span>
  );
}

export function Home() {
  const p = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const total = LEVELS.reduce((n, l) => n + l.items.length, 0);
  const done = p.ready ? LEVELS.reduce((n, l) => n + p.stageCount(l), 0) : 0;
  const current = LEVELS[p.ready ? p.currentLevel : 0];

  return (
    <main>
      <section className="hero wrap">
        <p className="pill">
          <span className="dot" aria-hidden="true" />
          Software architecture roadmap, taught in Go
        </p>
        <h1>
          From your first Go program
          <br />
          <span className="dim-text">to software architect.</span>
        </h1>
        <p className="lede">
          Seven levels and seven specialist tracks, mapped as one graph. Tick off what you already know, see exactly
          what comes next, and practise the foundations in a hands-on Go course.
        </p>
        <div className="cta">
          <a className="btn primary" href="#roadmap">
            Explore the roadmap
          </a>
          <Link className="btn" href="/learn">
            Read the lessons
          </Link>
        </div>
        <dl className="kpis">
          <div>
            <dt>You are at</dt>
            <dd>
              <span className="mono accent">{current.code}</span> {current.short}
            </dd>
          </div>
          <div>
            <dt>Roadmap items done</dt>
            <dd>
              {done}
              <span className="of">/{total}</span>
            </dd>
          </div>
          <div>
            <dt>Go course lessons</dt>
            <dd>
              {p.ready ? p.lessonsDone : 0}
              <span className="of">/{LESSONS.length}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section id="roadmap" className="wrap frame-wrap" aria-labelledby="roadmap-title">
        <div className="frame">
          <header className="frame-bar">
            <h2 id="roadmap-title">Roadmap</h2>
            <ul className="legend" aria-label="Legend">
              <li>
                <i className="lg-level" /> Level
              </li>
              <li>
                <i className="lg-track" /> Track
              </li>
              <li>
                <i className="lg-done" /> Done
              </li>
            </ul>
          </header>
          <RoadmapGraph onOpen={setOpen} />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="levels-title">
        <div className="section-head">
          <h2 id="levels-title">Seven levels</h2>
          <p>Each level builds on the one before. The years are a rough guide, not a deadline.</p>
        </div>
        <ol className="rows">
          {LEVELS.map((l) => (
            <li key={l.id}>
              <button className="row" onClick={() => setOpen(l.id)}>
                <span className="row-code mono">{l.code}</span>
                <span className="row-main">
                  <b>{l.title}</b>
                  <small>{l.goal}</small>
                </span>
                <span className="row-when">{l.when}</span>
                <Meter stage={l} />
                <span className="chev" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="section wrap" aria-labelledby="tracks-title">
        <div className="section-head">
          <h2 id="tracks-title">Specialist tracks</h2>
          <p>Gap-fill tracks that branch off the main line. Pick them up when your work needs them.</p>
        </div>
        <ul className="cards">
          {TRACKS.map((t) => (
            <li key={t.id}>
              <button className="card" onClick={() => setOpen(t.id)}>
                <span className="card-top">
                  <span className="mono track-code">{t.code}</span>
                  <span className="card-from">from {parentLevel(t).code}</span>
                </span>
                <b>{t.title}</b>
                <small>{t.goal}</small>
                <Meter stage={t} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="foot wrap">
        <p>
          Progress is saved in this browser only. Reading lists come from the author&rsquo;s knowledge and were not
          link-checked, so check editions and URLs before you rely on them.
        </p>
        <button
          className="text-btn"
          onClick={() => {
            if (confirm("Clear every ticked roadmap item? Course progress stays.")) p.resetRoadmap();
          }}
        >
          Reset roadmap progress
        </button>
      </footer>

      <StageSheet id={open} onClose={close} onOpen={setOpen} />
    </main>
  );
}
