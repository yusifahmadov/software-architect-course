"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export function SessionComplete({ itemKey }: { itemKey: string }) {
  const p = useProgress();
  const done = p.ready && p.itemDone(itemKey);
  const locked = p.ready && p.itemLocked(itemKey);

  return (
    <section className={done ? "complete is-done" : "complete"}>
      <div>
        <b>{done ? "Lesson complete" : "Finished the lesson?"}</b>
        <p>
          {done
            ? "This item is ticked on your roadmap."
            : "Mark it done once you've passed the quiz and finished at least the core exercise."}
        </p>
      </div>
      {locked ? (
        <span className="mono">Ticked by the Go course</span>
      ) : (
        <button className={done ? "btn" : "btn primary"} onClick={() => p.toggleItem(itemKey)}>
          {done ? "Mark as not done" : "Mark lesson done"}
        </button>
      )}
      {done && (
        <Link href="/#roadmap" className="text-btn">
          See it on the roadmap
        </Link>
      )}
    </section>
  );
}
