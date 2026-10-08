"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS, TRACKS, type Level, type Track } from "@/lib/roadmap";
import { LANES, LANE_FOR_ROADMAP_ITEM } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { sessionFor, sessionHref } from "@/lib/sessions";
import { StageSheet } from "./StageSheet";

const WIND = [0, 52, 84, 52, 0, -52, -84, -52];
const QUEST_FIRST_STOP = 2;
const QUEST_STOP_SPACING = 4;
const CELEBRATION_COLORS = ["#5fd6f5", "#00add8", "#9d8cfb", "#f5c451", "#ffffff"];

type StopState = "done" | "current" | "upcoming";
type Popover = { key: string; x: number; y: number };

const itemKey = (stageId: string, index: number) => `${stageId}.${index}`;
const windOffset = (index: number) => WIND[index % WIND.length];
const totalTopics = LEVELS.reduce((n, l) => n + l.items.length, 0);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function celebrate(x: number, y: number) {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < 34; i++) {
    const piece = document.createElement("span");
    piece.className = "lp-confetti";
    piece.style.background = CELEBRATION_COLORS[i % CELEBRATION_COLORS.length];
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    document.body.appendChild(piece);
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 110;
    piece.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 80}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    ).onfinish = () => piece.remove();
  }
}

const Icon = {
  done: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#04222c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  current: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#04222c" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
    </svg>
  ),
  upcoming: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  trophy: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 21h8M9 21v-1a3 3 0 0 1 6 0v1" />
    </svg>
  ),
  chest: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1440" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v9H3zM3 12h18M10 12v3h4v-3" />
    </svg>
  ),
  guide: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" />
    </svg>
  ),
};

function SideQuest({ track, side, onOpen }: { track: Track; side: "left" | "right"; onOpen: (id: string) => void }) {
  const p = useProgress();
  const count = p.ready ? p.stageCount(track) : 0;
  return (
    <div className={`lp-quest ${side}${count === 0 ? " untouched" : ""}`}>
      <button className="lp-chest" onClick={() => onOpen(track.id)} aria-label={`Side quest: ${track.title}, ${count} of ${track.items.length} done`}>
        <span className="lip" />
        <span className="face">{Icon.chest}</span>
      </button>
      <div className="lp-quest-text">
        <small>Side quest · {track.code}</small>
        <b>{track.short}</b>
        <span>
          {count}/{track.items.length}
        </span>
      </div>
    </div>
  );
}

