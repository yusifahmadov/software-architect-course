"use client";

import { useState } from "react";
import { QUIZ_PASS_RATIO, type Lesson } from "@/lib/course";
import { useProgress } from "@/lib/progress";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

export function QuizBank({ lesson }: { lesson: Lesson }) {
  const p = useProgress();
  const questions = lesson.quiz;
  const needed = Math.ceil(QUIZ_PASS_RATIO * questions.length);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredAll = Object.keys(answers).length === questions.length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const percent = Math.round((100 * correct) / questions.length);
  const passed = correct >= needed;
  const best = p.bestQuizPercent(lesson.id);

  const submit = () => {
    setSubmitted(true);
    p.recordQuiz(lesson.id, percent, passed);
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="quiz" aria-label="Quiz">
      <p className="quiz-rule">
        {questions.length} {questions.length === 1 ? "question" : "questions"} · {needed} correct to pass
        {best > 0 && <span className="mono"> · best {best}%</span>}
        {p.quizPassed(lesson.id) && <span className="accent"> · passed</span>}
      </p>
      {questions.map((q, i) => {
        const picked = answers[i];
        return (
          <div key={i} className="quiz-item">
            <p className="quiz-q">
              <span className="mono">{i + 1}.</span> {q.question}
            </p>
            <div className="opts" role="group" aria-label={`Answers to question ${i + 1}`}>
              {q.options.map((option, j) => {
                const state = !submitted
                  ? picked === j
                    ? " picked"
                    : ""
                  : j === q.answer
                    ? picked === j
                      ? " right"
                      : " reveal-right"
                    : picked === j
                      ? " wrong"
                      : "";
                return (
                  <button
                    key={j}
                    className={"opt" + state}
                    disabled={submitted}
                    aria-pressed={picked === j}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                  >
                    <kbd>{OPTION_KEYS[j]}</kbd>
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className={picked === q.answer ? "feedback" : "feedback no"}>
                <b>{picked === q.answer ? "Correct." : `The answer is ${OPTION_KEYS[q.answer]}.`}</b> {q.why}
              </p>
            )}
          </div>
        );
      })}
      <footer className="quiz-foot" aria-live="polite">
        {submitted ? (
          <>
            <span>
              <b className={passed ? "accent" : "danger"}>
                {correct}/{questions.length} ({percent}%)
              </b>{" "}
              {passed ? "Passed." : `You need ${needed} correct. Review the explanations and try again.`}
            </span>
            <button className="btn" onClick={retry}>
              Try again
            </button>
          </>
        ) : (
          <>
            <span className="mono">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            <button className="btn primary" disabled={!answeredAll} onClick={submit}>
              Check answers
            </button>
          </>
        )}
      </footer>
    </section>
  );
}
