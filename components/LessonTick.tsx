"use client";

import { useProgress } from "@/lib/progress";

export function LessonTick({ itemKey, n }: { itemKey: string; n: number }) {
  const p = useProgress();
  const done = p.ready && p.itemDone(itemKey);
  return (
    <span className={done ? "tick mono on" : "tick mono"} aria-label={done ? "Done" : undefined}>
      {done ? "✓" : n}
    </span>
  );
}
