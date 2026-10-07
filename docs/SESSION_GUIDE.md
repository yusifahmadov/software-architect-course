# Writing a lesson

Every item on the roadmap gets one lesson. A lesson is one MDX file at
`content/<stage>/<slug>.mdx` (for example `content/l0/how-the-web-works.mdx`).
The page around it (title, breadcrumb, table of contents, "mark done" button,
previous/next links) is rendered by the app. You write only the body.

## Who is reading

Someone who can already write a little code and wants to become a software
architect. Assume they have **never studied this topic properly**. They may
have used it ("I've typed `git commit` a thousand times") without knowing how
it works. Our job is to make it click, not to list facts.

## What "deep and understandable" means here

1. **Why before how.** Open with the problem the idea solves. If the reader
   doesn't feel the problem, the solution is trivia.
2. **Build the mental model first.** One clear picture (usually a `<Diagram>`)
   that the rest of the lesson keeps coming back to.
3. **Climb in small steps.** Each section adds one idea on top of the last.
   Never introduce two new concepts in the same paragraph.
4. **Concrete, then general.** Show a specific example with real values, then
   name the general rule. Not the other way round.
5. **Show it running.** Go code the reader can paste and run, with the real
   output printed underneath. Walk through anything non-obvious line by line.
6. **Name the traps.** The mistakes people actually make, why they happen, and
   what the fix looks like in code.
7. **Connect upward.** How an architect uses this later (which later level or
   decision it feeds). This is a roadmap to architecture; every lesson should
   say why the architect cares.
8. **Make them do it.** Quiz for understanding, exercises for skill.

Analogies are welcome when they are precise. Say where the analogy breaks.

## Length and time

- 3,500 to 6,000 words of prose, not counting code.
- `minutes` in `meta` is an honest estimate for reading plus the warm-up and
  core exercises. Most lessons land between 35 and 70.

## Structure

Use these `##` sections, in this order. Headings are sentence case. Inside the
deep-dive part, choose your own `##` titles (3 to 6 of them), and use `###` for
sub-steps.

1. `## Why this matters`: a concrete situation where not knowing this hurts.
2. `## The mental model`: the one picture to keep in your head, with a `<Diagram>`.
3. **Deep-dive sections** (your titles): the substance, built step by step,
   with Go code throughout.
4. `## Common mistakes`: 3 to 6 traps. Use `<Callout kind="pitfall">` or
   wrong/right code pairs.
5. `## How architects use this`: inside a `<Callout kind="architect">` or as
   prose plus one callout. Tie it to concrete later decisions.
6. `## Check yourself`: one `<Quiz>` with 6 to 8 questions.
7. `## Practice`: three `<Exercise>` blocks: `warm-up`, `core`, `stretch`.
   Each has a `<Hint>` and a `<Solution>`. Coding exercises get a complete,
   compiling Go solution.
8. `## Recap`: one `<Recap>` holding a 5 to 8 item bullet list.
9. `## Go further`: a short list of resources. Prefer the level's reading
   list and official docs (go.dev, pkg.go.dev, git-scm.com, postgresql.org,
   developer.mozilla.org, RFCs by number). Never invent a URL. If unsure of an
   exact URL, name the resource without linking.

Do not write an `#` (h1). The page already shows the title.

## The file

```mdx
export const meta = {
  summary: "One or two sentences on what this lesson gives you.",
  minutes: 50,
  outcomes: [
    "Explain ... in your own words",
    "Write a Go program that ...",
    "Spot ... in a code review",
  ],
};

## Why this matters

Prose...
```

`outcomes` has 3 to 5 items, each starting with a verb.

## Components

All are available without importing.

