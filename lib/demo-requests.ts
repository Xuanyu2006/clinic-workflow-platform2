export const demoTeamSizes = [
  "1–5 people",
  "6–20 people",
  "21–50 people",
  "51+ people",
  "Not sure yet",
];
export const demoInterests = ["Scheduling", "Team messages", "Tasks"];

export type DemoRequest = {
  requestId: string;
  name: string;
  email: string;
  clinic: string;
  teamSize: string;
  interests: string[];
};

export function validateDemoRequest(value: unknown): DemoRequest | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof data[key] === "string" && data[key].trim().length <= max
      ? data[key].trim()
      : "";
  const name = text("name", 100),
    email = text("email", 254).toLowerCase(),
    clinic = text("clinic", 150);
  const requestId = text("requestId", 36),
    teamSize = text("teamSize", 30);
  if (
    !name ||
    !clinic ||
    /[\r\n\x00-\x1f]/.test(name + clinic) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requestId,
    ) ||
    !demoTeamSizes.includes(teamSize)
  )
    return null;
  if (
    !Array.isArray(data.interests) ||
    data.interests.length > 3 ||
    data.interests.some(
      (item) => typeof item !== "string" || !demoInterests.includes(item),
    )
  )
    return null;
  return {
    requestId,
    name,
    email,
    clinic,
    teamSize,
    interests: [...new Set(data.interests as string[])],
  };
}
