"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS } from "@/lib/roadmap";
import { useProgress } from "@/lib/progress";
import { BOUNDS, GAP, HUB_R, LEVEL_NODES, TRACK_NODES, branchPath, type Node } from "@/lib/graph";

type View = { x: number; y: number; k: number };
type Tip = { x: number; y: number; text: string; done: boolean } | null;

const MIN_K = 0.35;
const MAX_K = 2.4;
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

export function RoadmapGraph({ onOpen }: { onOpen: (id: string) => void }) {
  const p = useProgress();
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 0.5 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip>(null);
  const touched = useRef(false);
  const drag = useRef<{ px: number; py: number; vx: number; vy: number; moved: boolean } | null>(null);

  const focus = useRef(0);
  focus.current = p.ready ? p.currentLevel : 0;

  const fit = useCallback((w: number, h: number) => {
    const bw = BOUNDS.x1 - BOUNDS.x0;
    const bh = BOUNDS.y1 - BOUNDS.y0;
    const k = Math.min(w / bw, h / bh) * 0.96;
    if (k < 0.45) {
      const at = LEVEL_NODES[focus.current].at;
      const z = 0.8;
      setView({ k: z, x: w / 2 - at.x * z, y: h / 2 - at.y * z });
      return;
    }
    setView({ k, x: (w - bw * k) / 2 - BOUNDS.x0 * k, y: (h - bh * k) / 2 - BOUNDS.y0 * k });
  }, []);

  useEffect(() => {
    if (p.ready && !touched.current && size.w) fit(size.w, size.h);
  }, [p.ready]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = (w: number, h: number) => {
      setSize({ w, h });
      if (!touched.current) fit(w, h);
    };
    measure(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(([e]) => measure(e.contentRect.width, e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    touched.current = true;
    setView((v) => {
      const k = clampK(v.k * factor);
      const f = k / v.k;
      return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
    });
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.004), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { px: e.clientX, py: e.clientY, vx: view.x, vy: view.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px, dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) {
      d.moved = true;
      touched.current = true;
      setTip(null);
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    }
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = () => {
    setTimeout(() => (drag.current = null), 0);
  };
  const open = (id: string) => {
    if (drag.current?.moved) return;
    onOpen(id);
  };

  const key = (id: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(id);
    }
  };

  const showTip = (node: Node, i: number) => {
    const s = node.satellites[i];
    setTip({
      x: view.x + s.x * view.k,
      y: view.y + s.y * view.k,
      text: node.stage.items[i],
      done: p.ready && p.itemDone(`${node.stage.id}.${i}`),
    });
  };

  const current = p.ready ? p.currentLevel : 0;

  const hub = (n: Node) => {
    const s = n.stage;
    const count = p.ready ? p.stageCount(s) : 0;
    const pct = (100 * count) / s.items.length;
    const done = p.ready && count === s.items.length;
    const isCurrent = n.kind === "level" && LEVELS[current]?.id === s.id;
    const ly = n.labelAbove ? n.at.y - n.ring - 30 : n.at.y + n.ring + 30;
    return (
      <g
        key={s.id}
        className={`node ${n.kind}${done ? " done" : ""}${hot === s.id ? " hot" : ""}`}
        onMouseEnter={() => setHot(s.id)}
        onMouseLeave={() => {
          setHot(null);
          setTip(null);
        }}
      >
        {n.satellites.map((pt, i) => (
          <line key={`s${i}`} className="spoke" x1={n.at.x} y1={n.at.y} x2={pt.x} y2={pt.y} />
        ))}
        <circle className="orbit" cx={n.at.x} cy={n.at.y} r={n.ring} />
        {n.satellites.map((pt, i) => {
          const on = p.ready && p.itemDone(`${s.id}.${i}`);
          return (
            <circle
              key={`d${i}`}
              className={on ? "sat on" : "sat"}
              cx={pt.x}
              cy={pt.y}
              r={5}
              onMouseEnter={() => showTip(n, i)}
              onMouseLeave={() => setTip(null)}
              onClick={() => open(s.id)}
            />
          );
        })}

        <g
          className="hub"
          role="button"
          tabIndex={0}
          aria-label={`${s.code} ${s.title}. ${count} of ${s.items.length} done.${isCurrent ? " You are here." : ""}`}
          onClick={() => open(s.id)}
          onKeyDown={key(s.id)}
          onFocus={() => setHot(s.id)}
          onBlur={() => setHot(null)}
        >
          {isCurrent && <circle className="here-pulse" cx={n.at.x} cy={n.at.y} r={n.hubR + 6} />}
          <circle className="hub-core" cx={n.at.x} cy={n.at.y} r={n.hubR} />
          <circle className="hub-track" cx={n.at.x} cy={n.at.y} r={n.hubR + 5} />
          <circle
            className="hub-progress"
            cx={n.at.x}
            cy={n.at.y}
            r={n.hubR + 5}
            pathLength={100}
            strokeDasharray={`${pct} 100`}
            transform={`rotate(-90 ${n.at.x} ${n.at.y})`}
          />
          <text className="hub-code" x={n.at.x} y={n.at.y + 4} textAnchor="middle">
            {s.code}
          </text>
          <text className="hub-name" x={n.at.x} y={ly} textAnchor="middle">
            {s.short}
          </text>
          <text className="hub-meta" x={n.at.x} y={ly + 17} textAnchor="middle">
            {count}/{s.items.length}
            {n.kind === "level" ? ` · ${(s as (typeof LEVELS)[number]).when}` : ""}
          </text>
          {isCurrent && (
            <g className="here-chip" transform={`translate(${n.at.x} ${n.at.y - n.ring - 22})`}>
              <rect x={-38} y={-12} width={76} height={22} rx={11} />
              <text y={3} textAnchor="middle">
                You are here
              </text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div
      ref={box}
      className={hot ? "graph has-hot" : "graph"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg width={size.w} height={size.h} role="group" aria-label="Roadmap graph: seven levels on a line, with seven tracks branching off.">
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {LEVEL_NODES.slice(0, -1).map((n, i) => {
            const s = n.stage;
            const frac = p.ready ? p.stageCount(s) / s.items.length : 0;
            const x0 = n.at.x + HUB_R + 6;
            const len = GAP - 2 * (HUB_R + 6);
            return (
              <g key={`e${i}`}>
                <line className="edge draw" x1={x0} y1={0} x2={x0 + len} y2={0} pathLength={1} style={{ animationDelay: `${i * 90}ms` }} />
                <line className="edge-lit" x1={x0} y1={0} x2={x0 + len} y2={0} strokeDasharray={`${frac * len} ${len}`} />
              </g>
            );
          })}
          {TRACK_NODES.map((t) => (
            <path key={`b${t.stage.id}`} className={hot === t.stage.id ? "branch hot" : "branch"} d={branchPath(t)} />
          ))}
          {TRACK_NODES.map(hub)}
          {LEVEL_NODES.map(hub)}
        </g>
      </svg>

      {tip && (
        <div className={tip.done ? "tip done" : "tip"} style={{ left: tip.x, top: tip.y }} role="tooltip">
          <span>{tip.done ? "Done" : "To learn"}</span>
          {tip.text}
        </div>
      )}

      <div className="graph-tools" onPointerDown={(e) => e.stopPropagation()}>
        <button aria-label="Zoom in" onClick={() => zoomAt(1.25, size.w / 2, size.h / 2)}>
          +
        </button>
        <button aria-label="Zoom out" onClick={() => zoomAt(0.8, size.w / 2, size.h / 2)}>
          −
        </button>
        <button
          className="fit"
          onClick={() => {
            touched.current = false;
            fit(size.w, size.h);
          }}
        >
          Reset
        </button>
      </div>
      <p className="graph-hint">Drag to pan · Ctrl or ⌘ + scroll to zoom · Click a node to open it</p>
    </div>
  );
}
