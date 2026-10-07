import { LEVELS, TRACKS, type Stage } from "./roadmap";

export const GAP = 300;
export const HUB_R = 28;
export const TRACK_HUB_R = 22;
export const RING = 74;
export const TRACK_RING = 58;
const TRACK_DY = 250;

export type Pt = { x: number; y: number };

export type Node = {
  stage: Stage;
  kind: "level" | "track";
  at: Pt;
  ring: number;
  hubR: number;
  labelAbove: boolean;
  satellites: Pt[];
};

const SIDE: Record<string, 1 | -1> = { t1: -1, t2: 1, t3: 1, t4: 1, t5: -1, t6: -1, t7: -1 };

const round = (n: number) => Math.round(n * 100) / 100;

function ring(c: Pt, r: number, n: number): Pt[] {
  const step = (Math.PI * 2) / n;
  const gap = (start: number) => Math.min(...Array.from({ length: n }, (_, i) => Math.abs(Math.sin(start + i * step))));
  let start = -Math.PI / 2;
  for (let d = 0; d < 360; d++) {
    const s = -Math.PI / 2 + (d / 360) * step;
    if (gap(s) > gap(start) + 1e-9) start = s;
  }
  return Array.from({ length: n }, (_, i) => {
    const a = start + i * step;
    return { x: round(c.x + Math.cos(a) * r), y: round(c.y + Math.sin(a) * r) };
  });
}

export const LEVEL_NODES: Node[] = LEVELS.map((l) => {
  const at = { x: l.level * GAP, y: 0 };
  return { stage: l, kind: "level", at, ring: RING, hubR: HUB_R, labelAbove: false, satellites: ring(at, RING, l.items.length) };
});

export const TRACK_NODES: Node[] = TRACKS.map((t) => {
  const parent = LEVEL_NODES.find((n) => n.stage.id === t.from)!;
  const side = SIDE[t.id] ?? 1;
  const at = { x: parent.at.x + 34, y: side * TRACK_DY };
  return {
    stage: t,
    kind: "track",
    at,
    ring: TRACK_RING,
    hubR: TRACK_HUB_R,
    labelAbove: side < 0,
    satellites: ring(at, TRACK_RING, t.items.length),
  };
});

export const ALL_NODES = [...LEVEL_NODES, ...TRACK_NODES];

export function branchPath(t: Node) {
  const parent = LEVEL_NODES.find((n) => n.stage.id === (t.stage as { from?: string }).from)!;
  const a = parent.at, b = t.at;
  const sy = Math.sign(b.y);
  const y0 = a.y + sy * HUB_R;
  const y1 = b.y - sy * TRACK_HUB_R;
  const my = (y0 + y1) / 2;
  return `M${a.x} ${y0}C${a.x} ${my} ${b.x} ${my} ${b.x} ${y1}`;
}

export const BOUNDS = {
  x0: -RING - 60,
  x1: (LEVELS.length - 1) * GAP + RING + 90,
  y0: -TRACK_DY - TRACK_RING - 56,
  y1: TRACK_DY + TRACK_RING + 56,
};
