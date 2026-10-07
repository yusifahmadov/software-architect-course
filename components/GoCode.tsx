const KEYWORDS = new Set(
  "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false".split(
    " ",
  ),
);

const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)/gm;

export function highlight(src: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(src.slice(last, i));
    const [text, com, str, num, fn, word] = m;
    const cls = com ? "tk-com" : str ? "tk-str" : num ? "tk-num" : fn && !KEYWORDS.has(fn) ? "tk-fn" : KEYWORDS.has(fn ?? word) ? "tk-kw" : "";
    out.push(cls ? <span key={i} className={cls}>{text}</span> : text);
    last = i + text.length;
  }
  out.push(src.slice(last));
  return out;
}

const LANG_NAMES: Record<string, string> = {
  go: "Go", sh: "Shell", bash: "Shell", sql: "SQL", http: "HTTP", text: "Text", json: "JSON", yaml: "YAML", diff: "Diff",
};

export function GoCode({ code, label, lang = "go" }: { code: string; label?: string; lang?: string }) {
  return (
    <figure className="code">
      <figcaption className="code-bar">
        <span>{label ?? ""}</span>
        <span>{LANG_NAMES[lang] ?? lang}</span>
      </figcaption>
      <pre>
        <code>{lang === "go" ? highlight(code) : code}</code>
      </pre>
    </figure>
  );
}
