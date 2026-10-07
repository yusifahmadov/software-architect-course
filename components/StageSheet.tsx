"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LEVELS, STAGES, findStage, parentLevel, type Level, type Track } from "@/lib/roadmap";
import { LANES, LANE_FOR_ROADMAP_ITEM } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { sessionFor, sessionHref } from "@/lib/sessions";

type Props = { id: string | null; onClose: () => void; onOpen: (id: string) => void };

export function StageSheet({ id, onClose, onOpen }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const p = useProgress();
  const stage = id ? findStage(id) : undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (stage && !d.open) d.showModal();
    if (!stage && d.open) d.close();
  }, [stage]);

  const idx = stage ? STAGES.findIndex((s) => s.id === stage.id) : -1;
  const prev = idx > 0 ? STAGES[idx - 1] : undefined;
  const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : undefined;
  const level = stage && "level" in stage ? (stage as Level) : undefined;

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {stage && (
        <div className="sheet-in">
          <div className="sheet-top">
            <p className="eyebrow">
              {level
                ? `${level.code} · Level ${level.level} · ${level.when}`
                : `${stage.code} · Track from ${parentLevel(stage as Track).code} · ${stage.when}`}
            </p>
            <button className="close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <h2 id="sheet-title">{stage.title}</h2>
          <p className="goal">{stage.goal}</p>

          <h3>
            <span>Syllabus</span>
            <span>
              {p.stageCount(stage)}/{stage.items.length} done
            </span>
          </h3>
          <ul className="checks">
            {stage.items.map((item, i) => {
              const k = `${stage.id}.${i}`;
              const locked = p.itemLocked(k);
              return (
                <li key={k}>
                  <label className="check">
                    <input type="checkbox" checked={p.itemDone(k)} disabled={locked} onChange={() => p.toggleItem(k)} />
                    <span>{item}</span>
                  </label>
                  {sessionFor(k) && (
                    <Link className="lesson-link" href={sessionHref(sessionFor(k)!)}>
                      Open the lesson →
                    </Link>
                  )}
                  {LANE_FOR_ROADMAP_ITEM[k] && (
                    <span className="check-sub">
                      {locked ? "Ticked by finishing the " : "Ticks itself when you finish the "}
                      <Link href="/course">{LANES[LANE_FOR_ROADMAP_ITEM[k]].name.toLowerCase()} lane</Link> in the Go course.
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <h3>Reading pack</h3>
          <ul className="pack">
            {stage.resources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <div className="done-when">
            <b>
              {level && level.level < LEVELS.length - 1 ? "Ready for the next level when" : "Done when"}
            </b>
            {stage.doneWhen}
          </div>

          <nav className="sheet-nav" aria-label="Other stops">
            {prev ? <button onClick={() => onOpen(prev.id)}>← {prev.short}</button> : <span />}
            {next ? <button onClick={() => onOpen(next.id)}>{next.short} →</button> : <span />}
          </nav>
        </div>
      )}
    </dialog>
  );
}
