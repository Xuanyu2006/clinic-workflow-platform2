import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a demo",
  description:
    "Explore Med Base staff scheduling, team messages, and tasks in a fictional-data pilot. Request a walkthrough for your team.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
