"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Role =
  | "Administrator"
  | "Physician"
  | "Nurse"
  | "Medical Assistant"
  | "Front Desk"
  | "Office Manager"
  | "Scheduler"
  | "Therapist";

type Module =
  | "Dashboard"
  | "Scheduling"
  | "Tasks"
  | "Messages"
  | "Communication"
  | "Analytics"
  | "Settings";

type TaskStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Overdue";

type Task = {
  id: string;
  title: string;
  description: string;
  assignedStaff: string;
  department: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  status: TaskStatus;
  notes: string;
  completionTimestamp: string;
};

type ScheduleEvent = {
  id: string;
  title: string;
  owner: string;
  day: string;
  time: string;
  type: "Clinic" | "SNF" | "Staff Shift" | "Admin";
};

type ChatMessage = {
  id: string;
  author: string;
  role: Role;
  text: string;
  time: string;
};

type TeamChat = {
  id: string;
  name: string;
  type: "Direct" | "Group";
  participants: string[];
  messages: ChatMessage[];
};

type SummarySuggestion = {
  title: string;
  description: string;
  priority: Task["priority"];
  responsibleRole: Role;
  dueDate: string;
};

const demoBanner = "Med Base Prototype - Demonstration Only - No Real Patient Data";

const roles: Role[] = [
  "Administrator",
  "Physician",
  "Nurse",
  "Medical Assistant",
  "Front Desk",
  "Office Manager",
  "Scheduler",
  "Therapist",
];

const rolePermissions: Record<Role, Module[]> = {
  Administrator: [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
    "Analytics",
    "Settings",
  ],
  Physician: ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
  Nurse: ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
  "Medical Assistant": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
  ],
  "Front Desk": ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
  "Office Manager": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
    "Analytics",
    "Settings",
  ],
  Scheduler: ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
  Therapist: ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
};

const departmentOptions = [
  "Front Desk",
  "Clinical Operations",
  "Scheduling",
  "Therapy",
  "SNF Coordination",
  "Administration",
];

const staffOnShift = [
  { name: "Demo Staff A", role: "Front Desk", shift: "7:30 AM - 4:00 PM" },
  { name: "Demo Staff B", role: "Scheduler", shift: "8:00 AM - 5:00 PM" },
  { name: "Demo Staff C", role: "Nurse", shift: "7:00 AM - 3:30 PM" },
  { name: "Demo Staff D", role: "Therapist", shift: "9:00 AM - 6:00 PM" },
];

const staffDirectory: { name: string; role: Role; department: string }[] = [
  { name: "Demo Physician", role: "Physician", department: "Clinical Operations" },
  { name: "Demo Nurse", role: "Nurse", department: "Clinical Operations" },
  { name: "Demo Medical Assistant", role: "Medical Assistant", department: "Clinic Support" },
  { name: "Demo Front Desk", role: "Front Desk", department: "Front Desk" },
  { name: "Demo Scheduler", role: "Scheduler", department: "Scheduling" },
  { name: "Demo Therapist", role: "Therapist", department: "Therapy" },
  { name: "Demo Office Manager", role: "Office Manager", department: "Administration" },
];

const todayAppointments = [
  {
    time: "8:30 AM",
    label: "Demo appointment A",
    location: "Outpatient Clinic",
    status: "Confirmed",
  },
  {
    time: "10:00 AM",
    label: "Demo appointment B",
    location: "SNF Wing",
    status: "Forms pending",
  },
  {
    time: "1:15 PM",
    label: "Demo appointment C",
    location: "Outpatient Clinic",
    status: "Reminder queued",
  },
];

const initialTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Confirm demo afternoon schedule",
    description: "Review open appointment slots and notify assigned staff.",
    assignedStaff: "Demo Staff B",
    department: "Scheduling",
    priority: "Medium",
    dueDate: "Today 11:30 AM",
    status: "In Progress",
    notes: "Operational coordination task only.",
    completionTimestamp: "",
  },
  {
    id: "TASK-002",
    title: "Review pending intake packets",
    description: "Check which demo packets are incomplete before arrival.",
    assignedStaff: "Demo Staff A",
    department: "Front Desk",
    priority: "High",
    dueDate: "Today 10:30 AM",
    status: "Overdue",
    notes: "No medical content included.",
    completionTimestamp: "",
  },
  {
    id: "TASK-003",
    title: "Post shift reminder",
    description: "Share a daily reminder in the internal team channel.",
    assignedStaff: "Demo Staff C",
    department: "Clinical Operations",
    priority: "Low",
    dueDate: "Today 3:00 PM",
    status: "Approved",
    notes: "Requires human review before edits become active.",
    completionTimestamp: "",
  },
];

const initialScheduleEvents: ScheduleEvent[] = [
  {
    id: "EVT-001",
    title: "Outpatient provider block",
    owner: "Provider Team A",
    day: "Monday",
    time: "8:00 AM",
    type: "Clinic",
  },
  {
    id: "EVT-002",
    title: "SNF therapy coordination",
    owner: "Therapy Team",
    day: "Tuesday",
    time: "10:00 AM",
    type: "SNF",
  },
  {
    id: "EVT-003",
    title: "Front desk coverage",
    owner: "Operations Team",
    day: "Wednesday",
    time: "12:00 PM",
    type: "Staff Shift",
  },
  {
    id: "EVT-004",
    title: "Schedule review",
    owner: "Office Manager",
    day: "Thursday",
    time: "2:00 PM",
    type: "Admin",
  },
];

