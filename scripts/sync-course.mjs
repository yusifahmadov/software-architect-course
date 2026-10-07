import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const SOURCE = "index.html";
const TARGET = "lib/course.ts";

const html = readFileSync(SOURCE, "utf8");
const appScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes("const N=["));
if (!appScript) throw new Error(`No course data found in ${SOURCE}`);

const inertReact = { createElement: () => null, useState: (v) => [v, () => {}], useEffect: () => {} };
const sandbox = {
  React: inertReact,
  ReactDOM: { createRoot: () => ({ render: () => {} }) },
  document: { getElementById: () => null },
  localStorage: { getItem: () => null, setItem: () => {} },
  globalThis: {},
};
vm.runInNewContext(`${appScript}\n;globalThis.course = { N, QZ, TT, CK };`, sandbox);
const { N: rawLessons, QZ: questionBanks, TT: laneInfo, CK: laneForItem } = sandbox.globalThis.course;

const commentFreeCode = {
  g2: (code) => code.replace("fmt.Println(total) // 9", "fmt.Println(total)"),
  g4: (code) => code.replace('fmt.Println("missing", age) // missing 0', 'fmt.Println("missing", age)'),
  c1: () => 'const dependencies = `\napi -> auth\napi -> db\nauth -> db\n`\n\nconst wantStartOrder = "db, auth, api"',
};

const toQuestion = ([question, options, answer, why]) => ({ question, options, answer, why });

const lessons = rawLessons.map((l) => {
  const rewrite = commentFreeCode[l.id];
  const code = rewrite ? rewrite(l.code) : l.code;
  if (/(^|\s)\/\/\s/m.test(code)) throw new Error(`Lesson ${l.id} code still has a comment; add it to commentFreeCode`);
  return {
    id: l.id,
    lane: l.tr,
    title: l.t,
    requires: l.pre,
    text: l.tx,
    code,
    quiz: (questionBanks[l.id] ?? [l.q]).map(toQuestion),
    exercise: l.ex,
  };
});

const capstone = lessons.find((l) => l.id.startsWith("c"));
const lanes = Object.fromEntries(Object.entries(laneInfo).map(([id, [name, blurb]]) => [id, { name, blurb }]));
const laneIds = Object.keys(lanes);
const json = (value) => JSON.stringify(value, null, 2);

const output = `export type LaneId = ${laneIds.map((id) => JSON.stringify(id)).join(" | ")};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  why: string;
};

export type Lesson = {
  id: string;
  lane: LaneId;
  title: string;
  requires: string[];
  text: string;
  code: string;
  quiz: QuizQuestion[];
  exercise: string;
};

export const LANE_ORDER: LaneId[] = ${json(laneIds)};

export const LANES: Record<LaneId, { name: string; blurb: string }> = ${json(lanes)};

export const CAPSTONE_ID = ${JSON.stringify(capstone?.id ?? "")};

export const LANE_FOR_ROADMAP_ITEM: Record<string, LaneId> = ${json(laneForItem)};

export const QUIZ_PASS_RATIO = 0.8;

export const LESSONS: Lesson[] = ${json(lessons)};
`;

writeFileSync(TARGET, output);
const questionCount = lessons.reduce((n, l) => n + l.quiz.length, 0);
console.log(`${TARGET}: ${lessons.length} lessons, ${laneIds.length} lanes, ${questionCount} quiz questions`);
