import type { Metadata } from "next";
import { TrainingGround } from "@/components/TrainingGround";

export const metadata: Metadata = {
  title: "Go and data structures course · architect.go",
};

export default function CoursePage() {
  return <TrainingGround />;
}
