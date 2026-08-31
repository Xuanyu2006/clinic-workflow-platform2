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

type CommunicationBoardKey = "announcements" | "shiftNotes" | "dailyReminders";

type CommunicationBoards = Record<CommunicationBoardKey, string[]>;

type NotificationPreferences = {
  taskApprovals: boolean;
  overdueTasks: boolean;
  scheduleChanges: boolean;
  teamMessages: boolean;
  dailyDigest: boolean;
};

type UserPreferenceSettings = {
  organizationName: string;
  defaultDepartment: string;
  timezone: string;
  dateFormat: string;
  theme: string;
  compactMode: boolean;
  privacyMode: boolean;
  sessionTimeout: string;
  notifications: NotificationPreferences;
};

type PendingInvite = {
  id: string;
  email: string;
  role: Role;
  department: string;
};

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

const staffDirectory: { name: string; role: Role; department: string }[] = [];

const initialTasks: Task[] = [];

const initialScheduleEvents: ScheduleEvent[] = [];

const initialChats: TeamChat[] = [];

const initialCommunicationBoards: CommunicationBoards = {
  announcements: [],
  shiftNotes: [],
  dailyReminders: [],
};

const initialUserSettings: UserPreferenceSettings = {
  organizationName: "Med Base",
  defaultDepartment: "Front Desk",
  timezone: "America/Los_Angeles",
  dateFormat: "MM/DD/YYYY",
  theme: "Healthcare light",
  compactMode: false,
  privacyMode: true,
  sessionTimeout: "30",
  notifications: {
    taskApprovals: true,
    overdueTasks: true,
    scheduleChanges: true,
    teamMessages: true,
    dailyDigest: false,
  },
};

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

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function formatScheduleDay(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(value),
  );
}

function formatScheduleTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDueDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseRelativeDueDate(value: string) {
  const dueAt = new Date();
  const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!timeMatch) {
    return dueAt.toISOString();
  }

  const rawHour = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const isPm = timeMatch[3].toLowerCase() === "pm";
  const hours = rawHour === 12 ? (isPm ? 12 : 0) : isPm ? rawHour + 12 : rawHour;
  dueAt.setHours(hours, minutes, 0, 0);

  return dueAt.toISOString();
}

function dateForWeekday(day: string, time: string) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDay = weekdays.indexOf(day);
  const nextDate = new Date();
  const dayDelta = targetDay >= 0 ? (targetDay - nextDate.getDay() + 7) % 7 : 0;
  nextDate.setDate(nextDate.getDate() + dayDelta);

  const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    const rawHour = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const isPm = timeMatch[3].toLowerCase() === "pm";
    const hours = rawHour === 12 ? (isPm ? 12 : 0) : isPm ? rawHour + 12 : rawHour;
    nextDate.setHours(hours, minutes, 0, 0);
  }

  return nextDate.toISOString();
}

