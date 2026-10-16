import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getMonthCalendarDays,
  isSameCalendarDate,
  matchesTaskFilter,
} from "../lib/workflow.ts";

test("month calendar includes every day, including six-week months and leap days", () => {
  for (let year = 2024; year <= 2028; year++)
    for (let month = 0; month < 12; month++) {
      const days = getMonthCalendarDays(new Date(year, month, 1));
      const count = new Date(year, month + 1, 0).getDate();
      assert.equal(days.length % 7, 0);
      assert.equal(days[0].getDay(), 0);
      for (let day = 1; day <= count; day++)
        assert.ok(
          days.some((value) =>
            isSameCalendarDate(value, new Date(year, month, day)),
          ),
          `${year}-${month + 1}-${day}`,
        );
    }
});

test("My Tasks only returns assignments for the current user", () => {
  const task = { assignedStaff: "alice@example.invalid", status: "Approved" };
  assert.equal(
    matchesTaskFilter(task, "My Tasks", "alice@example.invalid"),
    true,
  );
  assert.equal(
    matchesTaskFilter(task, "My Tasks", "bob@example.invalid"),
    false,
  );
  assert.equal(
    matchesTaskFilter(
      { ...task, assignedStaff: "Unassigned" },
      "My Tasks",
      "alice@example.invalid",
    ),
    false,
  );
});

test("persisted ISO timestamps survive Today filtering and exclude adjacent dates", () => {
  const now = new Date(2026, 9, 16, 12);
  const task = {
    assignedStaff: "Unassigned",
    status: "Approved",
    dueAt: new Date(2026, 9, 16, 16).toISOString(),
  };
  assert.equal(
    matchesTaskFilter(
      JSON.parse(JSON.stringify(task)),
      "Today's Tasks",
      "",
      now,
    ),
    true,
  );
  assert.equal(
    matchesTaskFilter(
      { ...task, dueAt: new Date(2026, 9, 17, 0).toISOString() },
      "Today's Tasks",
      "",
      now,
    ),
    false,
  );
});

test("overdue derives from time and excludes finished or undated tasks", () => {
  const now = new Date(2026, 9, 16, 12);
  const task = {
    assignedStaff: "Unassigned",
    status: "Approved",
    dueAt: new Date(2026, 9, 15).toISOString(),
  };
  assert.equal(matchesTaskFilter(task, "Overdue", "", now), true);
  for (const status of ["Completed", "Cancelled"])
    assert.equal(
      matchesTaskFilter({ ...task, status }, "Overdue", "", now),
      false,
    );
  assert.equal(
    matchesTaskFilter({ ...task, dueAt: undefined }, "Overdue", "", now),
    false,
  );
});
