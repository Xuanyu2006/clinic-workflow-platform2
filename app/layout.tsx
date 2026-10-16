import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Med Base | Staff Scheduling & Team Coordination",
    template: "%s | Med Base",
  },
  metadataBase: new URL("https://medbasehealth.com"),
  description:
    "Explore the Med Base fictional-data pilot for staff schedules, team messages, and reviewed follow-up tasks.",
  openGraph: {
    title: "Med Base",
    description:
      "Staff schedules, team messages, and reviewed follow-up tasks.",
    url: "https://medbasehealth.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
