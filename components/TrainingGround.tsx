"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CAPSTONE_ID, LANES, LANE_ORDER, LESSONS, type LaneId, type Lesson } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { GoCode } from "./GoCode";
import { QuizBank } from "./QuizBank";
import { RichText } from "./RichText";

const LANE_PREFIX: Record<LaneId, string> = { go: "G", ds: "D", al: "A" };
const capstone = LESSONS.find((l) => l.id === CAPSTONE_ID);
const lessonsInLane = (lane: LaneId) => LESSONS.filter((l) => l.lane === lane && l.id !== CAPSTONE_ID);
const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
const narrowScreen = () => window.matchMedia("(max-width: 920px)").matches;

function LessonButton({ lesson, label, selected, onPick }: { lesson: Lesson; label: string; selected: boolean; onPick: () => void }) {
  const p = useProgress();
  const done = p.lessonDone(lesson);
  const open = p.lessonOpen(lesson);
  const status = done ? "Done" : !open ? "Locked" : p.quizPassed(lesson.id) ? "Quiz passed" : "Ready";
  return (
    <li>
      <button className={done ? "wp done" : "wp"} disabled={!open} aria-current={selected} onClick={onPick}>
        <span className="blaze" aria-hidden="true">
          {done ? "✓" : label}
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
  const [selectedId, setSelectedId] = useState(LESSONS[0].id);
  const panel = useRef<HTMLElement>(null);
  const lesson = lessonById(selectedId) ?? LESSONS[0];

  useEffect(() => {
    if (p.ready && !p.lessonOpen(lesson)) setSelectedId(LESSONS[0].id);
  }, [p, lesson]);

  const pick = (id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ behavior: "smooth", block: narrowScreen() ? "start" : "nearest" }),
    );
  };

  const nextLesson = LESSONS.find((l) => !p.lessonDone(l) && p.lessonOpen(l) && l.id !== lesson.id);
  const capstoneNeeds = capstone?.requires.map((id) => lessonById(id)?.title).filter(Boolean).join(", ");

  return (
    <main className="wrap">
      <section className="hero">
        <p className="pill">
          <span className="dot" aria-hidden="true" />
          L0 Foundations · {LANE_ORDER.map((lane) => LANES[lane].name).join(", ")}
        </p>
        <h1>
          The Go course
          <br />
          <span className="dim-text">learn by building.</span>
        </h1>
      </section>

      <div className="course-grid">
        <aside className="trails" aria-label="Lessons">
          <p className="goal">
            Pass each quiz and finish the exercise to unlock the next lesson. Finishing a lane ticks the matching
            Foundations item on the <Link href="/">roadmap</Link>.
          </p>
          <div className="meter" aria-hidden="true">
            {LESSONS.map((l) => (
              <i key={l.id} className={p.lessonDone(l) ? "on" : ""} />
            ))}
          </div>
          <p className="meter-label">
            {p.lessonsDone} of {LESSONS.length} lessons done
          </p>

          {LANE_ORDER.map((lane) => (
            <section key={lane} className={`lane lane-${lane}`} aria-labelledby={`lane-${lane}`}>
              <h3 id={`lane-${lane}`}>
                <b>{LANES[lane].name}</b>
                {LANES[lane].blurb}
              </h3>
              <ol>
                {lessonsInLane(lane).map((l, i) => (
                  <LessonButton
                    key={l.id}
                    lesson={l}
                    label={`${LANE_PREFIX[lane]}${i + 1}`}
                    selected={l.id === lesson.id}
                    onPick={() => pick(l.id)}
                  />
                ))}
              </ol>
            </section>
          ))}

          {capstone && (
            <ol className="capstone lane">
              <LessonButton
                lesson={capstone}
                label="★"
                selected={capstone.id === lesson.id}
                onPick={() => pick(capstone.id)}
              />
            </ol>
          )}
        </aside>

        <article className="lesson" ref={panel} aria-labelledby="lesson-title" key={lesson.id}>
          <p className="eyebrow">
            {lesson.id === CAPSTONE_ID ? `Capstone · needs ${capstoneNeeds}` : LANES[lesson.lane].name}
          </p>
          <h2 id="lesson-title">{lesson.title}</h2>
          <RichText text={lesson.text} />
          <GoCode code={lesson.code} label={`${lesson.id}.go`} />

          <h3>Quiz</h3>
          <QuizBank lesson={lesson} />

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
                  setSelectedId(LESSONS[0].id);
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
                {p.lessonDone(lesson) ? "All open lessons done" : "Pass the quiz and finish the exercise"}
              </button>
            )}
          </div>
        </article>
      </div>
      <div style={{ height: 96 }} />
    </main>
  );
}
