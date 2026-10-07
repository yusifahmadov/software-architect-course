"use client";

import { useState } from "react";

export type Question = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

const KEYS = ["A", "B", "C", "D", "E"];

export function Quiz({ questions }: { questions: Question[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const right = questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <section className="quiz" aria-label="Check yourself">
      {questions.map((q, i) => {
        const p = picked[i];
        return (
          <div key={i} className="quiz-item">
            <p className="quiz-q">
              <span className="mono">{i + 1}.</span> {q.q}
            </p>
            <div className="opts" role="group" aria-label={`Answers to question ${i + 1}`}>
              {q.options.map((o, j) => {
                const state = p === undefined ? "" : j === q.answer ? (p === j ? " right" : " reveal-right") : j === p ? " wrong" : "";
                return (
                  <button
                    key={j}
                    className={"opt" + state}
                    disabled={p !== undefined}
                    onClick={() => setPicked((m) => ({ ...m, [i]: j }))}
                  >
                    <kbd>{KEYS[j]}</kbd>
                    {o}
                  </button>
                );
              })}
            </div>
            <div aria-live="polite">
              {p !== undefined && (
                <p className={p === q.answer ? "feedback" : "feedback no"}>
                  <b>{p === q.answer ? "Correct." : `Not quite, the answer is ${KEYS[q.answer]}.`}</b> {q.why}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <footer className="quiz-foot">
        <span className="mono">
          {answered === questions.length ? `${right}/${questions.length} correct` : `${answered}/${questions.length} answered`}
        </span>
        {answered > 0 && (
          <button className="text-btn" onClick={() => setPicked({})}>
            Try again
          </button>
        )}
      </footer>
    </section>
  );
}
