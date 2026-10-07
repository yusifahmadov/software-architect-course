import { isValidElement, type ReactElement, type ReactNode } from "react";
import { GoCode } from "../GoCode";

const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

export function H2({ children }: { children?: ReactNode }) {
  const id = slugify(textOf(children));
  return (
    <h2 id={id}>
      <a href={`#${id}`} className="anchor" aria-hidden="true" tabIndex={-1}>
        #
      </a>
      {children}
    </h2>
  );
}

export function H3({ children }: { children?: ReactNode }) {
  return <h3 id={slugify(textOf(children))}>{children}</h3>;
}

export function Pre({ children }: { children?: ReactNode }) {
  const code = children as ReactElement<{ className?: string; children?: ReactNode }>;
  const lang = /language-(\w+)/.exec(code?.props?.className ?? "")?.[1] ?? "text";
  let src = textOf(code?.props?.children).replace(/\n$/, "");
  let label: string | undefined;
  const first = /^(?:\/\/|--|#)\s*file:\s*(.+)\n/.exec(src);
  if (first) {
    label = first[1].trim();
    src = src.slice(first[0].length);
  }
  return <GoCode code={src} lang={lang} label={label} />;
}

const CALLOUT_LABEL = {
  note: "Note",
  tip: "Tip",
  pitfall: "Pitfall",
  architect: "Architect's lens",
  deep: "Going deeper",
} as const;

export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: keyof typeof CALLOUT_LABEL;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <aside className={`callout callout-${kind}`}>
      <p className="callout-label">{title ?? CALLOUT_LABEL[kind]}</p>
      <div className="callout-body">{children}</div>
    </aside>
  );
}

export function Diagram({ caption, children }: { caption?: string; children?: ReactNode }) {
  return (
    <figure className="diagram">
      <pre>{textOf(children).replace(/^\n/, "").replace(/\n\s*$/, "")}</pre>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

const LEVEL_LABEL = { "warm-up": "Warm-up", core: "Core", stretch: "Stretch" } as const;

export function Exercise({
  title,
  level = "core",
  children,
}: {
  title: string;
  level?: keyof typeof LEVEL_LABEL;
  children?: ReactNode;
}) {
  return (
    <section className={`exercise-card ex-${level}`}>
      <header>
        <span className="ex-level">{LEVEL_LABEL[level]}</span>
        <h4>{title}</h4>
      </header>
      {children}
    </section>
  );
}

export function Hint({ children }: { children?: ReactNode }) {
  return (
    <details className="reveal">
      <summary>Show a hint</summary>
      <div>{children}</div>
    </details>
  );
}

export function Solution({ children }: { children?: ReactNode }) {
  return (
    <details className="reveal solution">
      <summary>Show a worked solution</summary>
      <div>{children}</div>
    </details>
  );
}

export function Recap({ children }: { children?: ReactNode }) {
  return (
    <section className="recap">
      <p className="callout-label">Remember this</p>
      {children}
    </section>
  );
}

export function Term({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <div className="term">
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function Terms({ children }: { children?: ReactNode }) {
  return <dl className="terms">{children}</dl>;
}
