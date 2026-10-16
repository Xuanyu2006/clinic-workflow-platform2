export function isSameCalendarDate(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function getMonthCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function matchesTaskFilter(
  task: { assignedStaff: string; dueAt?: string; status: string },
  filter: string,
  email: string,
  now = new Date(),
) {
  if (filter === "My Tasks")
    return Boolean(email) && task.assignedStaff === email;
  if (filter === "Today's Tasks")
    return Boolean(task.dueAt && isSameCalendarDate(new Date(task.dueAt), now));
  if (filter === "Overdue")
    return Boolean(
      task.dueAt &&
      new Date(task.dueAt) < now &&
      !["Completed", "Cancelled"].includes(task.status),
    );
  if (filter === "Completed") return task.status === "Completed";
  return true;
}
