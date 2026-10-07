import { Fragment, type ReactNode } from "react";
import { GoCode } from "./GoCode";

type Block =
  | { kind: "heading"; text: string }
  | { kind: "code"; lang: string; code: string }
  | { kind: "paragraph"; text: string };

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split("\n");
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      flushParagraph();
      const body: string[] = [];
      while (++i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i]);
      blocks.push({ kind: "code", lang: fence[1] || "go", code: body.join("\n") });
    } else if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ kind: "heading", text: line.slice(3) });
    } else if (!line.trim()) {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return blocks;
}

function withInlineCode(text: string): ReactNode {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function RichText({ text }: { text: string }) {
  return (
    <div className="prose rich-text">
      {toBlocks(text).map((block, i) =>
        block.kind === "heading" ? (
          <h3 key={i}>{block.text}</h3>
        ) : block.kind === "code" ? (
          <GoCode key={i} code={block.code} lang={block.lang} />
        ) : (
          <p key={i}>{withInlineCode(block.text)}</p>
        ),
      )}
    </div>
  );
}