| Component | Use |
| --- | --- |
| `<Callout kind="note" \| "tip" \| "pitfall" \| "architect" \| "deep" title="optional">…</Callout>` | Asides. `deep` is for optional "how it really works" detail. |
| `<Diagram caption="…">{`…`}</Diagram>` | Box-drawing diagrams in monospace. The drawing goes inside a template literal. |
| `<Terms>` with `<Term name="…">meaning</Term>` children | A small glossary when a section introduces several terms. |
| `<Quiz questions={[{ q, options, answer, why }]} />` | `answer` is the 0-based index. `why` explains the right answer. |
| `<Exercise title="…" level="warm-up" \| "core" \| "stretch">…</Exercise>` | Contains the task, then `<Hint>` and `<Solution>`. |
| `<Hint>…</Hint>`, `<Solution>…</Solution>` | Collapsed until clicked. Markdown and code fences work inside. |
| `<Recap>…</Recap>` | Wrap a bullet list. |

Code fences: use a language tag: `go`, `sh`, `sql`, `http`, `text`, `json`,
`yaml`, `diff`. To caption a block with a file name, make the first line
`// file: main.go` (Go), `-- file: schema.sql` (SQL) or `# file: run.sh` (shell).
That line is removed and shown in the code panel header.

Diagrams: draw with box characters (`┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼ → ← ↑ ↓ ▶`).
Keep them under 72 columns so they fit on a laptop without scrolling. Inside
the template literal, do not use backticks or `${`.

## MDX gotchas (these break the build)

- In prose, a bare `{`, `}`, `<` or `>` is parsed as JSX. Put code-ish text in
  inline code: `` `map[string]int{}` ``, `` `a < b` ``. Write "less than" in
  prose if needed.
- No HTML comments `<!-- -->`. Use `{/* comment */}` if you must.
- Inside JSX props (Quiz questions), strings are JavaScript: escape quotes,
  or use the other quote style. Keep inline code in options as plain text
  with backtick characters inside a double-quoted string, for example
  `"Use \`go vet\` first"` is fine.
- Blank line before and after every component, list, table and code fence.
- Content inside `<Hint>`, `<Solution>`, `<Callout>`, `<Exercise>` must start
  on a new line after the opening tag (with a blank line) for markdown to be
  parsed.

Check your file compiles:

```sh
node scripts/check-mdx.mjs content/l0/your-slug.mdx
```

## Go code rules

- Go 1.22 or newer idioms: `for i := range n`, `min`/`max`, the `slices` and
  `maps` packages, generics where they genuinely help, `errors.Is/As`, `%w`.
  Standard library first. If a lesson truly needs a third-party module, say
  so and show `go get`.
- **Every complete program must compile and run.** Put each one in
  `.scratch/<slug>/<name>/main.go` (with its own `go mod init` if needed),
  run `go vet` and `go run .` (or `go test`), and paste the **real** output
  into the lesson as a `text` block.
- Fragments (no `package` line) must still be valid Go if wrapped in a
  function or file; check them the same way by wrapping.
- Prefer small, complete programs over huge ones. 10 to 60 lines each.
- **No comments in code.** Code must explain itself: descriptive names for
  variables, functions and types, small named helpers instead of numbered
  steps, named constants instead of magic numbers. Every explanation belongs
  in the prose around the block. Wrong/right pairs are labelled in the prose
  ("This version leaks connections:" then the block), never with a `// wrong`
  comment. The only allowed comment is the `// file: name` caption line, which
  the site strips before display.
- gofmt style, but indent code blocks with two spaces instead of tabs so
  they read well on the page.

## Voice

- Plain, direct, second person. Short paragraphs (2 to 4 sentences).
- Sentence case for headings.
- No em dashes or en dashes. Use commas, colons, parentheses or full stops.
- No hype or filler: avoid "powerful", "seamless", "robust", "dive in",
  "unlock", "leverage", "in today's world", "let's explore".
- Be exact. If something changed in a specific version, name the version.
  Do not invent statistics, quotes, benchmarks or URLs. If you state a number,
  it comes from running code or from a source you name.
- Refer to other lessons by their title, in plain text. Don't link to lesson
  pages that may not exist.

## Before you hand it in

- [ ] `node scripts/check-mdx.mjs <file>` passes.
- [ ] Every Go program in the file was run, and the output shown is real.
- [ ] All nine sections are present, in order.
- [ ] Quiz has 6 to 8 questions that test understanding, with plausible wrong answers.
- [ ] Exercises have hints and full solutions.
- [ ] No em dashes, no hype words, no invented links.
