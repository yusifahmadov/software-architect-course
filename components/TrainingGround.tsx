"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CAPSTONE_ID, LANES, LESSONS, type Lesson } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { GoCode } from "./GoCode";

const KEYS = ["A", "B", "C", "D"];

function Waypoint({ lesson, n, selected, onPick }: { lesson: Lesson; n: string; selected: boolean; onPick: () => void }) {
  const p = useProgress();
  const done = p.lessonDone(lesson);
  const open = p.lessonOpen(lesson);
  const status = done ? "Done" : open ? (p.quizPassed(lesson.id) ? "Quiz passed" : "Ready") : "Locked";
  return (
    <li>
      <button className={done ? "wp done" : "wp"} disabled={!open} aria-current={selected} onClick={onPick}>
        <span className="blaze" aria-hidden="true">
          {done ? "✓" : n}
        </span>
        <span>
          {lesson.title}
          <small>{status}</small>
        </span>
      </button>
    </li>
  );
}

export function TrainingGround() {
  const p = useProgress();
  const [sel, setSel] = useState("g1");
  const [picked, setPicked] = useState<Record<string, number>>({});
  const panel = useRef<HTMLElement>(null);

  const lesson = LESSONS.find((l) => l.id === sel)!;
  const choice = picked[lesson.id];
  const passed = p.quizPassed(lesson.id);
  const capstone = LESSONS.find((l) => l.id === CAPSTONE_ID)!;

  useEffect(() => {
    if (p.ready && !p.lessonOpen(lesson)) setSel("g1");
  }, [p, lesson]);

  const pick = (id: string) => {
    setSel(id);
    if (window.matchMedia("(max-width: 920px)").matches) {
      requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const nextLesson = LESSONS.find((l) => !p.lessonDone(l) && p.lessonOpen(l) && l.id !== lesson.id);

  const lane = (key: "go" | "ds", prefix: string) => (
    <div className={`lane lane-${key}`}>
      <h3>
        <b>{LANES[key].path}</b>
        {LANES[key].name}
      </h3>
      <ol>
        {LESSONS.filter((l) => l.lane === key && l.id !== CAPSTONE_ID).map((l, i) => (
          <Waypoint key={l.id} lesson={l} n={`${prefix}${i + 1}`} selected={sel === l.id} onPick={() => pick(l.id)} />
        ))}
      </ol>
    </div>
  );

  return (
    <main className="wrap">
      <section className="hero">
        <p className="pill"><span className="dot" aria-hidden="true" />L0 Foundations · items 1 and 2</p>
        <h1>
          Go and data structures
          <br />
          <span className="dim-text">the hands-on course.</span>
        </h1>
      </section>

      <div className="course-grid">
        <aside className="trails" aria-label="Lessons">
          <p className="goal">
            Two paths, one capstone. Pass the quick check and finish the exercise to unlock the next lesson.
            Finishing a path ticks the matching Foundations item on the <Link href="/">roadmap</Link>.
          </p>
          <div className="meter" aria-hidden="true">
            {LESSONS.map((l) => (
              <i key={l.id} className={p.lessonDone(l) ? "on" : ""} />
            ))}
          </div>
          <p className="meter-label">
            {p.lessonsDone} of {LESSONS.length} lessons done
          </p>
          <div className="lanes">
            {lane("go", "G")}
            {lane("ds", "D")}
          </div>
          <ol className="capstone lane" style={{ listStyle: "none", padding: 0 }}>
            <Waypoint lesson={capstone} n="★" selected={sel === capstone.id} onPick={() => pick(capstone.id)} />
          </ol>
        </aside>

        <article className="lesson" ref={panel} aria-labelledby="lesson-title" key={lesson.id}>
          <p className="eyebrow">
            {lesson.id === CAPSTONE_ID ? "Capstone · needs both paths" : LANES[lesson.lane].path}
          </p>
          <h2 id="lesson-title">{lesson.title}</h2>
          <p>{lesson.text}</p>
          <GoCode code={lesson.code} label={`${lesson.id}.go`} />

          <h3>Quick check</h3>
          <p className="quiz-q">{lesson.quiz.question}</p>
          <div className="opts" role="group" aria-label="Answers">
            {lesson.quiz.options.map((o, i) => {
              const state = choice === undefined ? "" : i === lesson.quiz.answer && choice === i ? " right" : i === choice ? " wrong" : "";
              return (
                <button
                  key={`${i}-${choice === i ? "picked" : ""}`}
                  className={"opt" + state}
                  onClick={() => {
                    setPicked((m) => ({ ...m, [lesson.id]: i }));
                    if (i === lesson.quiz.answer) p.passQuiz(lesson.id);
                  }}
                >
                  <kbd>{KEYS[i]}</kbd>
                  {o}
                </button>
              );
            })}
          </div>
          <div aria-live="polite">
            {choice !== undefined &&
              (choice === lesson.quiz.answer ? (
                <p className="feedback">
                  <b>Correct.</b> {lesson.quiz.why}
                </p>
              ) : (
                <p className="feedback no">
                  <b>Not quite.</b> Try another answer.
                </p>
              ))}
            {choice === undefined && passed && (
              <p className="feedback">
                <b>Passed earlier.</b> {lesson.quiz.why}
              </p>
            )}
          </div>

          <h3>Exercise · write it in your own editor</h3>
          <p className="exercise">{lesson.exercise}</p>
          <label className="check">
            <input
              type="checkbox"
              checked={p.exerciseDone(lesson.id)}
              onChange={(e) => p.setExercise(lesson.id, e.target.checked)}
            />
            <span>I finished this exercise and it runs</span>
          </label>

          <div className="lesson-foot">
            <button
              className="text-btn"
              onClick={() => {
                if (confirm("Clear all course progress? Roadmap ticks you made yourself stay.")) {
                  p.resetCourse();
                  setPicked({});
                  setSel("g1");
                }
              }}
            >
              Reset course progress
            </button>
            {p.lessonDone(lesson) && nextLesson ? (
              <button className="next-btn" onClick={() => pick(nextLesson.id)}>
                Next: {nextLesson.title} →
              </button>
            ) : (
              <button className="next-btn" disabled>
                {p.lessonDone(lesson) ? "All open lessons done" : "Pass the check and finish the exercise"}
              </button>
            )}
          </div>
        </article>
      </div>
      <div style={{ height: 96 }} />
    </main>
  );
}
