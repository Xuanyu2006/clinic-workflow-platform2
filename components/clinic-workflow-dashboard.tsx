"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { createOptionalClient } from "@/lib/supabase/client";

type Role =
  | "Administrator"
  | "Physician"
  | "Nurse"
  | "Medical Assistant"
  | "Front Desk"
  | "Office Manager"
  | "Scheduler"
  | "Therapist"
  | "Patient Coordinator"
  | "Referral Coordinator"
  | "Care Coordinator"
  | "SNF Coordinator"
  | "Records Coordinator"
  | "Operations Lead"
  | "Receptionist";

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

const previewBanner = "Med Base Preview - No Real Patient Data";
const previewOrganizationId = "00000000-0000-0000-0000-000000000001";
const restrictedDataWarning =
  "Do not enter real patient data. Remove identifiers or clinical details before sending.";

function containsRestrictedPatientData(value: string) {
  return /\b(dob|date of birth|ssn|social security|mrn|medical record|diagnosis|diagnosed|treatment|prescription|insurance id|policy number)\b/i.test(
    value,
  );
}

const roles: Role[] = [
  "Administrator",
  "Physician",
  "Nurse",
  "Medical Assistant",
  "Front Desk",
  "Office Manager",
  "Scheduler",
  "Therapist",
  "Patient Coordinator",
  "Referral Coordinator",
  "Care Coordinator",
  "SNF Coordinator",
  "Records Coordinator",
  "Operations Lead",
  "Receptionist",
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
  "Patient Coordinator": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
  ],
  "Referral Coordinator": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
  ],
  "Care Coordinator": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
  ],
  "SNF Coordinator": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
  ],
  "Records Coordinator": ["Dashboard", "Tasks", "Messages", "Communication"],
  "Operations Lead": [
    "Dashboard",
    "Scheduling",
    "Tasks",
    "Messages",
    "Communication",
    "Analytics",
    "Settings",
  ],
  Receptionist: ["Dashboard", "Scheduling", "Tasks", "Messages", "Communication"],
};

const moduleIconLabels: Record<Module, string> = {
  Dashboard: "##",
  Scheduling: "[]",
  Tasks: ":-",
  Messages: "[]",
  Communication: "()",
  Analytics: "||",
  Settings: "o-",
};

const departmentOptions = [
  "Front Desk",
  "Clinical Operations",
  "Scheduling",
  "Therapy",
  "SNF Coordination",
  "Care Coordination",
  "Referrals",
  "Records",
  "Administration",
];

const staffDirectory: { name: string; role: Role; department: string }[] = [
  { name: "Dr. Priya Foster", role: "Physician", department: "Clinical Operations" },
  { name: "Lena Ortiz, RN", role: "Nurse", department: "Clinical Operations" },
  { name: "Marcus Reid, MA", role: "Medical Assistant", department: "Clinic Support" },
  { name: "Sofia Patel", role: "Front Desk", department: "Front Desk" },
  { name: "Evan Brooks", role: "Scheduler", department: "Scheduling" },
  { name: "Talia Nguyen", role: "Therapist", department: "Therapy" },
  { name: "Naomi Reed", role: "Office Manager", department: "Administration" },
  { name: "Amira Khan", role: "Patient Coordinator", department: "Care Coordination" },
  { name: "Miles Carter", role: "Referral Coordinator", department: "Referrals" },
  { name: "Renee Park", role: "SNF Coordinator", department: "SNF Coordination" },
  { name: "Oliver Stone", role: "Records Coordinator", department: "Records" },
  { name: "Harper Wells", role: "Operations Lead", department: "Administration" },
  { name: "Camila Torres", role: "Receptionist", department: "Front Desk" },
];

const initialTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Confirm afternoon schedule",
    description: "Review open appointment slots and notify assigned staff.",
    assignedStaff: "Evan Brooks",
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
    description: "Check which intake packets are incomplete before arrival.",
    assignedStaff: "Sofia Patel",
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
    assignedStaff: "Lena Ortiz, RN",
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
      "Dr. Priya Foster",
      "Lena Ortiz, RN",
      "Marcus Reid, MA",
      "Sofia Patel",
    ],
    messages: [
      {
        id: "MSG-001",
        author: "Dr. Priya Foster",
        role: "Physician",
        text: "Please confirm the afternoon room schedule and flag any operational delays.",
        time: "8:42 AM",
      },
      {
        id: "MSG-002",
        author: "Lena Ortiz, RN",
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
    participants: ["Dr. Priya Foster", "Marcus Reid, MA"],
    messages: [
      {
        id: "MSG-003",
        author: "Marcus Reid, MA",
        role: "Medical Assistant",
        text: "The forms queue needs a front desk follow-up before the next appointment block.",
        time: "9:05 AM",
      },
    ],
  },
  {
    id: "CHAT-003",
    name: "SNF Coordination",
    type: "Group",
    participants: ["Lena Ortiz, RN", "Talia Nguyen", "Evan Brooks"],
    messages: [
      {
        id: "MSG-004",
        author: "Talia Nguyen",
        role: "Therapist",
        text: "Please coordinate the SNF shift schedule handoff for the afternoon team.",
        time: "9:20 AM",
      },
    ],
  },
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
  const supabase = useMemo(() => createOptionalClient(), []);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<Role>("Administrator");
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [authView, setAuthView] = useState<"landing" | "auth">("landing");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authStatus, setAuthStatus] = useState<"checking" | "signed-in" | "signed-out">(
    "checking",
  );
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
  const [messageError, setMessageError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupParticipants, setNewGroupParticipants] = useState<string[]>([
    "Dr. Priya Foster",
    "Lena Ortiz, RN",
  ]);
  const [participantToAdd, setParticipantToAdd] = useState(staffDirectory[0]?.name ?? "");
  const [summarySuggestion, setSummarySuggestion] =
    useState<SummarySuggestion | null>(null);
  const allowedModules = rolePermissions[role];

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setAuthStatus("signed-out");
      return;
    }

    const activeClient = client;
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await activeClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session?.user) {
        await loadAuthenticatedUser(session.user);
      } else {
        setAuthStatus("signed-out");
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = activeClient.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        void loadAuthenticatedUser(session.user);
      } else {
        setUserEmail("");
        setAuthStatus("signed-out");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function loadAuthenticatedUser(user: User) {
    const email = user.email ?? "";
    setUserEmail(email);
    setAuthStatus("signed-in");
    setAuthView("landing");

    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (data?.role) {
      setRole(data.role as Role);
    }
  }

  async function ensureUserProfile(user: User, selectedRole: Role) {
    if (!supabase || !user.email) {
      return;
    }

    await supabase.from("user_profiles").upsert({
      id: user.id,
      organization_id: previewOrganizationId,
      email: user.email,
      role: selectedRole,
    });
  }

  async function handleAuth() {
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

    if (!supabase) {
      setUserEmail(authForm.email);
      setAuthNotice(
        "Preview mode is active because Supabase environment variables are not configured yet.",
      );
      setAuthStatus("signed-in");
      setAuthError("");
      setAuthForm({ email: "", password: "", confirmPassword: "" });
      setAuthView("landing");
      setActiveModule("Dashboard");
      return;
    }

    setAuthError("");
    setAuthNotice("");

    if (authMode === "create") {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            role,
            organization_id: previewOrganizationId,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        await ensureUserProfile(data.user, role);
      }

      if (!data.session) {
        setAuthNotice(
          "Account created. Check email verification settings in Supabase if login is not immediate.",
        );
        setAuthForm({ email: "", password: "", confirmPassword: "" });
        return;
      }

      await loadAuthenticatedUser(data.session.user);
      setAuthForm({ email: "", password: "", confirmPassword: "" });
      setActiveModule("Dashboard");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authForm.email,
      password: authForm.password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.user) {
      await ensureUserProfile(data.user, role);
      await loadAuthenticatedUser(data.user);
    }

    setAuthForm({ email: "", password: "", confirmPassword: "" });
    setActiveModule("Dashboard");
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUserEmail("");
    setAuthStatus("signed-out");
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

    if (containsRestrictedPatientData(chatDraft)) {
      setMessageError(restrictedDataWarning);
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
    setMessageError("");
  }

  function selectChat(chatId: string) {
    setSelectedChatId(chatId);
    setSummarySuggestion(null);
    setMessageError("");
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
          "Generated from a team chat summary. Must be reviewed by a human.",
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

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5 text-foreground">
        <section className="rounded-lg border border-border bg-white p-6 text-center shadow-sm">
          <MedBaseLogo />
          <p className="mt-4 text-sm text-muted-foreground">
            Checking secure session...
          </p>
        </section>
      </main>
    );
  }

  if (!userEmail && authView === "landing") {
    return (
      <LandingPage
        openCreateAccount={() => {
          setAuthMode("create");
          setAuthError("");
          setAuthNotice("");
          setAuthView("auth");
        }}
        openLogin={() => {
          setAuthMode("login");
          setAuthError("");
          setAuthNotice("");
          setAuthView("auth");
        }}
      />
    );
  }

  if (!userEmail) {
    return (
      <AuthScreen
        authError={authError}
        authNotice={authNotice}
        authForm={authForm}
        authMode={authMode}
        isSupabaseConfigured={Boolean(supabase)}
        onBack={() => {
          setAuthError("");
          setAuthNotice("");
          setAuthView("landing");
        }}
        role={role}
        setAuthForm={setAuthForm}
        setAuthMode={(mode) => {
          setAuthMode(mode);
          setAuthError("");
          setAuthNotice("");
        }}
        setRole={setRole}
        submit={handleAuth}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#f4f6f8] text-foreground">
      <header className="border-b border-[#dfe6ee] bg-white">
        <div className="flex min-h-20 w-full flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <MedBaseLogo compact />
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">Med Base</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as {userEmail} - {role}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                Preview - No Real Patient Data
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={() => setActiveModule("Scheduling")}>
              <span className="text-lg leading-none">+</span>
              New Schedule Item
            </Button>
            <Button
              className="gap-2"
              variant="secondary"
              onClick={() => setActiveModule("Tasks")}
            >
              <span className="text-base leading-none">[]</span>
              Review Tasks
            </Button>
            <Button className="gap-2" variant="secondary" onClick={signOut}>
              <span className="text-base leading-none">-&gt;</span>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100dvh-81px)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-[#dfe6ee] bg-white px-5 py-8">
          <nav className="grid gap-4">
            {allowedModules.map((module) => (
              <button
                key={module}
                className={`grid grid-cols-[32px_minmax(0,1fr)_4px] items-center gap-3 rounded-lg px-4 py-4 text-left text-base font-semibold transition ${
                  activeModule === module
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
                onClick={() => setActiveModule(module)}
              >
                <span className="text-xl font-semibold text-slate-500">
                  {moduleIconLabels[module]}
                </span>
                <span>{module}</span>
                <span
                  className={`h-6 rounded-full ${
                    activeModule === module ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-lg border border-[#dfe6ee] bg-[#f8fafc] p-4 text-sm leading-6 text-muted-foreground">
            Role-based navigation is configured for Med Base architecture planning.
          </div>
        </aside>

        <main className="grid gap-6 px-6 py-8 xl:px-10">
          {activeModule === "Dashboard" && (
            <DashboardModule
              setActiveModule={setActiveModule}
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
              messageError={messageError}
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
    "Fictional records only",
  ];

  return (
    <main className="min-h-dvh bg-white text-foreground">
      <PreviewBanner />
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
            Preview
          </StatusPill>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
            Med Base coordinates healthcare operations without becoming an EHR
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            A modular SaaS platform for scheduling, staff messaging, reminders,
            forms, tasks, and operational visibility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openCreateAccount}>Create account</Button>
            <Button variant="secondary" onClick={openLogin}>
              Log in
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
            The preview uses fictional data only.
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
                Preview workflow stage.
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
                "Easy to evaluate and expand",
                "Role-based architecture",
                "Supabase-ready foundation",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-white p-4">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Built for production architecture while protecting clinical scope.
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
              Preview - No Real Patient Data.
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
  authNotice,
  isSupabaseConfigured,
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
  authNotice: string;
  isSupabaseConfigured: boolean;
  onBack: () => void;
  role: Role;
  setAuthForm: (form: { email: string; password: string; confirmPassword: string }) => void;
  setAuthMode: (mode: "login" | "create") => void;
  setRole: (role: Role) => void;
  submit: () => void | Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isCreate = authMode === "create";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
        <PreviewBanner />
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
          Role-based access for Med Base workflow coordination.
        </p>
        <p className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-xs leading-5 text-primary">
          {isSupabaseConfigured
            ? "Supabase authentication is active."
            : `Supabase keys are not configured yet. Missing: ${env.missingSupabaseKeys.join(
                ", ",
              )}. This form will run in preview mode until keys are added.`}
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

          {authNotice ? (
            <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              {authNotice}
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
  setActiveModule,
}: {
  setActiveModule: (module: Module) => void;
}) {
  const dashboardAppointments = [
    {
      time: "09:00 AM",
      title: "Jordan Avery",
      subtitle: "Pre-visit forms pending",
      tag: "Primary Care",
    },
    {
      time: "10:30 AM",
      title: "Maya Chen",
      subtitle: "Reminder confirmed by text",
      tag: "Pediatrics",
    },
    {
      time: "01:15 PM",
      title: "Noah Bennett",
      subtitle: "Insurance verification queued",
      tag: "Cardiology",
    },
    {
      time: "03:45 PM",
      title: "Elena Brooks",
      subtitle: "Follow-up scheduling note added",
      tag: "General Med",
    },
  ];

  const dashboardNotifications = [
    {
      title: "Two appointments need reminder review before noon.",
      time: "Just Now",
      tone: "urgent",
    },
    {
      title: "New group message summary is waiting for task approval.",
      time: "30 minutes ago",
      tone: "normal",
    },
    {
      title: "Shift note posted for front desk coverage.",
      time: "1 hour ago",
      tone: "normal",
    },
  ];

  const rosterRows = [
    {
      title: "Dr. Priya Foster",
      subtitle: "On duty since 7:45 AM",
      tag: "Primary Care",
      active: true,
    },
    {
      title: "Lena Ortiz, RN",
      subtitle: "On duty since 8:00 AM",
      tag: "Cardiology",
      active: true,
    },
    {
      title: "Marcus Reid, MA",
      subtitle: "Rooming support active",
      tag: "Outpatient",
      active: true,
    },
    {
      title: "Avery Singh",
      subtitle: "Next shift starts at 12:00 PM",
      tag: "Radiology",
      active: false,
    },
  ];

  const activityRows = [
    {
      title: "Front desk updated appointment status",
      subtitle: "Reminder outcome changed to confirmed",
      time: "8 mins ago",
    },
    {
      title: "Scheduler moved a follow-up visit",
      subtitle: "Moved from 2:30 PM to 3:45 PM",
      time: "25 mins ago",
    },
    {
      title: "Digital intake packet completed",
      subtitle: "Ready for staff review before check-in",
      time: "1 hour ago",
    },
    {
      title: "Insurance verification marked reviewed",
      subtitle: "Office manager approved workflow note",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon="[]"
          label="Today's Appointments"
          value="12"
        />
        <DashboardStatCard icon="+o" label="Staff on Shift" value="8" />
        <DashboardStatCard icon="[]" label="Pending Tasks" value="5" />
        <DashboardStatCard
          danger
          icon="!"
          label="Overdue Tasks"
          value="3"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <DashboardPanel
          badge="12"
          cta="View Calendar"
          onCta={() => setActiveModule("Scheduling")}
          title="Today's Appointments"
        >
          <div className="grid gap-4">
            {dashboardAppointments.map((appointment) => (
              <div
                key={appointment.time}
                className="grid items-center gap-4 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[118px_minmax(0,1fr)_auto]"
              >
                <span className="rounded-md bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">
                  {appointment.time}
                </span>
                <div>
                  <p className="text-lg font-semibold">{appointment.title}</p>
                  <p className="text-base text-muted-foreground">{appointment.subtitle}</p>
                </div>
                <StatusPill>{appointment.tag}</StatusPill>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          badge="3"
          cta="Mark All as Read"
          title="Notifications"
        >
          <div className="grid gap-4">
            {dashboardNotifications.map((notification) => (
              <div
                key={notification.title}
                className={`grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-lg p-4 ${
                  notification.tone === "urgent"
                    ? "bg-red-50 text-red-700"
                    : "bg-[#f0f0f0] text-foreground"
                }`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full border-2 text-xs font-bold ${
                    notification.tone === "urgent"
                      ? "border-red-500 text-red-500"
                      : "border-primary text-primary"
                  }`}
                >
                  !
                </span>
                <div>
                  <p className="text-base font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <DashboardPanel badge="8" cta="Manage Roster" title="Staff on Shift">
          <div className="grid gap-4">
            {rosterRows.map((row) => (
              <div
                key={row.title}
                className="grid items-center gap-4 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                  <span
                    className={`mt-2 size-3 rounded-full ${
                      row.active ? "bg-emerald-500" : "bg-slate-500"
                    }`}
                  />
                  <div>
                    <p className="text-lg font-semibold">{row.title}</p>
                    <p className="text-base text-muted-foreground">{row.subtitle}</p>
                  </div>
                </div>
                <StatusPill
                  className={
                    row.active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  }
                >
                  {row.tag}
                </StatusPill>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          cta="View Audit Log"
          onCta={() => setActiveModule("Analytics")}
          title="Recent Activity"
        >
          <div className="grid gap-4">
            {activityRows.map((row) => (
              <div
                key={row.title}
                className="grid gap-3 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[minmax(0,1fr)_130px]"
              >
                <div>
                  <p className="text-base font-semibold">{row.title}</p>
                  <p className="mt-1 text-base text-muted-foreground">{row.subtitle}</p>
                </div>
                <p className="text-right text-sm text-muted-foreground">{row.time}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
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
      description="Outpatient clinic and SNF scheduling with draggable schedule events."
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
  messageError,
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
  messageError: string;
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
              <label className="mt-3 grid gap-1 text-sm font-medium">
                <span>Group name</span>
                <input
                  className={`${inputClassName} w-full`}
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                />
              </label>
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
              <label className="grid gap-1 text-sm font-medium">
                <span>Internal operational message</span>
                <textarea
                  className="min-h-28 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={chatDraft}
                  onChange={(event) => {
                    setChatDraft(event.target.value);
                    setMessageError("");
                  }}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Do not enter real patient data.
              </p>
              {messageError ? (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {messageError}
                </p>
              ) : null}
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
                  <strong>Summary:</strong> Conversation contains operational
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
            "Policy reminder posted for all staff.",
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
      description="Organization and role-management controls for future expansion."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBlock
          title="Organization Information"
          lines={["Med Base Operations Group", "Multi-site workflow preview"]}
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
          lines={["Invite staff", "Deactivate user", "Assign department"]}
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
      <Image
        alt="Med Base"
        className={compact ? "h-14 w-auto" : "h-16 w-auto"}
        height={compact ? 56 : 64}
        priority={compact}
        src="/medbase-logo.png"
        width={compact ? 168 : 192}
      />
      <span className="sr-only">Med Base</span>
    </span>
  );
}

function PreviewBanner() {
  return (
    <div className="bg-primary px-4 py-2 text-center text-xs font-semibold uppercase text-primary-foreground">
      {previewBanner}
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

function DashboardStatCard({
  danger = false,
  icon,
  label,
  value,
}: {
  danger?: boolean;
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <article className="grid min-h-28 grid-cols-[minmax(0,1fr)_64px] items-center gap-4 rounded-xl border border-[#dfe6ee] bg-white p-6 shadow-sm">
      <div>
        <p className="text-base font-semibold text-muted-foreground">{label}</p>
        <p
          className={`mt-3 text-5xl font-semibold leading-none ${
            danger ? "text-red-500" : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
      <span
        className={`grid size-14 place-items-center rounded-full text-xl font-bold ${
          danger ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
    </article>
  );
}

function DashboardPanel({
  badge,
  children,
  cta,
  onCta,
  title,
}: {
  badge?: string;
  children: ReactNode;
  cta?: string;
  onCta?: () => void;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[#dfe6ee] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe6ee] pb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {badge ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              {badge}
            </span>
          ) : null}
        </div>
        {cta ? (
          <button
            className="text-base font-semibold text-primary transition hover:opacity-80"
            type="button"
            onClick={onCta}
          >
            {cta}
          </button>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
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