export function LearningPath() {
  const p = useProgress();
  const [sheet, setSheet] = useState<string | null>(null);
  const [popover, setPopover] = useState<Popover | null>(null);
  const scrolledToCurrent = useRef(false);
  const closeSheet = useCallback(() => setSheet(null), []);

  const allKeys = LEVELS.flatMap((l) => l.items.map((_, i) => itemKey(l.id, i)));
  const currentKey = p.ready ? allKeys.find((k) => !p.itemDone(k)) : allKeys[0];
  const stateOf = (key: string): StopState => (p.ready && p.itemDone(key) ? "done" : key === currentKey ? "current" : "upcoming");
  const currentLevel = LEVELS.find((l) => currentKey?.startsWith(`${l.id}.`)) ?? LEVELS[LEVELS.length - 1];
  const doneCount = p.ready ? LEVELS.reduce((n, l) => n + p.stageCount(l), 0) : 0;
  const levelComplete = (l: Level) => p.ready && p.stageCount(l) === l.items.length;
  const trophies = LEVELS.filter(levelComplete).length;

  useEffect(() => {
    if (!p.ready || scrolledToCurrent.current) return;
    scrolledToCurrent.current = true;
    document.querySelector(".lp-node.current")?.scrollIntoView({ block: "center" });
  }, [p.ready]);

  useEffect(() => {
    if (!popover) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".lp-pop") && !target.closest(".lp-node")) setPopover(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [popover]);

  const openPopover = (key: string, button: HTMLElement) => {
    const r = button.getBoundingClientRect();
    setPopover((open) => (open?.key === key ? null : { key, x: r.left + r.width / 2 + window.scrollX, y: r.bottom + 14 + window.scrollY }));
  };

  const markDone = (key: string, from: HTMLElement | null) => {
    if (p.itemDone(key)) return;
    const r = (from ?? document.querySelector(".lp-node.current"))?.getBoundingClientRect();
    if (r) celebrate(r.left + r.width / 2, r.top + r.height / 2);
    p.toggleItem(key);
    setPopover(null);
  };

  const popoverStage = popover ? LEVELS.find((l) => popover.key.startsWith(`${l.id}.`)) : undefined;
  const popoverIndex = popover ? Number(popover.key.split(".")[1]) : 0;
  const popoverState = popover ? stateOf(popover.key) : "upcoming";
  const popoverSession = popover ? sessionFor(popover.key) : undefined;
  const popoverLane = popover ? LANE_FOR_ROADMAP_ITEM[popover.key] : undefined;
  const nextSession = currentKey ? sessionFor(currentKey) : undefined;

  return (
    <div className="lp">
      <main className="lp-center">
        <div className="lp-path">
          {LEVELS.map((level) => {
            const status = levelComplete(level) ? "done" : level.id === currentLevel.id ? "current" : "";
            const quests = TRACKS.filter((t) => t.from === level.id);
            return (
              <section key={level.id} className="lp-unit" aria-labelledby={`unit-${level.id}`}>
                <header className={`lp-banner ${status}`}>
                  <div className="lp-banner-text">
                    <small>
                      Level {level.level} · {level.when}
                    </small>
                    <h2 id={`unit-${level.id}`}>{level.title}</h2>
                    <p>{level.goal}</p>
                  </div>
                  <button className="lp-guide" onClick={() => setSheet(level.id)}>
                    {Icon.guide}
                    Guidebook
                  </button>
                </header>
                <div className="lp-road">
                  {level.items.map((item, i) => {
                    const key = itemKey(level.id, i);
                    const state = stateOf(key);
                    const questIndex = quests.findIndex((_, k) => QUEST_FIRST_STOP + k * QUEST_STOP_SPACING === i);
                    const quest = questIndex === -1 ? undefined : quests[questIndex];
                    return (
                      <div key={key} className="lp-stop">
                        <button
                          className={`lp-node ${state}`}
                          style={{ "--dx": `${windOffset(i)}px` } as React.CSSProperties}
                          aria-label={`${item}, ${state === "upcoming" ? "not done yet" : state}`}
                          aria-expanded={popover?.key === key}
                          onClick={(e) => openPopover(key, e.currentTarget)}
                        >
                          <span className="lip" />
                          <span className="face">{Icon[state]}</span>
                          {state === "current" && <span className="lp-bubble">Start</span>}
                        </button>
                        {quest && <SideQuest track={quest} side={windOffset(i) > 0 ? "left" : "right"} onOpen={setSheet} />}
                      </div>
                    );
                  })}
                  {quests
                    .filter((_, k) => QUEST_FIRST_STOP + k * QUEST_STOP_SPACING >= level.items.length)
                    .map((quest) => (
                      <div key={quest.id} className="lp-stop">
                        <SideQuest track={quest} side="right" onOpen={setSheet} />
                      </div>
                    ))}
                  <div className="lp-stop">
                    <button
                      className={`lp-node trophy ${levelComplete(level) ? "done" : "upcoming"}`}
                      style={{ "--dx": `${windOffset(level.items.length)}px` } as React.CSSProperties}
                      aria-label={`${level.short} trophy, ${levelComplete(level) ? "earned" : "not earned yet"}`}
                      onClick={() => setSheet(level.id)}
                    >
                      <span className="lip" />
                      <span className="face">{Icon.trophy}</span>
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <aside className="lp-side" aria-label="Progress">
        <section className="lp-card">
          <h3>Your progress</h3>
          <div className="lp-stats">
            <div>
              <b className="accent">{doneCount}</b>
              <span>of {totalTopics} topics</span>
            </div>
            <div>
              <b>{currentLevel.code}</b>
              <span>current level</span>
            </div>
            <div>
              <b className="gold">{trophies}</b>
              <span>trophies</span>
            </div>
          </div>
        </section>
        {currentKey && (
          <section className="lp-card lp-next">
            <small>Up next</small>
            <h3>{currentLevel.items[Number(currentKey.split(".")[1])]}</h3>
            {nextSession ? (
              <Link className="lp-cta go" href={sessionHref(nextSession)}>
                Start lesson
              </Link>
            ) : (
              <button className="lp-cta go" onClick={() => markDone(currentKey, null)}>
                I know this, mark done
              </button>
            )}
          </section>
        )}
        <section className="lp-card">
          <h3>Side quests</h3>
          <ul className="lp-quests">
            {TRACKS.map((t) => {
              const count = p.ready ? p.stageCount(t) : 0;
              return (
                <li key={t.id}>
                  <button onClick={() => setSheet(t.id)}>
                    <span className="lp-quest-code">{t.code}</span>
                    <span className="lp-quest-name">
                      <b>{t.short}</b>
                      <span className="lp-qbar">
                        <i style={{ width: `${(100 * count) / t.items.length}%` }} />
                      </span>
                    </span>
                    <span className="mono lp-quest-count">
                      {count}/{t.items.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>

      {popover && popoverStage && (
        <div className={`lp-pop${popoverState === "done" ? " is-done" : ""}`} style={{ left: popover.x, top: popover.y }} role="dialog" aria-label={popoverStage.items[popoverIndex]}>
          <small>
            {popoverStage.code} · {popoverStage.short}
          </small>
          <h3>{popoverStage.items[popoverIndex]}</h3>
          <p>
            Topic {popoverIndex + 1} of {popoverStage.items.length}
            {popoverState === "upcoming" && " · ahead of where you are"}
          </p>
          {popoverSession && (
            <Link className="lp-cta go" href={sessionHref(popoverSession)}>
              {popoverState === "done" ? "Review lesson" : "Start lesson"}
            </Link>
          )}
          {!popoverSession && popoverLane && (
            <Link className="lp-cta go" href="/course">
              Open the {LANES[popoverLane].name.toLowerCase()} lane
            </Link>
          )}
          {popoverState === "done" ? (
            !p.itemLocked(popover.key) && (
              <button className="lp-cta quiet" onClick={() => p.toggleItem(popover.key)}>
                Mark as not done
              </button>
            )
          ) : (
            <button className={`lp-cta ${popoverSession || popoverLane ? "quiet" : "go"}`} onClick={() => markDone(popover.key, document.querySelector(`[aria-expanded="true"]`))}>
              {popoverState === "current" ? "I know this, mark done" : "I already know this"}
            </button>
          )}
          {!popoverSession && !popoverLane && <p className="lp-soon">The full lesson for this topic is being written.</p>}
        </div>
      )}

      <StageSheet id={sheet} onClose={closeSheet} onOpen={setSheet} />
    </div>
  );
}