const initialChats: TeamChat[] = [
  {
    id: "CHAT-001",
    name: "Clinic Operations Group",
    type: "Group",
    participants: [
      "Demo Physician",
      "Demo Nurse",
      "Demo Medical Assistant",
      "Demo Front Desk",
    ],
    messages: [
      {
        id: "MSG-001",
        author: "Demo Physician",
        role: "Physician",
        text: "Please confirm the demo afternoon room schedule and flag any operational delays.",
        time: "8:42 AM",
      },
      {
        id: "MSG-002",
        author: "Demo Nurse",
        role: "Nurse",
        text: "Room coverage is being reviewed. No clinical decision is being made in this thread.",
        time: "8:49 AM",
      },
    ],
  },
  {
    id: "CHAT-002",
    name: "Physician + Medical Assistant",
    type: "Direct",
    participants: ["Demo Physician", "Demo Medical Assistant"],
    messages: [
      {
        id: "MSG-003",
        author: "Demo Medical Assistant",
        role: "Medical Assistant",
        text: "The demo forms queue needs a front desk follow-up before the next appointment block.",
        time: "9:05 AM",
      },
    ],
  },
  {
    id: "CHAT-003",
    name: "SNF Coordination",
    type: "Group",
    participants: ["Demo Nurse", "Demo Therapist", "Demo Scheduler"],
    messages: [
      {
        id: "MSG-004",
        author: "Demo Therapist",
        role: "Therapist",
        text: "Please coordinate the demo SNF shift schedule handoff for the afternoon team.",
        time: "9:20 AM",
      },
    ],
  },
];

const recentActivity = [
  "Demo schedule was updated by Scheduler role.",
  "A task moved from Pending Approval to Approved.",
  "Daily reminder posted to team communication center.",
];

const notifications = [
  "2 demo tasks require attention.",
  "1 shift note is waiting for review.",
  "Monthly staffing view is ready to review.",
];

const analytics = [
  { label: "Appointment volume", value: "42", change: "+8%" },
  { label: "No-show rate", value: "6.5%", change: "-1.2%" },
  { label: "Average wait time", value: "14m", change: "-3m" },
  { label: "Task completion rate", value: "82%", change: "+5%" },
  { label: "Staff workload", value: "Balanced", change: "Stable" },
  { label: "Phone call volume", value: "128", change: "+12%" },
];

const eventStyles = {
  Clinic: "border-teal-200 bg-teal-50 text-teal-800",
  SNF: "border-violet-200 bg-violet-50 text-violet-800",
  "Staff Shift": "border-sky-200 bg-sky-50 text-sky-800",
  Admin: "border-amber-200 bg-amber-50 text-amber-800",
};

