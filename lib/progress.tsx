"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LEVELS, type Stage } from "./roadmap";
import { CAPSTONE_ID, LANE_FOR_ROADMAP_ITEM, LESSONS, type LaneId, type Lesson } from "./course";

const ROADMAP_KEY = "sar-progress-v2";
const COURSE_KEY = "arch-l0-v1";

type Flags = Record<string, boolean | number>;

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
  bestQuizPercent: (id: string) => number;
  recordQuiz: (id: string, percent: number, passed: boolean) => void;
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
    const laneDone = (lane: LaneId) =>
      LESSONS.filter((l) => l.lane === lane && l.id !== CAPSTONE_ID).every(lessonDone);
    const itemLocked = (key: string) => (LANE_FOR_ROADMAP_ITEM[key] ? laneDone(LANE_FOR_ROADMAP_ITEM[key]) : false);
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
      bestQuizPercent: (id) => Number(course["b" + id] ?? 0),
      exerciseDone: (id) => !!course["e" + id],
      lessonsDone: LESSONS.filter(lessonDone).length,
      toggleItem: () => {},
      recordQuiz: () => {},
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
  const recordQuiz = useCallback(
    (id: string, percent: number, passed: boolean) =>
      setCourse((c) => ({
        ...c,
        ["b" + id]: Math.max(Number(c["b" + id] ?? 0), percent),
        ...(passed ? { ["q" + id]: true } : {}),
      })),
    [],
  );
  const setExercise = useCallback(
    (id: string, done: boolean) => setCourse((c) => ({ ...c, ["e" + id]: done })),
    [],
  );
  const resetRoadmap = useCallback(() => setRoadmap({}), []);
  const resetCourse = useCallback(() => setCourse({}), []);

  const full = useMemo(
    () => ({ ...value, toggleItem, recordQuiz, setExercise, resetRoadmap, resetCourse }),
    [value, toggleItem, recordQuiz, setExercise, resetRoadmap, resetCourse],
  );

  return <Ctx.Provider value={full}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
