"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { COURSE_LINKED, LEVELS, type Stage } from "./roadmap";
import { CAPSTONE_ID, LESSONS, type Lesson } from "./course";

const ROADMAP_KEY = "sar-progress-v2";
const COURSE_KEY = "arch-l0-v1";

type Flags = Record<string, boolean>;

const load = (key: string): Flags => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") ?? {};
  } catch {
    return {};
  }
};

const save = (key: string, value: Flags) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

type Progress = {
  ready: boolean;
  itemDone: (key: string) => boolean;
  itemLocked: (key: string) => boolean;
  toggleItem: (key: string) => void;
  stageCount: (s: Stage) => number;
  levelFraction: number;
  currentLevel: number;
  lessonDone: (l: Lesson) => boolean;
  lessonOpen: (l: Lesson) => boolean;
  quizPassed: (id: string) => boolean;
  passQuiz: (id: string) => void;
  exerciseDone: (id: string) => boolean;
  setExercise: (id: string, done: boolean) => void;
  lessonsDone: number;
  resetRoadmap: () => void;
  resetCourse: () => void;
};

const Ctx = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [roadmap, setRoadmap] = useState<Flags>({});
  const [course, setCourse] = useState<Flags>({});

  useEffect(() => {
    setRoadmap(load(ROADMAP_KEY));
    setCourse(load(COURSE_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(ROADMAP_KEY, roadmap);
  }, [ready, roadmap]);

  useEffect(() => {
    if (ready) save(COURSE_KEY, course);
  }, [ready, course]);

  const value = useMemo<Progress>(() => {
    const byId = (id: string) => LESSONS.find((l) => l.id === id)!;
    const lessonDone = (l: Lesson) => !!(course["q" + l.id] && course["e" + l.id]);
    const laneDone = (lane: "go" | "ds") =>
      LESSONS.filter((l) => l.lane === lane && l.id !== CAPSTONE_ID).every(lessonDone);
    const itemLocked = (key: string) => (COURSE_LINKED[key] ? laneDone(COURSE_LINKED[key]) : false);
    const itemDone = (key: string) => !!roadmap[key] || itemLocked(key);
    const stageCount = (s: Stage) => s.items.filter((_, i) => itemDone(`${s.id}.${i}`)).length;

    const total = LEVELS.reduce((n, s) => n + s.items.length, 0);
    const done = LEVELS.reduce((n, s) => n + stageCount(s), 0);

    return {
      ready,
      itemDone,
      itemLocked,
      stageCount,
      levelFraction: total ? done / total : 0,
      currentLevel: (() => {
        const i = LEVELS.findIndex((l) => stageCount(l) < l.items.length);
        return i === -1 ? LEVELS.length - 1 : i;
      })(),
      lessonDone,
      lessonOpen: (l) => l.requires.every((id) => lessonDone(byId(id))),
      quizPassed: (id) => !!course["q" + id],
      exerciseDone: (id) => !!course["e" + id],
      lessonsDone: LESSONS.filter(lessonDone).length,
      toggleItem: () => {},
      passQuiz: () => {},
      setExercise: () => {},
      resetRoadmap: () => {},
      resetCourse: () => {},
    };
  }, [ready, roadmap, course]);

  const toggleItem = useCallback(
    (key: string) =>
      setRoadmap((r) => {
        const next = { ...r };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      }),
    [],
  );
  const passQuiz = useCallback((id: string) => setCourse((c) => ({ ...c, ["q" + id]: true })), []);
  const setExercise = useCallback(
    (id: string, done: boolean) => setCourse((c) => ({ ...c, ["e" + id]: done })),
    [],
  );
  const resetRoadmap = useCallback(() => setRoadmap({}), []);
  const resetCourse = useCallback(() => setCourse({}), []);

  const full = useMemo(
    () => ({ ...value, toggleItem, passQuiz, setExercise, resetRoadmap, resetCourse }),
    [value, toggleItem, passQuiz, setExercise, resetRoadmap, resetCourse],
  );

  return <Ctx.Provider value={full}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
