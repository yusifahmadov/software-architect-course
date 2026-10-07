import type { MDXComponents } from "mdx/types";
import { Callout, Diagram, Exercise, H2, H3, Hint, Pre, Recap, Solution, Term, Terms } from "@/components/mdx/Teach";
import { Quiz } from "@/components/mdx/Quiz";

const components: MDXComponents = {
  h2: H2,
  h3: H3,
  pre: Pre,
  Callout,
  Diagram,
  Exercise,
  Hint,
  Solution,
  Recap,
  Term,
  Terms,
  Quiz,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
