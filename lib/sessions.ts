import { STAGES, findStage } from "./roadmap";

export type SessionRef = { key: string; stage: string; index: number; slug: string; title: string };

const WRITTEN: Record<string, { slug: string; title: string }> = {
  "l0.5": { slug: "how-the-web-works", title: "How the web works: from a URL to a response" },
};

export const SESSIONS: SessionRef[] = Object.entries(WRITTEN)
  .map(([key, v]) => {
    const [stage, i] = key.split(".");
    return { key, stage, index: Number(i), ...v };
  })
  .sort((a, b) => {
    const sa = STAGES.findIndex((s) => s.id === a.stage);
    const sb = STAGES.findIndex((s) => s.id === b.stage);
    return sa - sb || a.index - b.index;
  });

export const sessionFor = (key: string) => SESSIONS.find((s) => s.key === key);

export const sessionBySlug = (stage: string, slug: string) =>
  SESSIONS.find((s) => s.stage === stage && s.slug === slug);

export const sessionHref = (s: SessionRef) => `/learn/${s.stage}/${s.slug}`;

export const sessionsInStage = (stage: string) => SESSIONS.filter((s) => s.stage === stage);

export const stageOf = (s: SessionRef) => findStage(s.stage)!;

export type SessionMeta = {
  summary: string;
  minutes: number;
  outcomes: string[];
};

export async function loadSession(s: SessionRef) {
  const mod = (await import(`@/content/${s.stage}/${s.slug}.mdx`)) as {
    default: React.ComponentType;
    meta: SessionMeta;
  };
  return mod;
}