const statusStyles: Record<TaskStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  "Pending Approval": "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Progress": "bg-sky-50 text-sky-700 ring-sky-200",
  Completed: "bg-teal-50 text-teal-700 ring-teal-200",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function MedBaseDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<Role>("Administrator");
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [authView, setAuthView] = useState<"landing" | "auth">("landing");
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [activeModule, setActiveModule] = useState<Module>("Dashboard");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskFilter, setTaskFilter] = useState("Today's Tasks");
  const [scheduleView, setScheduleView] = useState<"Daily" | "Weekly" | "Monthly">(
    "Weekly",
  );
  const [scheduleEvents, setScheduleEvents] = useState(initialScheduleEvents);
  const [teamChats, setTeamChats] = useState(initialChats);
  const [selectedChatId, setSelectedChatId] = useState(initialChats[0]?.id ?? "");
  const [chatDraft, setChatDraft] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupParticipants, setNewGroupParticipants] = useState<string[]>([
    "Demo Physician",
    "Demo Nurse",
  ]);
  const [participantToAdd, setParticipantToAdd] = useState(staffDirectory[0]?.name ?? "");
  const [summarySuggestion, setSummarySuggestion] =
    useState<SummarySuggestion | null>(null);
  const allowedModules = rolePermissions[role];

  function handleAuth() {
    if (!authForm.email || !authForm.password) {
      setAuthError("Enter an email and password to continue.");
      return;
    }

    if (authForm.password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    if (authMode === "create" && authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setUserEmail(authForm.email);
    setAuthError("");
    setAuthForm({ email: "", password: "", confirmPassword: "" });
    setAuthView("landing");
    setActiveModule("Dashboard");
  }

  function signOut() {
    setUserEmail("");
    setActiveModule("Dashboard");
    setChatDraft("");
    setSummarySuggestion(null);
  }

  function moveScheduleEvent(eventId: string, day: string) {
    setScheduleEvents((current) =>
      current.map((event) => (event.id === eventId ? { ...event, day } : event)),
    );
  }

  function sendTeamMessage() {
    if (!selectedChatId || !chatDraft.trim()) {
      return;
    }

    setTeamChats((current) =>
      current.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `MSG-${Date.now()}`,
                  author: "Current user",
                  role,
                  text: chatDraft,
                  time: "Just now",
                },
              ],
            }
          : chat,
      ),
    );
    setChatDraft("");
  }

  function selectChat(chatId: string) {
    setSelectedChatId(chatId);
    setSummarySuggestion(null);
  }

  function addParticipantToChat() {
    if (!selectedChatId || !participantToAdd) {
      return;
    }

    setTeamChats((current) =>
      current.map((chat) =>
        chat.id === selectedChatId && !chat.participants.includes(participantToAdd)
          ? { ...chat, type: "Group", participants: [...chat.participants, participantToAdd] }
          : chat,
      ),
    );
  }

  function toggleGroupParticipant(name: string) {
    setNewGroupParticipants((current) =>
      current.includes(name)
        ? current.filter((participant) => participant !== name)
        : [...current, name],
    );
  }

  function createGroupChat() {
    if (!newGroupName.trim() || newGroupParticipants.length === 0) {
      return;
    }

    const newChat: TeamChat = {
      id: `CHAT-${Date.now()}`,
      name: newGroupName.trim(),
      type: "Group",
      participants: newGroupParticipants,
      messages: [],
    };

    setTeamChats((current) => [newChat, ...current]);
    setSelectedChatId(newChat.id);
    setNewGroupName("");
    setSummarySuggestion(null);
  }

  function generateChatSummary() {
    const selectedChat = teamChats.find((chat) => chat.id === selectedChatId);

    if (!selectedChat || selectedChat.messages.length === 0) {
      return;
    }

    const combinedText = selectedChat.messages
      .map((message) => message.text)
      .join(" ");

    setSummarySuggestion({
      title: `Review follow-up from ${selectedChat.name}`,
      description:
        "Human review required. Confirm whether this chat contains an administrative follow-up that should become a shared team task.",
      priority: combinedText.length > 220 ? "High" : "Medium",
      responsibleRole: "Office Manager",
      dueDate: "Today 4:00 PM",
    });
  }

  function approveSuggestedTask() {
    if (!summarySuggestion) {
      return;
    }

    setTasks((current) => [
      {
        id: `TASK-${String(current.length + 1).padStart(3, "0")}`,
        title: summarySuggestion.title,
        description: summarySuggestion.description,
        assignedStaff: "Unassigned",
        department: "Administration",
        priority: summarySuggestion.priority,
        dueDate: summarySuggestion.dueDate,
        status: "Pending Approval",
        notes:
          "Generated from a mock team chat summary. Must be reviewed by a human.",
        completionTimestamp: "",
      },
      ...current,
    ]);
    setSummarySuggestion(null);
    setActiveModule("Tasks");
  }

  function updateTaskStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              completionTimestamp:
                status === "Completed" ? new Date().toLocaleString() : "",
            }
          : task,
      ),
    );
  }

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskFilter === "My Tasks") return task.assignedStaff !== "Unassigned";
      if (taskFilter === "Provider") return task.department === "Clinical Operations";
      if (taskFilter === "Department") return task.department === "Scheduling";
      if (taskFilter === "Today's Tasks") return task.dueDate.includes("Today");
      if (taskFilter === "Overdue") return task.status === "Overdue";
      if (taskFilter === "Completed") return task.status === "Completed";
      return true;
    });
  }, [taskFilter, tasks]);

  if (!userEmail && authView === "landing") {
    return (
      <LandingPage
        openCreateAccount={() => {
          setAuthMode("create");
          setAuthError("");
          setAuthView("auth");
        }}
        openLogin={() => {
          setAuthMode("login");
          setAuthError("");
          setAuthView("auth");
        }}
      />
    );
  }

  if (!userEmail) {
    return (
      <AuthScreen
        authError={authError}
        authForm={authForm}
        authMode={authMode}
        onBack={() => {
          setAuthError("");
          setAuthView("landing");
        }}
        role={role}
        setAuthForm={setAuthForm}
        setAuthMode={(mode) => {
          setAuthMode(mode);
          setAuthError("");
        }}
        setRole={setRole}
        submit={handleAuth}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <DemoBanner />
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              Med Base
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Healthcare operations command center
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {userEmail} - {role}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setActiveModule("Scheduling")}>
              New schedule item
            </Button>
            <Button variant="secondary" onClick={() => setActiveModule("Tasks")}>
              Review tasks
            </Button>
            <Button variant="secondary" onClick={signOut}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="grid gap-2">
            {allowedModules.map((module) => (
              <button
                key={module}
                className={`rounded-md px-4 py-3 text-left text-sm font-medium transition ${
                  activeModule === module
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
                type="button"
                onClick={() => setActiveModule(module)}
              >
                {module}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-lg border border-border bg-white p-4 text-sm text-muted-foreground">
            Role-based navigation is mocked for architecture planning.
          </div>
        </aside>

        <main className="grid gap-6">
          {activeModule === "Dashboard" && (
            <DashboardModule
              notifications={notifications}
              recentActivity={recentActivity}
              setActiveModule={setActiveModule}
              staffOnShift={staffOnShift}
              tasks={tasks}
              todayAppointments={todayAppointments}
            />
          )}
          {activeModule === "Scheduling" && (
            <SchedulingModule
              moveScheduleEvent={moveScheduleEvent}
              scheduleEvents={scheduleEvents}
              scheduleView={scheduleView}
              setScheduleView={setScheduleView}
            />
          )}
          {activeModule === "Tasks" && (
            <TasksModule
              setTaskFilter={setTaskFilter}
              taskFilter={taskFilter}
              tasks={visibleTasks}
              updateTaskStatus={updateTaskStatus}
            />
          )}
          {activeModule === "Messages" && (
            <MessagesModule
              addParticipantToChat={addParticipantToChat}
              approveSuggestedTask={approveSuggestedTask}
              chatDraft={chatDraft}
              createGroupChat={createGroupChat}
              generateChatSummary={generateChatSummary}
              newGroupName={newGroupName}
              newGroupParticipants={newGroupParticipants}
              participantToAdd={participantToAdd}
              selectChat={selectChat}
              selectedChatId={selectedChatId}
              sendTeamMessage={sendTeamMessage}
              setChatDraft={setChatDraft}
              setNewGroupName={setNewGroupName}
              setParticipantToAdd={setParticipantToAdd}
              staffDirectory={staffDirectory}
              summarySuggestion={summarySuggestion}
              teamChats={teamChats}
              toggleGroupParticipant={toggleGroupParticipant}
            />
          )}
          {activeModule === "Communication" && <CommunicationModule />}
          {activeModule === "Analytics" && <AnalyticsModule />}
          {activeModule === "Settings" && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}

function LandingPage({
  openCreateAccount,
  openLogin,
}: {
  openCreateAccount: () => void;
  openLogin: () => void;
}) {
  const featureCards = [
    {
      title: "Scheduling",
      text: "Coordinate clinic appointments, staff shifts, and SNF schedule blocks.",
    },
    {
      title: "Messages",
      text: "Create direct chats and group threads for staff coordination.",
    },
    {
      title: "AI summaries",
      text: "Summarize operational conversations for human task review.",
    },
    {
      title: "Tasks",
      text: "Turn approved follow-ups into shared team work queues.",
    },
    {
      title: "Reminders",
      text: "Prepare reminder workflows that reduce missed appointments.",
    },
    {
      title: "Analytics",
      text: "Track operational metrics without medical documentation.",
    },
  ];

  const workflowCards = [
    "Role-based access",
    "Group coordination",
    "Review before action",
    "Demo data only",
  ];

  return (
    <main className="min-h-dvh bg-white text-foreground">
      <DemoBanner />
      <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            className="flex items-center gap-2 text-sm font-semibold"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <MedBaseLogo compact />
          </button>
          <nav className="hidden items-center gap-8 text-xs font-medium text-muted-foreground md:flex">
            <a className="text-primary" href="#overview">
              Overview
            </a>
            <a href="#features">Features</a>
            <a href="#ai">AI</a>
            <a href="#why">Why us?</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={openLogin}>
              Login
            </Button>
            <Button onClick={openCreateAccount}>Get Started</Button>
          </div>
        </div>
      </header>

      <section
        id="overview"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
      >
        <div>
          <StatusPill className="bg-primary/10 text-primary ring-primary/20">
            Prototype
          </StatusPill>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
            Med Base coordinates healthcare operations without becoming an EHR
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            A modular SaaS prototype for scheduling, staff messaging, reminders,
            forms, tasks, and operational visibility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openCreateAccount}>Start with a demo account</Button>
            <Button variant="secondary" onClick={openLogin}>
              Login to prototype
            </Button>
          </div>
          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-primary">No EHR scope</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Workflow coordination only
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary">Human review</p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI drafts require approval
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary">Modular</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Built to expand over time
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-6 shadow-2xl">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Appointment list",
              "Patient reminders",
              "Team messages",
              "Digital forms",
              "Task approvals",
              "Insurance checks",
            ].map((label, index) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/90 p-4 shadow-sm"
              >
                <div className="mb-4 h-2 rounded-full bg-primary/20">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${52 + index * 6}%` }}
                  />
                </div>
                <p className="font-semibold">{label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Operational workflow preview
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <StatusPill className="bg-primary/10 text-primary ring-primary/20">
            Overview
          </StatusPill>
          <h2 className="mt-5 text-4xl font-semibold tracking-normal">
            Built for the administrative work around care
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Improve the repeatable workflows that slow teams down, while keeping
            clinical decisions and medical documentation outside the platform.
          </p>
          <div className="mt-8 rounded-lg bg-slate-950 p-8 text-left text-white shadow-xl">
            <p className="text-5xl font-semibold">Med Base workflow platform</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Scheduling, messages, reminders, forms, and task management in one
              operational workspace.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <StatusPill className="bg-primary/10 text-primary ring-primary/20">
            Features
          </StatusPill>
          <h2 className="mt-4 text-3xl font-semibold">Core modules</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            The prototype uses fictional data only.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-border bg-background p-6"
            >
              <span className="grid size-9 place-items-center rounded-md bg-white text-primary ring-1 ring-border">
                +
              </span>
              <h3 className="mt-6 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="bg-background px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <StatusPill className="bg-primary/10 text-primary ring-primary/20">
              AI Section
            </StatusPill>
            <h2 className="mt-4 text-3xl font-semibold">
              AI summaries inside team messages
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Suggestions are operational drafts and never medical decisions.
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-xl font-semibold">Human-reviewed workflow</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The AI helps organize team communication, but every output stays
                in draft mode until a staff member reviews it.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  {
                    step: "1",
                    title: "Select a staff conversation",
                    text: "Direct messages and group chats can be summarized from the Messages page.",
                  },
                  {
                    step: "2",
                    title: "Generate an operational draft",
                    text: "AI proposes follow-up actions, priority, responsible role, and due time.",
                  },
                  {
                    step: "3",
                    title: "Review before task creation",
                    text: "A person must approve the draft before it moves into shared task review.",
                  },
                ].map((item) => (
                  <article
                    key={item.step}
                    className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-white p-4 shadow-sm"
                  >
                    <span className="grid size-10 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 p-4">
                <p className="text-sm font-semibold text-primary">
                  Suggested fields
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Summary", "Action", "Priority", "Role", "Due time"].map(
                    (field) => (
                      <span
                        key={field}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground ring-1 ring-primary/20"
                      >
                        {field}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-sm font-semibold">Allowed users</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Physician, nurse, medical assistant, front desk, scheduler,
                    and manager roles.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-sm font-semibold">Safety rule</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    No diagnosis, treatment, billing, or medical documentation
                    is created.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-border bg-slate-950 p-5 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(13,151,186,0.35),transparent_28%),radial-gradient(circle_at_85%_35%,rgba(255,255,255,0.16),transparent_24%)]" />
              <div className="relative grid gap-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">
                      Live team thread
                    </p>
                    <p className="text-xs text-white/60">Operational messages only</p>
                  </div>
                  <StatusPill className="bg-primary text-primary-foreground ring-primary/40">
                    AI ready
                  </StatusPill>
                </div>

                <div className="grid gap-3">
                  {[
                    ["Physician", "Can someone review the afternoon room flow?"],
                    ["Nurse", "Coverage looks tight around the second block."],
                    ["Medical Assistant", "I can help confirm the forms queue."],
                  ].map(([author, text], index) => (
                    <div
                      key={author}
                      className="message-float rounded-lg border border-white/10 bg-white p-3 shadow-lg"
                      style={{ animationDelay: `${index * 0.45}s` }}
                    >
                      <p className="text-xs font-semibold text-primary">{author}</p>
                      <p className="mt-1 text-sm text-slate-700">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="ai-pulse mx-auto grid size-14 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                  AI
                </div>

                <div className="summary-slide rounded-lg border border-primary/30 bg-white p-4 shadow-lg">
                  <p className="text-lg font-semibold">Chat summary preview</p>
                  <div className="mt-4 grid gap-3">
                    {["Summary", "Suggested action", "Responsible role"].map(
                      (item) => (
                        <div
                          key={item}
                          className="rounded-md bg-background p-3 text-sm"
                        >
                          <p className="font-medium">{item}</p>
                          <p className="mt-1 text-muted-foreground">
                            Requires human review before becoming a task.
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/15">
                    <div className="review-progress h-full rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <StatusPill className="bg-primary/10 text-primary ring-primary/20">
            Task Pipeline
          </StatusPill>
          <h2 className="mt-4 text-3xl font-semibold">
            From message to reviewed team task
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {workflowCards.map((item) => (
            <div key={item} className="rounded-lg border border-border bg-white p-4">
              <StatusPill className="bg-primary/10 text-primary ring-primary/20">
                Step
              </StatusPill>
              <p className="mt-4 font-semibold">{item}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Prototype workflow stage.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="bg-background px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
          <div className="min-h-72 rounded-lg bg-[linear-gradient(135deg,#0f172a,#0D97BA)] p-6 text-white shadow-xl">
            <div className="grid h-full content-end">
              <p className="text-2xl font-semibold">Operations-first design</p>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/85">
                Designed for front desk, schedulers, nurses, medical assistants,
                therapists, office managers, and providers.
              </p>
            </div>
          </div>
          <div>
            <StatusPill className="bg-primary/10 text-primary ring-primary/20">
              Why choose us?
            </StatusPill>
            <h2 className="mt-5 text-3xl font-semibold">
              Focused on coordination, not medical records
            </h2>
            <div className="mt-6 grid gap-4">
              {[
                "Easy to demo and expand",
                "Role-based architecture",
                "Supabase-ready foundation",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-white p-4">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Built for production architecture while staying prototype-safe.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <MedBaseLogo compact />
            <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
              Prototype - Demonstration Only - No Real Patient Data.
            </p>
          </div>
          <InfoBlock title="Product" lines={["Features", "Integrations", "Roadmap"]} />
          <InfoBlock title="Resources" lines={["Documentation", "Support", "Guides"]} />
          <InfoBlock title="Company" lines={["About", "Careers", "Contact"]} />
        </div>
      </footer>
    </main>
  );
}

function AuthScreen({
  authError,
  authForm,
  authMode,
  onBack,
  role,
  setAuthForm,
  setAuthMode,
  setRole,
  submit,
}: {
  authError: string;
  authForm: { email: string; password: string; confirmPassword: string };
  authMode: "login" | "create";
  onBack: () => void;
  role: Role;
  setAuthForm: (form: { email: string; password: string; confirmPassword: string }) => void;
  setAuthMode: (mode: "login" | "create") => void;
  setRole: (role: Role) => void;
  submit: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isCreate = authMode === "create";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
        <DemoBanner />
        <button
          className="mt-5 text-sm font-medium text-muted-foreground hover:text-foreground"
          type="button"
          onClick={onBack}
        >
          Back to landing page
        </button>
        <p className="mt-5 text-sm font-semibold uppercase text-primary">
          Med Base
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          {isCreate ? "Create account" : "Log in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Prototype authentication for role-based workflow access.
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-md border border-border bg-muted p-1">
          {(["login", "create"] as const).map((mode) => (
            <button
              key={mode}
              className={`rounded px-3 py-2 text-sm font-medium transition ${
                authMode === mode
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              type="button"
              onClick={() => setAuthMode(mode)}
            >
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          ))}
        </div>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field label="Email">
            <input
              autoComplete="email"
              className={inputClassName}
              placeholder="Email address"
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
            />
          </Field>

          <Field label="Password">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-md border border-border bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                autoComplete={isCreate ? "new-password" : "current-password"}
                className="h-10 min-w-0 border-0 bg-white px-3 text-sm outline-none"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
              />
              <button
                className="border-l border-border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {isCreate ? (
            <Field label="Confirm password">
              <input
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Confirm password"
                type={showPassword ? "text" : "password"}
                value={authForm.confirmPassword}
                onChange={(event) =>
                  setAuthForm({
                    ...authForm,
                    confirmPassword: event.target.value,
                  })
                }
              />
            </Field>
          ) : null}

          <Field label="Role">
            <select
              className={inputClassName}
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {roles.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>

          {authError ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authError}
            </p>
          ) : null}

          <Button className="w-full" type="submit">
            {isCreate ? "Create account" : "Log in"}
          </Button>
        </form>
      </section>
    </main>
  );
}

function DashboardModule({
  notifications,
  recentActivity,
  setActiveModule,
  staffOnShift,
  tasks,
  todayAppointments,
}: {
  notifications: string[];
  recentActivity: string[];
  setActiveModule: (module: Module) => void;
  staffOnShift: { name: string; role: string; shift: string }[];
  tasks: Task[];
  todayAppointments: {
    time: string;
    label: string;
    location: string;
    status: string;
  }[];
}) {
  const pendingTasks = tasks.filter((task) =>
    ["Pending Approval", "Approved", "In Progress"].includes(task.status),
  );
  const overdueTasks = tasks.filter((task) => task.status === "Overdue");

  return (
    <div className="grid gap-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Today's appointments" value={todayAppointments.length} />
        <MetricCard label="Staff on shift" value={staffOnShift.length} />
        <MetricCard label="Pending tasks" value={pendingTasks.length} />
        <MetricCard label="Overdue tasks" value={overdueTasks.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Today's Appointments"
          description="Operational appointment overview using fictional demonstration data."
        >
          <div className="grid gap-3">
            {todayAppointments.map((appointment) => (
              <div
                key={`${appointment.time}-${appointment.label}`}
                className="grid gap-2 rounded-lg border border-border p-4 md:grid-cols-[100px_1fr_160px]"
              >
                <p className="font-medium">{appointment.time}</p>
                <div>
                  <p className="font-medium">{appointment.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.location}
                  </p>
                </div>
                <StatusPill>{appointment.status}</StatusPill>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Quick Actions" description="Jump into common workflow areas.">
          <div className="grid gap-3">
            {(["Scheduling", "Messages", "Tasks", "Communication"] as Module[]).map(
              (module) => (
                <Button
                  key={module}
                  className="justify-start"
                  variant="secondary"
                  onClick={() => setActiveModule(module)}
                >
                  Open {module}
                </Button>
              ),
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Staff Currently On Shift" description="Mock staffing roster.">
          <StackedList
            items={staffOnShift.map(
              (staff) => `${staff.name} - ${staff.role} - ${staff.shift}`,
            )}
          />
        </Panel>
        <Panel title="Recent Activity" description="Operational activity only.">
          <StackedList items={recentActivity} />
        </Panel>
        <Panel title="Notifications" description="Workflow alerts and reminders.">
          <StackedList items={notifications} />
        </Panel>
      </section>
    </div>
  );
}

function SchedulingModule({
  moveScheduleEvent,
  scheduleEvents,
  scheduleView,
  setScheduleView,
}: {
  moveScheduleEvent: (eventId: string, day: string) => void;
  scheduleEvents: ScheduleEvent[];
  scheduleView: "Daily" | "Weekly" | "Monthly";
  setScheduleView: (view: "Daily" | "Weekly" | "Monthly") => void;
}) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <Panel
      title="Scheduling"
      description="Outpatient clinic and SNF scheduling with draggable demonstration events."
    >
      <div className="flex flex-wrap gap-2">
        {(["Daily", "Weekly", "Monthly"] as const).map((view) => (
          <Button
            key={view}
            variant={scheduleView === view ? "primary" : "secondary"}
            onClick={() => setScheduleView(view)}
          >
            {view}
          </Button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-5">
        {days.map((day) => (
          <div
            key={day}
            className="min-h-48 rounded-lg border border-border bg-background p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const eventId = event.dataTransfer.getData("text/plain");
              moveScheduleEvent(eventId, day);
            }}
          >
            <h3 className="font-semibold">{day}</h3>
            <div className="mt-3 grid gap-3">
              {scheduleEvents
                .filter((event) => event.day === day)
                .map((event) => (
                  <article
                    key={event.id}
                    className={`cursor-grab rounded-lg border p-3 text-sm ${eventStyles[event.type]}`}
                    draggable
                    onDragStart={(dragEvent) =>
                      dragEvent.dataTransfer.setData("text/plain", event.id)
                    }
                  >
                    <p className="font-semibold">{event.title}</p>
                    <p>{event.time}</p>
                    <p>{event.owner}</p>
                    <p className="mt-1 text-xs">{event.type}</p>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock
          title="Provider schedules"
          lines={["Provider Team A - clinic block", "Provider Team B - admin block"]}
        />
        <InfoBlock
          title="Staff schedules"
          lines={["Operations Team - front desk coverage", "Therapy Team - SNF coordination"]}
        />
      </div>
    </Panel>
  );
}

function TasksModule({
  setTaskFilter,
  taskFilter,
  tasks,
  updateTaskStatus,
}: {
  setTaskFilter: (filter: string) => void;
  taskFilter: string;
  tasks: Task[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}) {
  const filters = [
    "My Tasks",
    "Provider",
    "Department",
    "Today's Tasks",
    "Overdue",
    "Completed",
  ];

  return (
    <Panel
      title="Shared Task Management"
      description="Team tasks move from drafts and approvals into coordinated work."
    >
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={taskFilter === filter ? "primary" : "secondary"}
            onClick={() => setTaskFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>
      <div className="mt-5 grid gap-4">
        {tasks.length === 0 ? (
          <EmptyState message="No tasks match this filter." />
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
                <StatusPill className={statusStyles[task.status]}>
                  {task.status}
                </StatusPill>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <p>Assigned: {task.assignedStaff}</p>
                <p>Department: {task.department}</p>
                <p>Priority: {task.priority}</p>
                <p>Due: {task.dueDate}</p>
                <p>Notes: {task.notes}</p>
                <p>Completed: {task.completionTimestamp || "Not completed"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    "Draft",
                    "Pending Approval",
                    "Approved",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                    "Overdue",
                  ] as TaskStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    type="button"
                    onClick={() => updateTaskStatus(task.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}

function MessagesModule({
  addParticipantToChat,
  approveSuggestedTask,
  chatDraft,
  createGroupChat,
  generateChatSummary,
  newGroupName,
  newGroupParticipants,
  participantToAdd,
  selectChat,
  selectedChatId,
  sendTeamMessage,
  setChatDraft,
  setNewGroupName,
  setParticipantToAdd,
  staffDirectory,
  summarySuggestion,
  teamChats,
  toggleGroupParticipant,
}: {
  addParticipantToChat: () => void;
  approveSuggestedTask: () => void;
  chatDraft: string;
  createGroupChat: () => void;
  generateChatSummary: () => void;
  newGroupName: string;
  newGroupParticipants: string[];
  participantToAdd: string;
  selectChat: (chatId: string) => void;
  selectedChatId: string;
  sendTeamMessage: () => void;
  setChatDraft: (value: string) => void;
  setNewGroupName: (value: string) => void;
  setParticipantToAdd: (value: string) => void;
  staffDirectory: { name: string; role: Role; department: string }[];
  summarySuggestion: SummarySuggestion | null;
  teamChats: TeamChat[];
  toggleGroupParticipant: (name: string) => void;
}) {
  const selectedChat = teamChats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="grid gap-6">
      <Panel
        title="Messages"
        description="Direct messages and group chats for operational coordination. AI summaries are drafts for human review only."
      >
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <div className="grid content-start gap-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <h3 className="font-semibold">Create Group</h3>
              <input
                className={`${inputClassName} mt-3 w-full`}
                placeholder="Group name"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
              />
              <div className="mt-3 grid gap-2">
                {staffDirectory.map((staff) => (
                  <label
                    key={staff.name}
                    className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm"
                  >
                    <input
                      checked={newGroupParticipants.includes(staff.name)}
                      className="mt-1"
                      type="checkbox"
                      onChange={() => toggleGroupParticipant(staff.name)}
                    />
                    <span>
                      <span className="block font-medium">{staff.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {staff.role} - {staff.department}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <Button className="mt-3 w-full" onClick={createGroupChat}>
                Create group
              </Button>
            </div>

            {teamChats.map((chat) => (
              <button
                key={chat.id}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  selectedChatId === chat.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
                type="button"
                onClick={() => selectChat(chat.id)}
              >
                <span className="block font-semibold">{chat.name}</span>
                <span>
                  {chat.type} - {chat.participants.join(", ")}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">
                {selectedChat?.name ?? "Select a chat"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedChat
                  ? `${selectedChat.type} chat - ${selectedChat.participants.join(", ")}`
                  : "Choose a direct message or group chat."}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <select
                  className={inputClassName}
                  value={participantToAdd}
                  onChange={(event) => setParticipantToAdd(event.target.value)}
                >
                  {staffDirectory.map((staff) => (
                    <option key={staff.name} value={staff.name}>
                      {staff.name} - {staff.role}
                    </option>
                  ))}
                </select>
                <Button variant="secondary" onClick={addParticipantToChat}>
                  Add person
                </Button>
              </div>
            </div>

            <div className="grid max-h-[420px] gap-3 overflow-auto p-4">
              {selectedChat?.messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-lg border border-border bg-white p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{message.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {message.role} - {message.time}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {message.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid gap-3 border-t border-border p-4">
              <textarea
                className="min-h-28 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Write an internal operational message. Do not enter real patient data."
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={sendTeamMessage}>Send message</Button>
                <Button variant="secondary" onClick={generateChatSummary}>
                  AI summarize this chat
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <h3 className="font-semibold">AI Chat Summary</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Summaries are operational drafts only. They cannot create medical
              decisions and require human review before becoming tasks.
            </p>
            {summarySuggestion ? (
              <div className="mt-4 grid gap-3 text-sm">
                <p>
                  <strong>Summary:</strong> Mock chat contains operational
                  coordination follow-up.
                </p>
                <p>
                  <strong>Suggested action:</strong> {summarySuggestion.title}
                </p>
                <p>
                  <strong>Priority:</strong> {summarySuggestion.priority}
                </p>
                <p>
                  <strong>Responsible role:</strong>{" "}
                  {summarySuggestion.responsibleRole}
                </p>
                <p>
                  <strong>Due:</strong> {summarySuggestion.dueDate}
                </p>
                <Button onClick={approveSuggestedTask}>Send to task review</Button>
              </div>
            ) : (
              <EmptyState message="Select a chat and generate an AI summary draft." />
            )}
          </div>
        </div>
      </Panel>

    </div>
  );
}

function CommunicationModule() {
  return (
    <Panel
      title="Communication Boards"
      description="Announcements, shift notes, and daily reminders separate from staff texting."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <InfoBlock
          title="Announcements"
          lines={[
            "Demo policy reminder posted for all staff.",
            "Tablet check-in workflow review scheduled.",
          ]}
        />
        <InfoBlock
          title="Shift Notes"
          lines={[
            "Morning shift completed operational handoff.",
            "SNF coordination queue reviewed by staff.",
          ]}
        />
        <InfoBlock
          title="Daily Reminders"
          lines={[
            "Review overdue tasks before end of shift.",
            "Confirm tomorrow's provider and staff schedule blocks.",
          ]}
        />
      </div>
    </Panel>
  );
}

function AnalyticsModule() {
  return (
    <Panel
      title="Analytics"
      description="Operational metrics only. No medical information or billing data."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analytics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-primary">{metric.change}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SettingsModule() {
  return (
    <Panel
      title="Settings"
      description="Mock organization and role-management controls for future expansion."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBlock
          title="Organization Information"
          lines={["Demo Med Base Operations Group", "Multi-site workflow prototype"]}
        />
        <InfoBlock
          title="Departments"
          lines={departmentOptions}
        />
        <InfoBlock
          title="Notification Preferences"
          lines={["Task approvals", "Overdue tasks", "Schedule changes"]}
        />
        <InfoBlock title="Theme" lines={["Healthcare light theme", "High contrast ready"]} />
        <InfoBlock
          title="User Management"
          lines={["Invite staff", "Deactivate mock user", "Assign department"]}
        />
        <InfoBlock
          title="Role Management"
          lines={roles.map((option) => `${option}: configurable permissions`)}
        />
      </div>
    </Panel>
  );
}

function MedBaseLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        alt=""
        className={compact ? "h-8 w-auto" : "h-10 w-auto"}
        src="/medbase-logo.svg"
      />
      <span className="sr-only">Med Base</span>
    </span>
  );
}

function DemoBanner() {
  return (
    <div className="bg-primary px-4 py-2 text-center text-xs font-semibold uppercase text-primary-foreground">
      {demoBanner}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function StatusPill({
  children,
  className = "bg-slate-100 text-slate-700 ring-slate-200",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h3 className="font-semibold">{title}</h3>
      <StackedList items={lines} />
    </div>
  );
}

function StackedList({ items }: { items: string[] }) {
  return (
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

const inputClassName =
  "h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