export function MedBaseDashboard() {
  const supabase = useMemo(() => createOptionalClient(), []);
  const [userEmail, setUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentOrganizationId, setCurrentOrganizationId] = useState(previewOrganizationId);
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
    organizationName: "",
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
  const [communicationBoards, setCommunicationBoards] = useState(
    initialCommunicationBoards,
  );
  const [communicationDrafts, setCommunicationDrafts] = useState<
    Record<CommunicationBoardKey, string>
  >({
    announcements: "",
    shiftNotes: "",
    dailyReminders: "",
  });
  const [communicationError, setCommunicationError] = useState("");
  const [departments, setDepartments] = useState(departmentOptions);
  const [newDepartment, setNewDepartment] = useState("");
  const [userSettings, setUserSettings] = useState(initialUserSettings);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [staffMembers, setStaffMembers] = useState<
    { name: string; role: Role; department: string }[]
  >(staffDirectory);
  const [inviteDraft, setInviteDraft] = useState({
    email: "",
    role: "Front Desk" as Role,
    department: departmentOptions[0],
  });
  const [chatDraft, setChatDraft] = useState("");
  const [messageError, setMessageError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupParticipants, setNewGroupParticipants] = useState<string[]>([]);
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
    setCurrentUserId(user.id);
    setAuthStatus("signed-in");
    setAuthView("landing");

    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const organizationId = data?.organization_id ?? previewOrganizationId;
    setCurrentOrganizationId(organizationId);

    if (data?.role) {
      setRole(data.role as Role);
    }

    await loadWorkspaceData(user.id, organizationId);
  }

  async function loadWorkspaceData(userId: string, organizationId: string) {
    if (!supabase) {
      return;
    }

    const [
      tasksResult,
      scheduleResult,
      conversationsResult,
      messagesResult,
      communicationResult,
      departmentsResult,
      settingsResult,
      profilesResult,
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("schedule_events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("starts_at", { ascending: true }),
      supabase
        .from("conversations")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("communication_posts")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("organization_departments")
        .select("name")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true }),
      supabase.from("user_settings").select("settings").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_profiles")
        .select("email, full_name, role, department")
        .eq("organization_id", organizationId)
        .order("email", { ascending: true }),
    ]);

    if (tasksResult.data) {
      setTasks(
        tasksResult.data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignedStaff: task.assigned_staff ?? "Unassigned",
          department: task.department ?? "Administration",
          priority: task.priority,
          dueDate: formatDueDate(task.due_at),
          status: task.status,
          notes: task.notes,
          completionTimestamp: task.completion_timestamp
            ? formatDueDate(task.completion_timestamp)
            : "",
        })),
      );
    }

    if (scheduleResult.data) {
      setScheduleEvents(
        scheduleResult.data.map((event) => ({
          id: event.id,
          title: event.title,
          owner: event.owner,
          day: formatScheduleDay(event.starts_at),
          time: formatScheduleTime(event.starts_at),
          type: event.event_type,
        })),
      );
    }

    if (conversationsResult.data && messagesResult.data) {
      setTeamChats(
        conversationsResult.data.map((conversation) => ({
          id: conversation.id,
          name: conversation.name,
          type: conversation.chat_type,
          participants: [],
          messages: messagesResult.data
            .filter((message) => message.conversation_id === conversation.id)
            .map((message) => ({
              id: message.id,
              author: "Team member",
              role,
              text: message.body,
              time: formatScheduleTime(message.created_at),
            })),
        })),
      );
      setSelectedChatId(conversationsResult.data[0]?.id ?? "");
    }

    if (communicationResult.data) {
      const nextBoards: CommunicationBoards = {
        announcements: [],
        shiftNotes: [],
        dailyReminders: [],
      };
      communicationResult.data.forEach((post) => {
        if (
          post.board_key === "announcements" ||
          post.board_key === "shiftNotes" ||
          post.board_key === "dailyReminders"
        ) {
          const boardKey = post.board_key as CommunicationBoardKey;
          nextBoards[boardKey].push(post.body);
        }
      });
      setCommunicationBoards(nextBoards);
    }

    if (departmentsResult.data && departmentsResult.data.length > 0) {
      setDepartments(departmentsResult.data.map((department) => department.name));
    }

    if (
      settingsResult.data?.settings &&
      typeof settingsResult.data.settings === "object" &&
      !Array.isArray(settingsResult.data.settings)
    ) {
      setUserSettings({
        ...initialUserSettings,
        ...(settingsResult.data.settings as Partial<UserPreferenceSettings>),
      });
    }

    if (profilesResult.data) {
      const nextStaffMembers = profilesResult.data.map((profile) => ({
          name: profile.full_name || profile.email,
          role: profile.role as Role,
          department: profile.department || "Unassigned",
        }));
      setStaffMembers(nextStaffMembers);
      setParticipantToAdd(nextStaffMembers[0]?.name ?? "");
    }
  }

  async function writeAuditLog(
    action: string,
    resourceType: string,
    resourceId?: string,
  ) {
    if (!supabase || !currentUserId) {
      return;
    }

    await supabase.from("audit_logs").insert({
      organization_id: currentOrganizationId,
      actor_id: currentUserId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }

  async function ensureUserProfile(user: User, selectedRole: Role) {
    if (!supabase || !user.email) {
      return;
    }

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from("user_profiles")
        .update({ email: user.email })
        .eq("id", user.id);
      return;
    }

    await supabase.from("user_profiles").insert({
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

    if (authMode === "create" && !isStrongPassword(authForm.password)) {
      setAuthError(
        "Password must be at least 8 characters and include a letter, number, and special character.",
      );
      return;
    }

    if (authMode === "login" && authForm.password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    if (authMode === "create" && authForm.password !== authForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (authMode === "create" && !authForm.organizationName.trim()) {
      setAuthError("Enter your company or clinic name to create a workspace.");
      return;
    }

    if (!supabase) {
      setUserEmail(authForm.email);
      setAuthNotice(
        "Preview mode is active because Supabase environment variables are not configured yet.",
      );
      setAuthStatus("signed-in");
      setAuthError("");
      setAuthForm({ email: "", password: "", confirmPassword: "", organizationName: "" });
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
            organization_name: authForm.organizationName.trim(),
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
        setAuthForm({ email: "", password: "", confirmPassword: "", organizationName: "" });
        return;
      }

      await loadAuthenticatedUser(data.session.user);
      setAuthForm({ email: "", password: "", confirmPassword: "", organizationName: "" });
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

    setAuthForm({ email: "", password: "", confirmPassword: "", organizationName: "" });
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

  async function moveScheduleEvent(eventId: string, day: string) {
    const eventToMove = scheduleEvents.find((event) => event.id === eventId);

    setScheduleEvents((current) =>
      current.map((event) => (event.id === eventId ? { ...event, day } : event)),
    );

    if (supabase && eventToMove) {
      await supabase
        .from("schedule_events")
        .update({ starts_at: dateForWeekday(day, eventToMove.time) })
        .eq("id", eventId);
    }

    await writeAuditLog("schedule_event.moved", "schedule_events", eventId);
  }

  async function sendTeamMessage() {
    if (!selectedChatId) {
      setMessageError("Create or select a conversation before sending a message.");
      return;
    }

    if (!chatDraft.trim()) {
      setMessageError("Enter a message before sending.");
      return;
    }

    if (containsRestrictedPatientData(chatDraft)) {
      setMessageError(restrictedDataWarning);
      return;
    }

    let persistedMessageId = `MSG-${Date.now()}`;

    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          organization_id: currentOrganizationId,
          conversation_id: selectedChatId,
          author_id: currentUserId || null,
          body: chatDraft,
        })
        .select("id")
        .single();

      if (error) {
        setMessageError(error.message);
        return;
      }

      persistedMessageId = data.id;
      await writeAuditLog("message.created", "messages", persistedMessageId);
    }

    setTeamChats((current) =>
      current.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: persistedMessageId,
                  author: userEmail || "Current user",
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

  async function createGroupChat() {
    if (!newGroupName.trim()) {
      return;
    }

    let newChatId = `CHAT-${Date.now()}`;

    if (supabase) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          organization_id: currentOrganizationId,
          name: newGroupName.trim(),
          chat_type: "Group",
          created_by: currentUserId || null,
        })
        .select("id")
        .single();

      if (error) {
        setMessageError(error.message);
        return;
      }

      newChatId = data.id;
      await writeAuditLog("conversation.created", "conversations", newChatId);
    }

    const newChat: TeamChat = {
      id: newChatId,
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

  async function approveSuggestedTask() {
    if (!summarySuggestion) {
      return;
    }

    let taskId = `TASK-${String(tasks.length + 1).padStart(3, "0")}`;
    const dueAt = parseRelativeDueDate(summarySuggestion.dueDate);

    if (supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          organization_id: currentOrganizationId,
          title: summarySuggestion.title,
          description: summarySuggestion.description,
          assigned_staff: "Unassigned",
          department: "Administration",
          priority: summarySuggestion.priority,
          due_at: dueAt,
          status: "Pending Approval",
          notes: "Generated from a team chat summary. Must be reviewed by a human.",
          created_by: currentUserId || null,
        })
        .select("id")
        .single();

      if (!error) {
        taskId = data.id;
        await writeAuditLog("task.created_from_summary", "tasks", taskId);
      }
    }

    setTasks((current) => [
      {
        id: taskId,
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

  async function addCommunicationPost(board: CommunicationBoardKey) {
    const value = communicationDrafts[board].trim();

    if (!value) {
      setCommunicationError("Enter a message before adding it to the board.");
      return;
    }

    if (containsRestrictedPatientData(value)) {
      setCommunicationError(restrictedDataWarning);
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("communication_posts")
        .insert({
          organization_id: currentOrganizationId,
          board_key: board,
          body: value,
          created_by: currentUserId || null,
        })
        .select("id")
        .single();

      if (error) {
        setCommunicationError(error.message);
        return;
      }

      await writeAuditLog("communication_post.created", "communication_posts", data.id);
    }

    setCommunicationBoards((current) => ({
      ...current,
      [board]: [value, ...current[board]],
    }));
    setCommunicationDrafts((current) => ({ ...current, [board]: "" }));
    setCommunicationError("");
  }

  function updateUserSettings(nextSettings: UserPreferenceSettings) {
    setUserSettings(nextSettings);

    if (supabase && currentUserId) {
      void supabase.from("user_settings").upsert({
        user_id: currentUserId,
        organization_id: currentOrganizationId,
        settings: nextSettings,
      });
    }
  }

  function updateNotificationPreference(
    preference: keyof NotificationPreferences,
    value: boolean,
  ) {
    const nextSettings = {
      ...userSettings,
      notifications: {
        ...userSettings.notifications,
        [preference]: value,
      },
    };
    updateUserSettings(nextSettings);
  }

  async function addDepartment() {
    const value = newDepartment.trim();

    if (!value || departments.includes(value)) {
      return;
    }

    if (supabase) {
      const { error } = await supabase.from("organization_departments").insert({
        organization_id: currentOrganizationId,
        name: value,
        created_by: currentUserId || null,
      });

      if (error) {
        return;
      }

      await writeAuditLog("department.created", "organization_departments");
    }

    setDepartments((current) => [...current, value]);
    setNewDepartment("");
  }

  async function removeDepartment(department: string) {
    if (supabase) {
      await supabase
        .from("organization_departments")
        .delete()
        .eq("organization_id", currentOrganizationId)
        .eq("name", department);
      await writeAuditLog("department.deleted", "organization_departments");
    }

    setDepartments((current) => current.filter((item) => item !== department));
    if (userSettings.defaultDepartment === department) {
      updateUserSettings({
        ...userSettings,
        defaultDepartment: departments.find((item) => item !== department) ?? "",
      });
    }
  }

  async function addPendingInvite() {
    const email = inviteDraft.email.trim();

    if (!email) {
      return;
    }

    if (supabase) {
      await supabase.from("notification_outbox").insert({
        organization_id: currentOrganizationId,
        channel: "email",
        recipient: email,
        subject: "Med Base invite draft",
        body: `Invite ${email} as ${inviteDraft.role} in ${inviteDraft.department}.`,
        status: "Draft",
        created_by: currentUserId || null,
      });
      await writeAuditLog("invite_draft.created", "notification_outbox");
    }

    setPendingInvites((current) => [
      {
        id: `INV-${Date.now()}`,
        email,
        role: inviteDraft.role,
        department: inviteDraft.department,
      },
      ...current,
    ]);
    setInviteDraft((current) => ({ ...current, email: "" }));
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    const completionTimestamp =
      status === "Completed" ? new Date().toLocaleString() : "";

    if (supabase) {
      const completedAt =
        status === "Completed" ? new Date().toISOString() : null;
      await supabase
        .from("tasks")
        .update({
          status,
          completion_timestamp: completedAt,
        })
        .eq("id", id);
      await writeAuditLog("task.status_updated", "tasks", id);
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              completionTimestamp,
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
              scheduleEvents={scheduleEvents}
              setActiveModule={setActiveModule}
              tasks={tasks}
              teamChats={teamChats}
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
              setMessageError={setMessageError}
              setNewGroupName={setNewGroupName}
              setParticipantToAdd={setParticipantToAdd}
              staffDirectory={staffMembers}
              summarySuggestion={summarySuggestion}
              teamChats={teamChats}
              toggleGroupParticipant={toggleGroupParticipant}
            />
          )}
          {activeModule === "Communication" && (
            <CommunicationModule
              addCommunicationPost={addCommunicationPost}
              communicationBoards={communicationBoards}
              communicationDrafts={communicationDrafts}
              communicationError={communicationError}
              setCommunicationDrafts={setCommunicationDrafts}
            />
          )}
          {activeModule === "Analytics" && (
            <AnalyticsModule
              scheduleEvents={scheduleEvents}
              tasks={tasks}
              teamChats={teamChats}
            />
          )}
          {activeModule === "Settings" && (
            <SettingsModule
              addDepartment={addDepartment}
              addPendingInvite={addPendingInvite}
              departments={departments}
              inviteDraft={inviteDraft}
              newDepartment={newDepartment}
              pendingInvites={pendingInvites}
              removeDepartment={removeDepartment}
              setInviteDraft={setInviteDraft}
              setNewDepartment={setNewDepartment}
              setUserSettings={setUserSettings}
              updateNotificationPreference={updateNotificationPreference}
              userSettings={userSettings}
            />
          )}
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
    "Scoped workflows",
  ];

  return (
    <main className="min-h-dvh bg-white text-foreground">
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
            Healthcare operations
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
                Configurable workflow stage.
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
              Healthcare workflow coordination for modern teams.
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
  authForm: {
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
  };
  authMode: "login" | "create";
  authNotice: string;
  isSupabaseConfigured: boolean;
  onBack: () => void;
  role: Role;
  setAuthForm: (form: {
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
  }) => void;
  setAuthMode: (mode: "login" | "create") => void;
  setRole: (role: Role) => void;
  submit: () => void | Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isCreate = authMode === "create";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
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

          {isCreate ? (
            <Field label="Company or clinic name">
              <input
                autoComplete="organization"
                className={inputClassName}
                type="text"
                value={authForm.organizationName}
                onChange={(event) =>
                  setAuthForm({
                    ...authForm,
                    organizationName: event.target.value,
                  })
                }
              />
            </Field>
          ) : null}

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
            {isCreate ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Use at least 8 characters with a letter, number, and special
                character.
              </p>
            ) : null}
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
  scheduleEvents,
  setActiveModule,
  tasks,
  teamChats,
}: {
  scheduleEvents: ScheduleEvent[];
  setActiveModule: (module: Module) => void;
  tasks: Task[];
  teamChats: TeamChat[];
}) {
  const appointmentEvents = scheduleEvents.filter(
    (event) => event.type === "Clinic" || event.type === "SNF",
  );
  const shiftEvents = scheduleEvents.filter((event) => event.type === "Staff Shift");
  const pendingTasks = tasks.filter(
    (task) => task.status !== "Completed" && task.status !== "Cancelled",
  );
  const overdueTasks = tasks.filter((task) => task.status === "Overdue");
  const recentMessages = teamChats.flatMap((chat) =>
    chat.messages.map((message) => ({
      chatName: chat.name,
      ...message,
    })),
  );
  const notifications = [
    ...overdueTasks.map((task) => ({
      title: `Overdue task: ${task.title}`,
      time: task.dueDate,
      tone: "urgent" as const,
    })),
    ...pendingTasks.slice(0, 2).map((task) => ({
      title: `Pending task: ${task.title}`,
      time: task.dueDate,
      tone: "normal" as const,
    })),
  ];

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon="[]"
          label="Today's Appointments"
          value={String(appointmentEvents.length)}
        />
        <DashboardStatCard
          icon="+o"
          label="Staff on Shift"
          value={String(shiftEvents.length)}
        />
        <DashboardStatCard
          icon="[]"
          label="Pending Tasks"
          value={String(pendingTasks.length)}
        />
        <DashboardStatCard
          danger
          icon="!"
          label="Overdue Tasks"
          value={String(overdueTasks.length)}
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <DashboardPanel
          badge={String(appointmentEvents.length)}
          cta="View Calendar"
          onCta={() => setActiveModule("Scheduling")}
          title="Today's Appointments"
        >
          <div className="grid gap-4">
            {appointmentEvents.length === 0 ? (
              <EmptyState message="No appointments have been scheduled yet." />
            ) : (
              appointmentEvents.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid items-center gap-4 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[118px_minmax(0,1fr)_auto]"
                >
                  <span className="rounded-md bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">
                    {appointment.time}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{appointment.title}</p>
                    <p className="text-base text-muted-foreground">
                      {appointment.owner}
                    </p>
                  </div>
                  <StatusPill>{appointment.type}</StatusPill>
                </div>
              ))
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          badge={String(notifications.length)}
          cta="Mark All as Read"
          title="Notifications"
        >
          <div className="grid gap-4">
            {notifications.length === 0 ? (
              <EmptyState message="No notifications yet." />
            ) : (
              notifications.map((notification) => (
                <div
                  key={`${notification.title}-${notification.time}`}
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
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <DashboardPanel
          badge={String(shiftEvents.length)}
          cta="Manage Roster"
          title="Staff on Shift"
        >
          <div className="grid gap-4">
            {shiftEvents.length === 0 ? (
              <EmptyState message="No staff shifts have been added yet." />
            ) : (
              shiftEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid items-center gap-4 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
                    <span className="mt-2 size-3 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-lg font-semibold">{event.owner}</p>
                      <p className="text-base text-muted-foreground">
                        {event.day} at {event.time}
                      </p>
                    </div>
                  </div>
                  <StatusPill className="bg-emerald-50 text-emerald-700 ring-emerald-100">
                    {event.title}
                  </StatusPill>
                </div>
              ))
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          cta="View Audit Log"
          onCta={() => setActiveModule("Analytics")}
          title="Recent Activity"
        >
          <div className="grid gap-4">
            {recentMessages.length === 0 ? (
              <EmptyState message="No recent activity yet." />
            ) : (
              recentMessages.slice(-4).map((message) => (
                <div
                  key={message.id}
                  className="grid gap-3 rounded-lg bg-[#f0f0f0] p-4 md:grid-cols-[minmax(0,1fr)_130px]"
                >
                  <div>
                    <p className="text-base font-semibold">{message.chatName}</p>
                    <p className="mt-1 text-base text-muted-foreground">
                      Message from {message.author}
                    </p>
                  </div>
                  <p className="text-right text-sm text-muted-foreground">
                    {message.time}
                  </p>
                </div>
              ))
            )}
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
              {scheduleEvents.filter((event) => event.day === day).length === 0 ? (
                <EmptyState message="No schedule items." />
              ) : (
                scheduleEvents
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
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock
          title="Provider schedules"
          lines={scheduleEvents
            .filter((event) => event.type === "Clinic")
            .map((event) => `${event.owner} - ${event.title}`)}
        />
        <InfoBlock
          title="Staff schedules"
          lines={scheduleEvents
            .filter((event) => event.type === "Staff Shift")
            .map((event) => `${event.owner} - ${event.title}`)}
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
  setMessageError,
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
  setMessageError: (value: string) => void;
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
                {staffDirectory.length === 0 ? (
                  <EmptyState message="No staff users loaded yet. Create invite drafts in Settings or connect user profiles from Supabase." />
                ) : (
                  staffDirectory.map((staff) => (
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
                  ))
                )}
              </div>
              <Button className="mt-3 w-full" onClick={createGroupChat}>
                Create group
              </Button>
            </div>

            {teamChats.length === 0 ? (
              <EmptyState message="No conversations yet. Create a group to start messaging." />
            ) : (
              teamChats.map((chat) => (
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
                    {chat.type} -{" "}
                    {chat.participants.length > 0
                      ? chat.participants.join(", ")
                      : "No participants added"}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">
                {selectedChat?.name ?? "Select a chat"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedChat
                  ? `${selectedChat.type} chat - ${
                      selectedChat.participants.length > 0
                        ? selectedChat.participants.join(", ")
                        : "No participants added"
                    }`
                  : "Choose a direct message or group chat."}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <select
                  className={inputClassName}
                  disabled={staffDirectory.length === 0}
                  value={participantToAdd}
                  onChange={(event) => setParticipantToAdd(event.target.value)}
                >
                  {staffDirectory.length === 0 ? (
                    <option value="">No staff users loaded</option>
                  ) : (
                    staffDirectory.map((staff) => (
                      <option key={staff.name} value={staff.name}>
                        {staff.name} - {staff.role}
                      </option>
                    ))
                  )}
                </select>
                <Button
                  variant="secondary"
                  onClick={addParticipantToChat}
                  disabled={staffDirectory.length === 0}
                >
                  Add person
                </Button>
              </div>
            </div>

            <div className="grid max-h-[420px] gap-3 overflow-auto p-4">
              {!selectedChat ? (
                <EmptyState message="Select or create a conversation." />
              ) : selectedChat.messages.length === 0 ? (
                <EmptyState message="No messages yet." />
              ) : (
                selectedChat.messages.map((message) => (
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
                ))
              )}
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

function CommunicationModule({
  addCommunicationPost,
  communicationBoards,
  communicationDrafts,
  communicationError,
  setCommunicationDrafts,
}: {
  addCommunicationPost: (board: CommunicationBoardKey) => void;
  communicationBoards: CommunicationBoards;
  communicationDrafts: Record<CommunicationBoardKey, string>;
  communicationError: string;
  setCommunicationDrafts: (
    value: Record<CommunicationBoardKey, string>,
  ) => void;
}) {
  const boards: {
    key: CommunicationBoardKey;
    title: string;
    description: string;
  }[] = [
    {
      key: "announcements",
      title: "Announcements",
      description: "Organization-wide operational updates.",
    },
    {
      key: "shiftNotes",
      title: "Shift Notes",
      description: "Handoff notes for staff coverage and workflow status.",
    },
    {
      key: "dailyReminders",
      title: "Daily Reminders",
      description: "Non-clinical reminders for the current workday.",
    },
  ];

  return (
    <Panel
      title="Communication Boards"
      description="Announcements, shift notes, and daily reminders separate from staff texting."
    >
      {communicationError ? (
        <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {communicationError}
        </p>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.key}
            className="rounded-lg border border-border bg-background p-4"
          >
            <h3 className="font-semibold">{board.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {board.description}
            </p>
            <textarea
              className="mt-4 min-h-28 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={communicationDrafts[board.key]}
              onChange={(event) =>
                setCommunicationDrafts({
                  ...communicationDrafts,
                  [board.key]: event.target.value,
                })
              }
            />
            <Button className="mt-3 w-full" onClick={() => addCommunicationPost(board.key)}>
              Add update
            </Button>
            <div className="mt-4">
              <StackedList items={communicationBoards[board.key]} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AnalyticsModule({
  scheduleEvents,
  tasks,
  teamChats,
}: {
  scheduleEvents: ScheduleEvent[];
  tasks: Task[];
  teamChats: TeamChat[];
}) {
  const completedTasks = tasks.filter((task) => task.status === "Completed");
  const activeTasks = tasks.filter(
    (task) => task.status !== "Completed" && task.status !== "Cancelled",
  );
  const messages = teamChats.reduce(
    (total, chat) => total + chat.messages.length,
    0,
  );
  const taskCompletionRate =
    tasks.length === 0
      ? "No data"
      : `${Math.round((completedTasks.length / tasks.length) * 100)}%`;
  const staffWorkload =
    activeTasks.length === 0
      ? "No active tasks"
      : activeTasks.length > 8
        ? "High"
        : activeTasks.length > 3
          ? "Moderate"
          : "Light";
  const metrics = [
    {
      label: "Appointment volume",
      value: String(
        scheduleEvents.filter(
          (event) => event.type === "Clinic" || event.type === "SNF",
        ).length,
      ),
      detail: "Scheduled appointment-related events.",
    },
    {
      label: "No-show rate",
      value: "No data",
      detail: "Connect appointment outcomes before calculating this metric.",
    },
    {
      label: "Average wait time",
      value: "No data",
      detail: "Connect check-in timestamps before calculating this metric.",
    },
    {
      label: "Task completion rate",
      value: taskCompletionRate,
      detail: `${completedTasks.length} of ${tasks.length} tasks completed.`,
    },
    {
      label: "Staff workload",
      value: staffWorkload,
      detail: `${activeTasks.length} active tasks across the workspace.`,
    },
    {
      label: "Team message volume",
      value: String(messages),
      detail: "Internal operational messages only.",
    },
  ];

  return (
    <Panel
      title="Analytics"
      description="Operational metrics only. No medical information or billing data."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SettingsModule({
  addDepartment,
  addPendingInvite,
  departments,
  inviteDraft,
  newDepartment,
  pendingInvites,
  removeDepartment,
  setInviteDraft,
  setNewDepartment,
  setUserSettings,
  updateNotificationPreference,
  userSettings,
}: {
  addDepartment: () => void;
  addPendingInvite: () => void;
  departments: string[];
  inviteDraft: { email: string; role: Role; department: string };
  newDepartment: string;
  pendingInvites: PendingInvite[];
  removeDepartment: (department: string) => void;
  setInviteDraft: (value: { email: string; role: Role; department: string }) => void;
  setNewDepartment: (value: string) => void;
  setUserSettings: (value: UserPreferenceSettings) => void;
  updateNotificationPreference: (
    preference: keyof NotificationPreferences,
    value: boolean,
  ) => void;
  userSettings: UserPreferenceSettings;
}) {
  const notificationOptions: {
    key: keyof NotificationPreferences;
    label: string;
  }[] = [
    { key: "taskApprovals", label: "Task approvals" },
    { key: "overdueTasks", label: "Overdue tasks" },
    { key: "scheduleChanges", label: "Schedule changes" },
    { key: "teamMessages", label: "Team messages" },
    { key: "dailyDigest", label: "Daily digest" },
  ];

  return (
    <Panel
      title="Settings"
      description="Operational preferences, access controls, and privacy defaults for Med Base."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">Organization</h3>
          <div className="mt-4 grid gap-3">
            <Field label="Organization name">
              <input
                className={inputClassName}
                value={userSettings.organizationName}
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    organizationName: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Default department">
              <select
                className={inputClassName}
                value={userSettings.defaultDepartment}
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    defaultDepartment: event.target.value,
                  })
                }
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Timezone">
              <select
                className={inputClassName}
                value={userSettings.timezone}
                onChange={(event) =>
                  setUserSettings({ ...userSettings, timezone: event.target.value })
                }
              >
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/New_York">Eastern Time</option>
              </select>
            </Field>
            <Field label="Date format">
              <select
                className={inputClassName}
                value={userSettings.dateFormat}
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    dateFormat: event.target.value,
                  })
                }
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">Departments</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              className={inputClassName}
              value={newDepartment}
              onChange={(event) => setNewDepartment(event.target.value)}
            />
            <Button onClick={addDepartment}>Add</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {departments.map((department) => (
              <button
                key={department}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                type="button"
                onClick={() => removeDepartment(department)}
              >
                {department} x
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">Notifications</h3>
          <div className="mt-4 grid gap-3">
            {notificationOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                <span>{option.label}</span>
                <input
                  checked={userSettings.notifications[option.key]}
                  type="checkbox"
                  onChange={(event) =>
                    updateNotificationPreference(option.key, event.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">Display And Security</h3>
          <div className="mt-4 grid gap-3">
            <Field label="Theme">
              <select
                className={inputClassName}
                value={userSettings.theme}
                onChange={(event) =>
                  setUserSettings({ ...userSettings, theme: event.target.value })
                }
              >
                <option value="Healthcare light">Healthcare light</option>
                <option value="High contrast">High contrast</option>
                <option value="System default">System default</option>
              </select>
            </Field>
            <Field label="Session timeout">
              <select
                className={inputClassName}
                value={userSettings.sessionTimeout}
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    sessionTimeout: event.target.value,
                  })
                }
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </Field>
            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-white px-3 py-2 text-sm">
              <span>Compact layout</span>
              <input
                checked={userSettings.compactMode}
                type="checkbox"
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    compactMode: event.target.checked,
                  })
                }
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-white px-3 py-2 text-sm">
              <span>Privacy mode by default</span>
              <input
                checked={userSettings.privacyMode}
                type="checkbox"
                onChange={(event) =>
                  setUserSettings({
                    ...userSettings,
                    privacyMode: event.target.checked,
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">User Management</h3>
          <div className="mt-4 grid gap-3">
            <input
              className={inputClassName}
              value={inviteDraft.email}
              onChange={(event) =>
                setInviteDraft({ ...inviteDraft, email: event.target.value })
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={inputClassName}
                value={inviteDraft.role}
                onChange={(event) =>
                  setInviteDraft({
                    ...inviteDraft,
                    role: event.target.value as Role,
                  })
                }
              >
                {roles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName}
                value={inviteDraft.department}
                onChange={(event) =>
                  setInviteDraft({
                    ...inviteDraft,
                    department: event.target.value,
                  })
                }
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addPendingInvite}>Create invite draft</Button>
            <StackedList
              items={pendingInvites.map(
                (invite) =>
                  `${invite.email} - ${invite.role} - ${invite.department}`,
              )}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold">Role Management</h3>
          <div className="mt-4 grid gap-2">
            {roles.map((option) => (
              <div
                key={option}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">{option}</span>
                <span> - {rolePermissions[option].join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
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
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-white px-3 py-2 text-sm text-muted-foreground">
          Nothing added yet.
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-muted-foreground"
          >
            {item}
          </div>
        ))
      )}
    </div>
  );
}

const inputClassName =
  "h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
