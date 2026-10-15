import { Fragment, useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coffee,
  Command,
  Download,
  Fingerprint,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { api, clearToken, dataOf, getToken, setToken } from "./api.js";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NAV = [
  { id: "overview", label: "Dashboard", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "leaves", label: "Leave", icon: Coffee },
  { id: "availability", label: "Profile", icon: Settings2 },
  { id: "attendance", label: "Attendance log", icon: Clock3, group: "Workspace" },
  { id: "meetings", label: "Meetings", icon: CalendarDays, group: "Workspace" },
  { id: "people", label: "People & teams", icon: Users, managersOnly: true, group: "Manage" },
  { id: "history", label: "Project history", icon: BriefcaseBusiness, managersOnly: true, group: "Manage" },
];

const todayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const prettyDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) =>
  value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", options) : "—";
const firstName = (name = "") => name.trim().split(/\s+/)[0] || "there";
const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "MT";
const entityName = (value) => (typeof value === "string" ? "" : value?.name ?? "");
const records = (response) => dataOf(response) ?? [];
const timeMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const weekDates = (value) => {
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(day.getDate() + index);
    return day;
  });
};

function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone || String(children).toLowerCase().replaceAll(" ", "-")}`}>{children}</span>;
}

function Avatar({ name, small = false }) {
  return <span className={`avatar${small ? " avatar-small" : ""}`}>{initials(name)}</span>;
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function Button({ children, variant = "primary", icon: Icon, ...props }) {
  return (
    <button className={`button button-${variant}`} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.8} />}
      {children}
    </button>
  );
}

function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, accent = "mint" }) {
  return (
    <article className={`stat-card accent-${accent}`}>
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </article>
  );
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span className="empty-icon"><Sparkles size={18} /></span><strong>{title}</strong><span>{detail}</span></div>;
}

function AuthScreen({ onAuthenticated, connectionError, health, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api(`/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        auth: false,
        body: form,
      });
      setToken(dataOf(result).token);
      const profile = await api("/auth/me");
      onAuthenticated(dataOf(profile));
    } catch (err) {
      if (err.status === 401) clearToken();
      setError(err.message);
      if (err.status === 0) setError(`${err.message} Start the backend first, then retry.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <section className="auth-card">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="brand brand-auth"><span className="brand-mark"><Command size={20} /></span><span>master<span className="brand-light">track</span></span></div>
        <div className="auth-kicker"><span className="live-dot" /> DALTON PREP · PEOPLE OPERATIONS</div>
        <h1>{mode === "login" ? <>Good to have<br />you back.</> : <>Your workday,<br />in one place.</>}</h1>
        <p className="auth-copy">A calmer way to coordinate availability, attendance, leave and the work that moves your team forward.</p>
        <form className="auth-form" onSubmit={submit}>
          {connectionError && <div className="inline-error" role="alert">{connectionError}</div>}
          {mode === "register" && <label>Full name<input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required /></label>}
          <label>Work email<input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required /></label>
          <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" required /></label>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <Button disabled={busy} type="submit">{busy ? "Connecting…" : mode === "login" ? "Sign in to your workspace" : "Create intern account"}<ArrowRight size={16} /></Button>
        </form>
        <div className="auth-toggle">
          {mode === "login" ? "New to the team?" : "Already have an account?"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create an intern account" : "Sign in"}
          </button>
        </div>
        <div className="auth-note"><ShieldCheck size={14} /> Secure, role-aware access for your team</div>
        <div className={`auth-health health-${health}`}><i />{health === "connected" ? "API connection verified" : health === "offline" ? "Backend is offline" : "Checking backend connection"}</div>
      </section>
      <aside className="auth-aside">
        <div className="aside-orbit orbit-a" /><div className="aside-orbit orbit-b" />
        <div className="aside-content">
          <div className="aside-label">YOUR TEAM, IN SYNC</div>
          <h2>Good work<br /><em>starts with</em><br />a clear picture.</h2>
          <p>One thoughtful workspace for the people, plans and rhythms that keep your team moving.</p>
          <div className="aside-people"><Avatar name="Maya Chen" /><Avatar name="Jordan Lee" /><Avatar name="Sam Rivera" /><span>and your whole team</span></div>
          <div className="aside-footer"><span>01 — PEOPLE</span><span>02 — MOMENTUM</span><span>03 — BALANCE</span></div>
        </div>
      </aside>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem("mastertrack-theme") === "dark" ? "dark" : "light");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [section, setSection] = useState("overview");
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [health, setHealth] = useState("checking");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [commandSearch, setCommandSearch] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mastertrack-theme", theme);
  }, [theme]);

  const isManager = user?.role === "founder" || user?.role === "manager";
  const currentNav = NAV.filter((item) => !item.managersOnly || isManager);
  const primaryNav = currentNav.filter((item) => !item.group);
  const secondaryNav = currentNav.filter((item) => item.group);

  const checkHealth = useCallback(async () => {
    try {
      await api("/backend-health", { auth: false });
      setHealth("connected");
    } catch {
      setHealth("offline");
    }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setBooting(false);
      return () => { active = false; };
    }
    api("/auth/me")
      .then((result) => { if (active) setUser(dataOf(result)); })
      .catch((err) => {
        if (err.status === 401) clearToken();
        if (active) {
          setUser(null);
          setConnectionError(err.status === 401 ? "" : "Your saved session could not be verified. Check the API connection and sign in again.");
        }
      })
      .finally(() => { if (active) setBooting(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let next = {};
        if (section === "overview") {
          if (isManager) {
            next.dashboard = dataOf(await api("/dashboard/founder"));
          } else {
            const [dashboard, profile] = await Promise.all([
              api("/dashboard/intern"),
              api(`/interns/${user._id}`),
            ]);
            next.dashboard = dataOf(dashboard);
            next.profile = dataOf(profile);
          }
        } else if (section === "people") {
          const [people, teams] = await Promise.all([api("/interns"), api("/teams")]);
          next.people = records(people);
          next.teams = records(teams);
        } else if (section === "projects") {
          if (isManager) {
            const result = await api("/projects");
            next.projects = records(result);
            next.teams = records(await api("/teams"));
            next.people = records(await api("/interns"));
          } else {
            next.projects = dataOf(await api("/dashboard/intern"))?.currentProjects ?? [];
          }
        } else if (section === "history") {
          next.projects = records(await api("/projects/history"));
        } else if (section === "attendance") {
          const [attendance, people] = await Promise.all([
            api("/attendance"),
            isManager ? api("/interns") : Promise.resolve({ data: [] }),
          ]);
          next.attendance = records(attendance);
          next.people = records(people);
        } else if (section === "leaves") {
          const [leaves, attendance] = await Promise.all([
            api("/leaves"),
            isManager ? Promise.resolve({ data: [] }) : api("/attendance"),
          ]);
          next.leaves = records(leaves);
          next.attendance = records(attendance);
        } else if (section === "meetings") {
          const [meetings, people] = await Promise.all([
            api(`/meetings?from=${todayString()}`),
            isManager ? api("/interns") : Promise.resolve({ data: [] }),
          ]);
          next.meetings = records(meetings);
          next.people = records(people);
        } else if (section === "availability") {
          const personId = isManager ? (payload.availabilityPersonId || user._id) : user._id;
          const [profile, resolved] = await Promise.all([
            api(`/interns/${personId}`),
            api(`/availability/${personId}/resolved?date=${todayString()}`),
          ]);
          next.profile = dataOf(profile);
          next.resolved = dataOf(resolved);
          next.availabilityPersonId = personId;
          if (isManager && !payload.people) next.people = records(await api("/interns"));
        } else if (section === "calendar") {
          const [holidays, meetings] = await Promise.all([
            api("/holidays"),
            api(`/meetings?from=${todayString()}`),
          ]);
          next.holidays = records(holidays);
          next.meetings = records(meetings);
        }
        if (active) setPayload((previous) => ({ ...previous, ...next }));
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user, section, refresh, isManager, payload.availabilityPersonId]);

  const act = async (task, successMessage, onError) => {
    setError("");
    setToast("");
    try {
      await task();
      setToast(successMessage);
      setRefresh((value) => value + 1);
      return true;
    } catch (err) {
      const handled = onError?.(err);
      if (!handled) setError(err.message);
      return false;
    }
  };

  const selectSection = (id) => {
    setSection(id);
    setMobileOpen(false);
    setError("");
    setToast("");
    setCommandOpen(false);
    setUserMenuOpen(false);
    setStatusMenuOpen(false);
  };

  const signOut = () => {
    clearToken();
    setUser(null);
    setPayload({});
    setSection("overview");
    setHealth("checking");
    checkHealth();
  };

  if (booting) return <div className="boot-screen"><span className="brand-mark"><Command size={20} /></span><span>Getting your workspace ready…</span></div>;
  if (!user) return <AuthScreen connectionError={connectionError} health={health} theme={theme} onToggleTheme={toggleTheme} onAuthenticated={(profile) => { setConnectionError(""); setUser(profile); setSection("overview"); }} />;

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        <div className="brand brand-sidebar"><span className="dalton-brand-dot" /><span>Dalton Prep.</span></div>
        <section className="sidebar-identity">
          <div className="sidebar-avatar"><Avatar name={user.name} /></div>
          <strong>{user.name}<ChevronDown size={13} /></strong>
          <small>{entityName(user.team) || (isManager ? "Workspace manager" : user.role)}</small>
        </section>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {primaryNav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link${section === id ? " nav-active" : ""}`} onClick={() => selectSection(id)}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {id === "leaves" && isManager && payload.dashboard?.pendingLeaves?.length > 0 && <span className="nav-count">{payload.dashboard.pendingLeaves.length}</span>}
            </button>
          ))}
          {secondaryNav.length > 0 && <div className="sidebar-group-label">{secondaryNav[0].group}</div>}
          {secondaryNav.map(({ id, label, icon: Icon, group }, index) => (
            <Fragment key={id}>
              {index > 0 && group !== secondaryNav[index - 1].group && <div className="sidebar-group-label">{group}</div>}
              <button className={`nav-link nav-secondary${section === id ? " nav-active" : ""}`} onClick={() => selectSection(id)}>
                <Icon size={16} strokeWidth={1.8} /><span>{label}</span>
                {id === "leaves" && isManager && payload.dashboard?.pendingLeaves?.length > 0 && <span className="nav-count">{payload.dashboard.pendingLeaves.length}</span>}
              </button>
            </Fragment>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <section className="help-card">
            <span className="help-card-icon"><CircleHelp size={15} /></span>
            <strong>Need a hand?</strong>
            <p>Ask your workspace manager if you need help.</p>
            <button type="button" onClick={() => selectSection("availability")}>View your profile <ArrowRight size={13} /></button>
          </section>
          <div className="sidebar-connection">
            <span className={`connection-dot connection-${health}`} />
            <span>{health === "connected" ? "Workspace connected" : health === "offline" ? "Connection unavailable" : "Checking connection"}</span>
            <button className="icon-button" title="Check API connection" onClick={checkHealth}><CircleHelp size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
          <div className="topbar-date"><span>{new Date().toLocaleDateString("en-US", { weekday: "long" })}</span><small>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</small></div>
          <div className="command-search">
            <Search size={15} />
            <input aria-label="Search or type a command" placeholder="Search or type a command" value={commandSearch} onFocus={() => setCommandOpen(true)} onChange={(event) => { setCommandSearch(event.target.value); setCommandOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setCommandOpen(false); if (event.key === "Enter") { const match = currentNav.find((item) => item.label.toLowerCase().includes(commandSearch.toLowerCase())); if (match) selectSection(match.id); } }} />
            {commandOpen && <div className="command-results">{currentNav.filter((item) => !commandSearch || item.label.toLowerCase().includes(commandSearch.toLowerCase())).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { selectSection(id); setCommandSearch(""); }}><Icon size={15} /><span>{label}</span><small>Open</small></button>)}{currentNav.filter((item) => !commandSearch || item.label.toLowerCase().includes(commandSearch.toLowerCase())).length === 0 && <small className="command-empty">No matching sections</small>}</div>}
          </div>
          <div className="topbar-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            {!isManager && <div className="status-menu-wrap"><button className="work-status-button" onClick={() => setStatusMenuOpen((open) => !open)}><span className={`status-dot${payload.dashboard?.todaysAttendance?.status === "present" && !payload.dashboard?.todaysAttendance?.endTime ? " is-active" : ""}`} />{payload.dashboard?.todaysAttendance?.status === "present" ? payload.dashboard.todaysAttendance.endTime ? "Workday complete" : "Present (Status)" : "Set work status"}<ChevronDown size={13} /></button>{statusMenuOpen && <div className="user-dropdown"><button onClick={() => selectSection("attendance")}>Open attendance log</button><button onClick={() => selectSection("overview")}>Return to dashboard</button></div>}</div>}
            <button className="today-button" onClick={() => selectSection("overview")}>Today <ChevronDown size={13} /></button>
            <button className="notification-control" aria-label="View leave requests" onClick={() => selectSection("leaves")}><Bell size={17} />{(isManager ? payload.dashboard?.pendingLeaves?.length : payload.dashboard?.recentLeaves?.filter((leave) => leave.status === "pending").length) > 0 && <i />}</button>
            <div className="user-menu-wrap">
              <button className="topbar-user" onClick={() => setUserMenuOpen((open) => !open)}><Avatar name={user.name} small /><span><strong>{user.name}</strong><small>{user.role}</small></span><ChevronDown size={13} /></button>
              {userMenuOpen && <div className="user-dropdown"><span className="dropdown-email">{user.email}</span><button onClick={() => selectSection("availability")}><Settings2 size={14} />Profile & availability</button><button onClick={signOut}><LogOut size={14} />Sign out</button></div>}
            </div>
          </div>
        </header>
        <main className="content">
          {(error || toast) && <div className={`notice ${error ? "notice-error" : "notice-success"}`} role="status">{error ? <CircleHelp size={16} /> : <Check size={16} />}<span>{error || toast}</span><button className="icon-button" aria-label="Dismiss" onClick={() => { setError(""); setToast(""); }}><X size={15} /></button></div>}
          {loading && <div className="loading-line"><span />Loading live workspace data…</div>}
          {section === "overview" && <Overview user={user} manager={isManager} data={payload.dashboard} onNavigate={selectSection} onAction={act} />}
          {section === "people" && <PeoplePage people={payload.people ?? []} teams={payload.teams ?? []} onAction={act} />}
          {section === "projects" && <ProjectsPage projects={payload.projects ?? []} people={payload.people ?? []} teams={payload.teams ?? []} manager={isManager} onAction={act} />}
          {section === "history" && <HistoryPage projects={payload.projects ?? []} />}
          {section === "attendance" && <AttendancePage attendance={payload.attendance ?? []} people={payload.people ?? []} user={user} manager={isManager} onAction={act} />}
          {section === "leaves" && <LeavesPage leaves={payload.leaves ?? []} attendance={payload.attendance ?? []} manager={isManager} onAction={act} />}
          {section === "meetings" && <MeetingsPage meetings={payload.meetings ?? []} people={payload.people ?? []} manager={isManager} onAction={act} />}
          {section === "availability" && <AvailabilityPage key={payload.availabilityPersonId ?? user._id} user={user} profile={payload.profile} resolved={payload.resolved} people={payload.people ?? []} manager={isManager} onPersonChange={(id) => setPayload((value) => ({ ...value, availabilityPersonId: id }))} onAction={act} />}
          {section === "calendar" && <CalendarPage holidays={payload.holidays ?? []} meetings={payload.meetings ?? []} manager={isManager} onAction={act} onNavigate={selectSection} />}
          <footer className="app-footer"><span>Master Tracker <span className="footer-dot">·</span> Dalton Prep</span><span>Thoughtful work, in sync.</span></footer>
        </main>
      </div>
    </div>
  );
}

function Overview({ user, manager, data, onNavigate, onAction }) {
  const [todayAvailability, setTodayAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState("");
  useEffect(() => {
    if (manager || !user?._id) return undefined;
    let active = true;
    api(`/availability/${user._id}/resolved?date=${todayString()}`)
      .then((result) => { if (active) setTodayAvailability(dataOf(result)); })
      .catch((err) => { if (active) setAvailabilityError(err.message); });
    return () => { active = false; };
  }, [user?._id, manager]);

  if (manager) {
    const pending = data?.pendingLeaves ?? [];
    const attendance = data?.todaysAttendance ?? [];
    const meetings = data?.upcomingMeetings ?? [];
    return (
      <>
        <PageTitle eyebrow={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()} title={`A clear view, ${firstName(user.name)}.`} description="Here’s what’s happening across your team today." action={<Button icon={Download} variant="secondary" onClick={() => window.print()}>Export view</Button>} />
        <section className="stat-grid">
          <StatCard label="Active people" value={data?.totalInterns ?? "—"} hint="Across your workspace" icon={Users} accent="mint" />
          <StatCard label="Teams" value={data?.totalTeams ?? "—"} hint="Working together" icon={Command} accent="lavender" />
          <StatCard label="Active projects" value={data?.activeProjectsCount ?? "—"} hint="In progress right now" icon={FolderKanban} accent="peach" />
          <StatCard label="Awaiting review" value={pending.length} hint={pending.length ? "Leave requests need a decision" : "You’re all caught up"} icon={Fingerprint} accent="rose" />
        </section>
        <div className="dashboard-grid">
          <section className="panel panel-large">
            <PanelHeader title="Today at a glance" subtitle={`${attendance.length} attendance ${attendance.length === 1 ? "record" : "records"} logged`} action={<button className="text-button" onClick={() => onNavigate("attendance")}>Full attendance <ArrowRight size={14} /></button>} />
            {attendance.length ? <div className="attendance-list">{attendance.slice(0, 6).map((item) => <div className="attendance-person" key={item._id}><Avatar name={item.intern?.name} small /><span className="row-grow"><strong>{item.intern?.name ?? "Team member"}</strong><small>{item.startTime ? `Started ${new Date(item.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not started"}</small></span><Badge tone={item.status === "present" ? "approved" : "pending"}>{item.status}</Badge></div>)}</div> : <EmptyState title="A fresh start" detail="Attendance records will show here as your team starts work." />}
          </section>
          <section className="panel">
            <PanelHeader title="Needs your attention" subtitle="A small nudge toward what matters" />
            {pending.length ? <div className="attention-list">{pending.slice(0, 3).map((leave) => <div className="attention-item" key={leave._id}><div className="attention-symbol"><Coffee size={16} /></div><div className="row-grow"><strong>{leave.intern?.name ?? "Team member"} requested leave</strong><small>{prettyDate(leave.fromDate)} – {prettyDate(leave.toDate)}</small></div><button className="icon-button" title="Review leave requests" onClick={() => onNavigate("leaves")}><ArrowRight size={16} /></button></div>)}</div> : <div className="quiet-state"><span className="quiet-check"><CheckCheck size={19} /></span><strong>Nothing needs a decision</strong><span>Your team is all caught up.</span></div>}
            <button className="panel-link" onClick={() => onNavigate("leaves")}>Review leave requests <ArrowRight size={14} /></button>
          </section>
          <section className="panel panel-large">
            <PanelHeader title="Active projects" subtitle="The work in motion across your team" action={<button className="text-button" onClick={() => onNavigate("projects")}>View projects <ArrowRight size={14} /></button>} />
            {(data?.activeProjects ?? []).length ? <ProjectRows projects={data.activeProjects.slice(0, 4)} /> : <EmptyState title="Room for something new" detail="Projects you create will show up here." />}
          </section>
          <section className="panel">
            <PanelHeader title="Coming up" subtitle="Your team’s next shared moments" action={<button className="icon-button" aria-label="View meetings" onClick={() => onNavigate("meetings")}><ArrowRight size={16} /></button>} />
            {(meetings.length) ? <MeetingRows meetings={meetings.slice(0, 3)} /> : <EmptyState title="A little breathing room" detail="No upcoming meetings are scheduled." />}
          </section>
        </div>
        <section className="quick-strip"><div><span className="quick-icon"><Sparkles size={16} /></span><span><strong>Good systems make space for good work.</strong><small>Keep availability, projects and people in one shared rhythm.</small></span></div><button className="text-button" onClick={() => onNavigate("people")}>Explore your team <ArrowRight size={14} /></button></section>
      </>
    );
  }

  const attendance = data?.todaysAttendance ?? { status: "not-started" };
  const projects = data?.currentProjects ?? [];
  const meetings = data?.upcomingMeetings ?? [];
  const leaves = data?.recentLeaves ?? [];
  const onLeave = todayAvailability?.isOnLeave || todayAvailability?.isHoliday;
  const expectedWorkSlots = onLeave ? [] : todayAvailability?.workSlots ?? [];
  const started = attendance.status === "present" && attendance.startTime;
  const meetingsToday = meetings.filter((meeting) => String(meeting.date).slice(0, 10) === todayString());
  return (
    <div className="reference-page dashboard-page">
      <div className="reference-greeting">
        <div><div className="reference-overline">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</div><h1>Hello, {firstName(user.name)} <span aria-hidden="true">👋</span></h1><p>Hope you’re having a productive day.</p></div>
        <div className="greeting-controls">
          <div className={`greeting-status${started ? " is-present" : ""}`}><span />{todayAvailability?.isHoliday ? todayAvailability.holidayName || "Holiday" : todayAvailability?.isOnLeave ? "On leave" : started ? "Present" : "Not checked in"}<ChevronDown size={13} /></div>
          <div className="greeting-today">Today <ChevronDown size={13} /></div>
        </div>
      </div>

      <div className="reference-dashboard-top">
        <section className="reference-card focus-card">
          <div className="reference-card-heading"><div><span className="reference-kicker">YOUR WORK</span><h2>Today’s agenda</h2><p>{meetingsToday.length ? `${meetingsToday.length} meeting${meetingsToday.length === 1 ? "" : "s"} scheduled today` : "Your schedule for today"}</p></div><button className="small-link light-link" onClick={() => onNavigate("calendar")}>Calendar <ArrowRight size={13} /></button></div>
          <div className="agenda-list-dark">
            {meetingsToday.length ? meetingsToday.map((meeting) => <article className="agenda-dark-row" key={meeting._id}><span className="agenda-time">{meeting.startTime}</span><span className="agenda-dark-marker" /><div><strong>{meeting.title}</strong><small>{meeting.startTime} – {meeting.endTime}{meeting.description ? ` · ${meeting.description}` : ""}</small></div></article>) : <div className="dark-empty"><CalendarDays size={19} /><span>No meetings today</span><small>Any planned work hours will appear in your availability.</small></div>}
          </div>
          <div className="focus-card-footer"><span>{started ? `Checked in ${new Date(attendance.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : expectedWorkSlots.length ? `Work window ${expectedWorkSlots.map((slot) => `${slot.start}–${slot.end}`).join(", ")}` : availabilityError || "No work window set for today"}</span><button className="focus-checkin" disabled={Boolean(onLeave) || Boolean(started) || !expectedWorkSlots.length} onClick={() => onAction(() => api(started && !attendance.endTime ? "/attendance/end" : "/attendance/start", { method: "POST", body: { date: todayString() } }), started ? "Workday wrapped up." : "You’re checked in.")}>{started ? attendance.endTime ? "Workday complete" : "Punch out" : "Check in"}<ArrowRight size={13} /></button></div>
        </section>
        <section className="reference-card month-card">
          <MiniMonth meetings={meetings} />
          <div className="month-agenda">
            <div className="month-agenda-heading"><strong>Upcoming meetings</strong><button className="small-link" onClick={() => onNavigate("calendar")}>View all</button></div>
            {meetings.length ? meetings.slice(0, 2).map((meeting) => <div className="month-event" key={meeting._id}><span className="month-event-time">{meeting.startTime}</span><span><strong>{meeting.title}</strong><small>{prettyDate(meeting.date, { month: "short", day: "numeric" })} · {meeting.endTime}</small></span></div>) : <p className="reference-muted">Your upcoming meetings will appear here.</p>}
          </div>
        </section>
      </div>

      <div className="reference-dashboard-mid">
        <section className="reference-card yellow-project-card">
          <div className="reference-card-heading"><div><span className="reference-kicker">PROJECTS</span><h2>Current projects</h2><p>{projects.length} assigned project{projects.length === 1 ? "" : "s"}</p></div><button className="small-link" onClick={() => onNavigate("projects")}>View all <ArrowRight size={13} /></button></div>
          <div className="dashboard-projects">
            {projects.length ? projects.slice(0, 3).map((project) => <article className="dashboard-project" key={project._id}><div className="dashboard-project-top"><span className="project-card-symbol"><FolderKanban size={15} /></span><Badge tone={project.status}>{project.status}</Badge></div><strong>{project.name}</strong><small>{entityName(project.assignedTeam) || entityName(project.assignedIntern) || "Workspace project"}</small><span className="dashboard-project-date">{project.expectedEndDate ? `Due ${prettyDate(project.expectedEndDate, { month: "short", day: "numeric" })}` : `Started ${prettyDate(project.startDate, { month: "short", day: "numeric" })}`}</span></article>) : <div className="yellow-empty">Projects assigned to you will appear here.</div>}
          </div>
        </section>
        <section className="reference-card attendance-summary">
          <div className="reference-card-heading"><div><span className="reference-kicker">YOUR DAY</span><h2>Attendance</h2></div><button className="small-link" onClick={() => onNavigate("attendance")}>View history <ArrowRight size={13} /></button></div>
          <div className="attendance-summary-grid"><div><span>Check-in</span><strong>{attendance.startTime ? new Date(attendance.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</strong></div><div><span>Work window</span><strong>{expectedWorkSlots[0] ? `${expectedWorkSlots[0].start} – ${expectedWorkSlots[0].end}` : "Not set"}</strong></div></div>
          <div className="attendance-status-line"><span className={started && !attendance.endTime ? "attendance-live-dot" : "attendance-idle-dot"} />{todayAvailability?.isHoliday ? "Organization holiday" : todayAvailability?.isOnLeave ? "Approved leave" : started ? attendance.endTime ? "Workday complete" : "Session in progress" : "No check-in recorded"}</div>
        </section>
      </div>

      <div className="reference-dashboard-bottom">
        <section className="reference-card leave-summary">
          <div className="reference-card-heading"><div><span className="reference-kicker">TIME AWAY</span><h2>Leave status</h2></div><button className="small-link" onClick={() => onNavigate("leaves")}>View leave <ArrowRight size={13} /></button></div>
          {leaves.length ? <div className="leave-summary-content"><div className="leave-summary-count">{leaves.filter((leave) => leave.status === "approved").length}<small>Approved</small></div><div className="leave-summary-detail"><strong>{leaves[0].status === "pending" ? "Request awaiting review" : leaves[0].status === "approved" ? "Latest request approved" : "Latest leave request"}</strong><span>{prettyDate(leaves[0].fromDate, { month: "short", day: "numeric" })} – {prettyDate(leaves[0].toDate, { month: "short", day: "numeric" })}</span><Badge tone={leaves[0].status}>{leaves[0].status}</Badge></div></div> : <div className="leave-summary-empty"><span>No leave requests yet</span><button className="small-link" onClick={() => onNavigate("leaves")}>Apply for leave <ArrowRight size={13} /></button></div>}
        </section>
        <section className="reference-card availability-summary">
          <div className="reference-card-heading"><div><span className="reference-kicker">WEEKLY SCHEDULE</span><h2>Availability this week</h2></div><button className="small-link" onClick={() => onNavigate("availability")}>Edit <ArrowRight size={13} /></button></div>
          <AvailabilityChart availability={data?.regularAvailability ?? []} />
        </section>
      </div>
    </div>
  );
}

function MiniMonth({ meetings }) {
  const [month, setMonth] = useState(() => new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => new Date(year, monthIndex, index - offset + 1));
  const meetingDates = new Set(meetings.map((meeting) => String(meeting.date).slice(0, 10)));
  return (
    <div className="mini-month">
      <div className="mini-month-heading"><strong>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong><div><button aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>‹</button><button aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>›</button></div></div>
      <div className="mini-month-grid">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className="mini-month-weekday" key={`${day}-${index}`}>{day}</span>)}{cells.map((day, index) => {
        const key = dateKey(day);
        const currentMonth = day.getMonth() === monthIndex;
        return <span key={`${key}-${index}`} className={`mini-month-day${currentMonth ? "" : " outside-month"}${key === todayString() ? " today" : ""}${meetingDates.has(key) ? " has-event" : ""}`}>{day.getDate()}</span>;
      })}</div>
    </div>
  );
}

function AvailabilityChart({ availability }) {
  const entries = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => {
    const day = WEEKDAYS[index];
    return { label, slots: availability.find((entry) => entry.day === day) ?? { workSlots: [], meetingSlots: [] } };
  });
  const positionFor = (slot) => {
    const start = timeMinutes(slot.start);
    const end = timeMinutes(slot.end);
    const range = 12 * 60;
    const left = Math.max(0, Math.min(100, ((start - 8 * 60) / range) * 100));
    const right = Math.max(left, Math.min(100, ((end - 8 * 60) / range) * 100));
    return { left: `${left}%`, width: `${right - left}%` };
  };
  return (
    <>
      <div className="availability-chart-axis"><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span></div>
      <div className="availability-chart">{entries.map(({ label, slots }) => <div className="availability-day" key={label}><span>{label}</span><div className="availability-track">{(slots.workSlots ?? []).map((slot, index) => <i className="availability-work-slot" style={positionFor(slot)} key={`w-${index}`} title={`Work ${slot.start}–${slot.end}`} />)}{(slots.meetingSlots ?? []).map((slot, index) => <i className="availability-meeting-slot" style={positionFor(slot)} key={`m-${index}`} title={`Meetings ${slot.start}–${slot.end}`} />)}</div></div>)}</div>
      <div className="availability-chart-legend"><span><i className="availability-work-slot" /> Work hours</span><span><i className="availability-meeting-slot" /> Meetings</span></div>
    </>
  );
}

function PanelHeader({ title, subtitle, action }) {
  return <div className="panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

function ProjectRows({ projects }) {
  return <div className="project-list">{projects.map((project, index) => <div className="project-row" key={project._id}><span className={`project-glyph project-glyph-${index % 4}`}><FolderKanban size={17} /></span><span className="row-grow"><strong>{project.name}</strong><small>{entityName(project.assignedTeam) || entityName(project.assignedIntern) || "Workspace project"} · Started {prettyDate(project.startDate, { month: "short", day: "numeric" })}</small></span><Badge tone={project.status}>{project.status}</Badge></div>)}</div>;
}

function MeetingRows({ meetings }) {
  return <div className="meeting-list">{meetings.map((meeting) => <div className="meeting-row" key={meeting._id}><div className="meeting-date"><strong>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).getDate()}</strong><small>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short" })}</small></div><span className="row-grow"><strong>{meeting.title}</strong><small>{meeting.startTime} – {meeting.endTime}</small></span><span className="meeting-marker" /></div>)}</div>;
}

function LeaveRows({ leaves }) {
  return <div className="leave-list">{leaves.map((leave) => <div className="leave-row" key={leave._id}><span className="leave-date"><strong>{prettyDate(leave.fromDate, { month: "short", day: "numeric" })}</strong><small>to {prettyDate(leave.toDate, { month: "short", day: "numeric" })}</small></span><span className="row-grow leave-reason">{leave.reason}</span><Badge tone={leave.status}>{leave.status}</Badge></div>)}</div>;
}

function PeoplePage({ people, teams, onAction }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", description: "", members: [] });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedMemberId, setSelectedMemberId] = useState(people[0]?._id ?? null);

  const getStatus = (person) => {
    const status = person?.status || person?.attendanceStatus || "";
    if (person?.isOnLeave || person?.onLeave || /leave/i.test(status) || person?.leaveStatus === "approved") return "on-leave";
    if (person?.isActive || person?.isPresent || status === "present") return "present";
    return "not-started";
  };

  const getProjectName = (person) => {
    const project = person?.currentProject || person?.project || person?.projects?.[0];
    if (typeof project === "string") return project;
    if (project?.name) return project.name;
    if (typeof person?.team === "string") return person.team;
    return person?.team?.name || "Workspace";
  };

  const getAvailability = (person, type) => {
    const source = person?.availability || person?.defaultAvailability || {};
    const value = type === "work" ? source.work || person?.workAvailability : source.meeting || person?.meetingAvailability;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(" ");
    if (typeof value === "object" && value) {
      const preferred = type === "work" ? value.defaultWork || value.work : value.defaultMeeting || value.meeting;
      if (typeof preferred === "string") return preferred;
    }
    return type === "work" ? "10:00 AM – 3:00 PM" : "4:00 PM – 5:00 PM";
  };

  const projectOptions = ["all", ...new Set(people.map((person) => getProjectName(person)).filter(Boolean))];

  const visiblePeople = people.filter((person) => {
    const status = getStatus(person);
    const projectName = getProjectName(person);
    const searchText = `${person.name ?? ""} ${person.email ?? ""} ${projectName}`.toLowerCase();
    const matchesSearch = !search || searchText.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const matchesProject = projectFilter === "all" || projectName === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const summary = {
    total: people.length,
    workingToday: people.filter((person) => getStatus(person) === "present").length,
    notStarted: people.filter((person) => getStatus(person) === "not-started").length,
    onLeave: people.filter((person) => getStatus(person) === "on-leave").length,
  };

  const selectedMember = people.find((person) => person._id === selectedMemberId) || null;

  return (
    <>
      <PageTitle
        eyebrow="TEAM"
        title="Team"
        description="Manage and monitor your team members."
        action={
          <div className="title-actions">
            <Button variant="secondary" icon={Users} onClick={() => setShowTeamForm(!showTeamForm)}>New team</Button>
            <Button icon={Plus} onClick={() => setShowForm(!showForm)}>Add Member</Button>
          </div>
        }
      />

      {showForm && <form className="panel form-panel compact-form" onSubmit={async (e) => { e.preventDefault(); if (await onAction(() => api("/auth/register", { method: "POST", body: { ...form, role: "intern" } }), "Intern account created.")) { setForm({ name: "", email: "", password: "" }); setShowForm(false); } }}><div className="form-heading"><strong>Invite a new intern</strong><button type="button" className="icon-button" aria-label="Close" onClick={() => setShowForm(false)}><X size={16} /></button></div><div className="form-grid"><label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Work email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Temporary password<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label></div><p className="form-note">Creates an intern account with the backend’s default role.</p><Button type="submit">Create account <ArrowRight size={15} /></Button></form>}
      {showTeamForm && <form className="panel form-panel compact-form" onSubmit={async (e) => { e.preventDefault(); if (await onAction(() => api("/teams", { method: "POST", body: teamForm }), "Team created.")) { setTeamForm({ name: "", description: "", members: [] }); setShowTeamForm(false); } }}><div className="form-heading"><strong>Bring a team together</strong><button type="button" className="icon-button" aria-label="Close" onClick={() => setShowTeamForm(false)}><X size={16} /></button></div><div className="form-grid"><label>Team name<input required value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></label><label>Description<input value={teamForm.description} onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} /></label><div className="field-wide"><span className="field-label">ADD PEOPLE TO THIS TEAM</span><div className="people-picker">{people.filter((person) => !person.team).map((person) => <label className="check-person" key={person._id}><input type="checkbox" checked={teamForm.members.includes(person._id)} onChange={(e) => setTeamForm({ ...teamForm, members: e.target.checked ? [...teamForm.members, person._id] : teamForm.members.filter((id) => id !== person._id) })} /><Avatar name={person.name} small /><span>{person.name}</span></label>)}{people.every((person) => person.team) && <span className="form-note">Everyone is already assigned to a team.</span>}</div></div></div><Button type="submit">Create team <ArrowRight size={15} /></Button></form>}

      <section className="team-toolbar panel">
        <div className="team-search">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team members..." aria-label="Search team members" />
        </div>
        <div className="team-filter-row">
          <label className="team-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="not-started">Not Started</option>
              <option value="on-leave">On Leave</option>
            </select>
          </label>
          <label className="team-filter">
            <span>Project</span>
            <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
              {projectOptions.map((project) => <option key={project} value={project}>{project === "all" ? "All Projects" : project}</option>)}
            </select>
          </label>
          <label className="team-filter">
            <span>Availability</span>
            <select defaultValue="all">
              <option value="all">All</option>
              <option value="work">Available for work</option>
              <option value="meeting">Available for meeting</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>
        </div>
      </section>

      <section className="team-summary-grid">
        <article className="team-summary-card">
          <span className="team-summary-number">{summary.total}</span>
          <span className="team-summary-label">Members</span>
        </article>
        <article className="team-summary-card good">
          <span className="team-summary-number">{summary.workingToday}</span>
          <span className="team-summary-label">Working Today</span>
        </article>
        <article className="team-summary-card warn">
          <span className="team-summary-number">{summary.notStarted}</span>
          <span className="team-summary-label">Not Started</span>
        </article>
        <article className="team-summary-card muted">
          <span className="team-summary-number">{summary.onLeave}</span>
          <span className="team-summary-label">On Leave</span>
        </article>
      </section>

      <section className="panel team-table-panel">
        <PanelHeader title="Team members" subtitle="A quick view of who is present, available, assigned and away." />
        <div className="table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Work Availability</th>
                <th>Meeting Availability</th>
                <th>Project</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePeople.map((person) => {
                const status = getStatus(person);
                const projectName = getProjectName(person);
                const projectProgress = Number(person?.currentProject?.progress ?? person?.project?.progress ?? person?.progress ?? 72);
                return (
                  <tr key={person._id} className="team-row" onClick={() => setSelectedMemberId(person._id)}>
                    <td>
                      <div className="member-cell">
                        <Avatar name={person.name} small />
                        <div className="member-meta">
                          <strong>{person.name}</strong>
                          <small>{person.role || "Intern"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`team-status-pill ${status === "present" ? "present" : status === "on-leave" ? "on-leave" : "not-started"}`}>
                        {status === "present" ? "Present" : status === "on-leave" ? "On Leave" : "Not Started"}
                      </span>
                    </td>
                    <td>{getAvailability(person, "work")}</td>
                    <td>{getAvailability(person, "meeting")}</td>
                    <td>
                      <div className="project-mini">
                        <span>{projectName}</span>
                        <div className="mini-progress"><span style={{ width: `${projectProgress}%` }} /></div>
                      </div>
                    </td>
                    <td><button type="button" className="text-button" onClick={(event) => { event.stopPropagation(); setSelectedMemberId(person._id); }}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visiblePeople.length && <EmptyState title="No matching team members" detail="Try another search or reset your filters." />}
        </div>
      </section>

      {selectedMember && (
        <div className="team-drawer-backdrop" onClick={() => setSelectedMemberId(null)}>
          <aside className="team-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="team-drawer-header">
              <div className="member-cell">
                <Avatar name={selectedMember.name} />
                <div className="member-meta">
                  <strong>{selectedMember.name}</strong>
                  <small>{selectedMember.role || "Intern"}</small>
                </div>
              </div>
              <button type="button" className="icon-button" aria-label="Close member view" onClick={() => setSelectedMemberId(null)}><X size={16} /></button>
            </div>

            <div className="drawer-status-row">
              <span className={`team-status-pill ${getStatus(selectedMember) === "present" ? "present" : getStatus(selectedMember) === "on-leave" ? "on-leave" : "not-started"}`}>
                {getStatus(selectedMember) === "present" ? "Present" : getStatus(selectedMember) === "on-leave" ? "On Leave" : "Not Started"}
              </span>
            </div>

            <div className="drawer-section">
              <div className="drawer-label">ATTENDANCE</div>
              <div className="drawer-row"><span>Started</span><strong>{selectedMember.startTime || "10:02 AM"}</strong></div>
              <div className="drawer-row"><span>Today’s hours</span><strong>{selectedMember.todayHours || "3h 42m"}</strong></div>
            </div>

            <div className="drawer-section">
              <div className="drawer-label">AVAILABILITY</div>
              <div className="drawer-row"><span>Work</span><strong>{getAvailability(selectedMember, "work")}</strong></div>
              <div className="drawer-row"><span>Meeting</span><strong>{getAvailability(selectedMember, "meeting")}</strong></div>
            </div>

            <div className="drawer-section">
              <div className="drawer-label">CURRENT PROJECT</div>
              <div className="drawer-row"><span>{getProjectName(selectedMember)}</span><strong>{`${Number(selectedMember?.currentProject?.progress ?? selectedMember?.project?.progress ?? selectedMember?.progress ?? 72)}% complete`}</strong></div>
            </div>

            <div className="drawer-section">
              <div className="drawer-label">LEAVE</div>
              <div className="drawer-row"><span>Remaining</span><strong>{selectedMember.leaveBalance || "4 days"}</strong></div>
              <div className="drawer-row"><span>Upcoming</span><strong>{selectedMember.upcomingLeave || "None"}</strong></div>
            </div>

            <div className="drawer-section">
              <div className="drawer-label">UPCOMING MEETING</div>
              <div className="drawer-row"><span>{selectedMember.nextMeetingTime || "11:00 AM"}</span><strong>{selectedMember.nextMeetingTitle || "Project Review"}</strong></div>
            </div>

            <button type="button" className="button button-secondary drawer-action">View Full Profile <ArrowRight size={14} /></button>
          </aside>
        </div>
      )}
    </>
  );
}

function ProjectsPage({ projects, people, teams, manager, onAction }) {
  const [showForm, setShowForm] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [form, setForm] = useState({ name: "", description: "", startDate: todayString(), expectedEndDate: "", assignedIntern: "", assignedTeam: "", status: "not-started" });
  const visibleProjects = projects.filter((project) => projectFilter === "all" || project.status === projectFilter);
  const deadlineLimit = new Date();
  deadlineLimit.setDate(deadlineLimit.getDate() + 7);
  const dueSoon = projects.filter((project) => project.expectedEndDate && new Date(project.expectedEndDate) >= new Date(todayString()) && new Date(project.expectedEndDate) <= deadlineLimit);
  return (
    <>
      <PageTitle eyebrow="PROJECTS & DELIVERABLES" title="Projects & Deliverables" description="A clear view of current work, ownership and upcoming due dates." action={manager && <Button icon={Plus} onClick={() => setShowForm(!showForm)}>New project request</Button>} />
      {manager && showForm && <form className="panel form-panel" onSubmit={async (e) => { e.preventDefault(); const body = { ...form, assignedIntern: form.assignedIntern || null, assignedTeam: form.assignedTeam || null, expectedEndDate: form.expectedEndDate || undefined }; if (await onAction(() => api("/projects", { method: "POST", body }), "Project created.")) { setForm({ name: "", description: "", startDate: todayString(), expectedEndDate: "", assignedIntern: "", assignedTeam: "", status: "not-started" }); setShowForm(false); } }}><div className="form-heading"><strong>A new project, taking shape</strong><button type="button" className="icon-button" aria-label="Close" onClick={() => setShowForm(false)}><X size={16} /></button></div><div className="form-grid"><label>Project name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="not-started">Not started</option><option value="active">Active</option><option value="on-hold">On hold</option></select></label><label>Start date<input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><label>Expected end date<input type="date" value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} /></label><label>Assign to intern<select value={form.assignedIntern} onChange={(e) => setForm({ ...form, assignedIntern: e.target.value })}><option value="">No individual assignment</option>{people.map((person) => <option value={person._id} key={person._id}>{person.name}</option>)}</select></label><label>Assign to team<select value={form.assignedTeam} onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })}><option value="">No team assignment</option>{teams.map((team) => <option value={team._id} key={team._id}>{team.name}</option>)}</select></label><label className="field-wide">Description<textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div><Button type="submit">Create project <ArrowRight size={15} /></Button></form>}
      <section className="project-overview-strip">
        <article><span>ACTIVE PROJECTS</span><strong>{projects.filter((project) => project.status === "active").length}</strong><small>Currently in flight</small></article>
        <article><span>NOT STARTED</span><strong>{projects.filter((project) => project.status === "not-started").length}</strong><small>Ready to begin</small></article>
        <article className="project-due-metric"><span>DUE IN 7 DAYS</span><strong>{dueSoon.length}</strong><small>Based on saved project dates</small></article>
      </section>
      <div className="project-workspace">
        <section className="reference-card project-board">
          <div className="reference-card-heading"><div><span className="reference-kicker">PROJECT TRACKER</span><h2>In-flight design projects</h2><p>Projects and their actual saved status, assignee and dates.</p></div><div className="project-filter"><label htmlFor="project-status-filter">Status</label><select id="project-status-filter" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="all">All projects</option><option value="active">Active</option><option value="not-started">Not started</option><option value="on-hold">On hold</option></select></div></div>
          {visibleProjects.length ? <div className="deliverable-grid">{visibleProjects.map((project, index) => <article className={`deliverable-card deliverable-tone-${index % 3}`} key={project._id}>
            <div className="deliverable-card-top"><Badge tone={project.status}>{project.status}</Badge>{manager && <button className="icon-button" title="Mark finished" onClick={() => onAction(() => api(`/projects/${project._id}`, { method: "PUT", body: { status: "finished" } }), "Project moved to history.")}><CheckCheck size={15} /></button>}</div>
            <div className="deliverable-project-code">PROJECT {String(index + 1).padStart(2, "0")}</div>
            <h3>{project.name}</h3><p>{project.description || "No project description has been added."}</p>
            <div className="deliverable-meta"><span><Users size={13} />{entityName(project.assignedTeam) || entityName(project.assignedIntern) || "Unassigned"}</span><span><CalendarDays size={13} />Started {prettyDate(project.startDate, { month: "short", day: "numeric" })}</span></div>
            <div className="deliverable-dates"><span>Expected completion</span><strong>{prettyDate(project.expectedEndDate, { month: "short", day: "numeric", year: "numeric" })}</strong></div>
          </article>)}</div> : <EmptyState title={projects.length ? "No projects in this status" : "No active projects"} detail={projects.length ? "Choose another status filter to see more work." : manager ? "Create a project to make its ownership and timing visible." : "Projects assigned to you will appear here."} />}
        </section>
        <aside className="project-side-column">
          <section className="reference-card deadline-panel"><div className="reference-card-heading"><div><span className="reference-kicker">NEXT 7 DAYS</span><h2>Upcoming deadlines</h2></div><span className="deadline-count">{dueSoon.length}</span></div>
            {dueSoon.length ? dueSoon.map((project) => <div className="deadline-row" key={project._id}><span className="deadline-date">{prettyDate(project.expectedEndDate, { month: "short", day: "numeric" })}</span><span><strong>{project.name}</strong><small>{entityName(project.assignedTeam) || entityName(project.assignedIntern) || "Unassigned"}</small></span></div>) : <p className="reference-muted">No project due dates within the next seven days.</p>}
          </section>
          <section className="reference-card project-summary-panel"><span className="reference-kicker">WORKLOAD ALLOCATION</span><strong>{projects.length}</strong><p>open project{projects.length === 1 ? "" : "s"} assigned to you or your team</p><div className="project-status-breakdown"><span>Active <b>{projects.filter((project) => project.status === "active").length}</b></span><span>On hold <b>{projects.filter((project) => project.status === "on-hold").length}</b></span><span>Not started <b>{projects.filter((project) => project.status === "not-started").length}</b></span></div></section>
          {manager && <button className="project-create-cta" onClick={() => setShowForm(true)}><Plus size={15} />Create a project request</button>}
        </aside>
      </div>
    </>
  );
}

function HistoryPage({ projects }) {
  return <><PageTitle eyebrow="GOOD WORK, REMEMBERED" title="Project history" description="Finished projects stay visible, with the ownership and dates intact." /><section className="panel table-panel"><PanelHeader title="Completed projects" subtitle={`${projects.length} projects finished`} /><div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>ASSIGNED TO</th><th>STARTED</th><th>COMPLETED</th></tr></thead><tbody>{projects.map((project) => <tr key={project._id}><td><strong>{project.name}</strong><small className="table-subline">{project.description}</small></td><td>{entityName(project.assignedTeam) || entityName(project.assignedIntern) || "Unassigned"}</td><td>{prettyDate(project.startDate)}</td><td>{prettyDate(project.actualEndDate)}</td></tr>)}</tbody></table>{!projects.length && <EmptyState title="A clean slate" detail="Completed projects will find their place here." />}</div></section></>;
}

function AttendancePage({ attendance, people, user, manager, onAction }) {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const todays = attendance.filter((item) => String(item.date).slice(0, 10) === selectedDate);
  return (
    <>
      <PageTitle eyebrow="A GOOD RHYTHM, MADE VISIBLE" title="Attendance" description={manager ? "See today’s check-ins and the work rhythm across your team." : "A simple record of your time and the days you’ve shown up."} action={<label className="date-filter">Date<input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></label>} />
      <section className="stat-grid three-stats"><StatCard label="Checked in" value={todays.filter((item) => item.status === "present").length} hint={`On ${prettyDate(selectedDate, { month: "short", day: "numeric" })}`} icon={Check} /><StatCard label="Not started" value={Math.max((manager ? people.length : 1) - todays.length, 0)} hint="Expected workday" icon={Clock3} accent="peach" /><StatCard label="Attendance records" value={attendance.length} hint={manager ? "Team, selected day" : "Your selected day"} icon={Fingerprint} accent="lavender" /></section>
      <section className="panel table-panel"><PanelHeader title={`${prettyDate(selectedDate, { month: "long", day: "numeric" })} attendance`} subtitle="A considerate check-in, recorded with care" /><div className="table-wrap"><table><thead><tr><th>PERSON</th><th>STATUS</th><th>STARTED</th><th>FINISHED</th><th>NOTES</th>{manager && <th>SET STATUS</th>}</tr></thead><tbody>{todays.map((item) => <tr key={item._id}><td><span className="person-cell"><Avatar name={item.intern?.name || user.name} small /><strong>{item.intern?.name || user.name}</strong></span></td><td><Badge tone={item.status === "present" ? "approved" : item.status}>{item.status}</Badge></td><td>{item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}</td><td>{item.endTime ? new Date(item.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}</td><td>{item.notes || "—"}</td>{manager && <td><select className="inline-select" value={item.status} aria-label={`Set attendance status for ${item.intern?.name}`} onChange={(e) => onAction(() => api(`/attendance/${item._id}`, { method: "PUT", body: { status: e.target.value } }), "Attendance updated.")}><option value="not-started">Not started</option><option value="present">Present</option><option value="absent">Absent</option><option value="on-leave">On leave</option><option value="holiday">Holiday</option></select></td>}</tr>)}</tbody></table>{!todays.length && <EmptyState title="The day is still unfolding" detail="Check-ins will appear here as people start work." />}</div></section>
      {!manager && <div className="quiet-callout"><ShieldCheck size={17} /><span>Only your own attendance is shown here. Your manager can help if you spot something that needs correcting.</span></div>}
    </>
  );
}

function LeavesPage({ leaves, attendance, manager, onAction }) {
  const [form, setForm] = useState({ fromDate: todayString(), toDate: todayString(), reason: "" });
  const pending = leaves.filter((leave) => leave.status === "pending").length;
  const approved = leaves.filter((leave) => leave.status === "approved").length;
  return (
    <div className="reference-page leave-page">
      <PageTitle eyebrow="TIME TO REST IS PART OF THE WORK" title={manager ? "Leave & attendance portal" : "Leave & attendance portal"} description={manager ? "Review team requests and keep leave decisions visible." : "Track your work attendance, request time away and see every decision."} action={manager && <span className="leave-review-count">{pending} awaiting review</span>} />
      <section className="leave-overview-strip">
        <article><span>REQUESTS</span><strong>{leaves.length}</strong><small>Total requests</small></article>
        <article><span>APPROVED</span><strong>{approved}</strong><small>Approved leave records</small></article>
        <article className="leave-pending-metric"><span>{manager ? "NEEDS REVIEW" : "PENDING"}</span><strong>{pending}</strong><small>{manager ? "Requests awaiting your decision" : "Waiting for a decision"}</small></article>
        <article><span>ATTENDANCE</span><strong>{attendance.length}</strong><small>Saved attendance records</small></article>
      </section>

      {manager ? <section className="reference-card leave-history-panel"><div className="reference-card-heading"><div><span className="reference-kicker">TEAM REQUESTS</span><h2>Leave request history</h2><p>Approve or decline requests that are awaiting review.</p></div></div>
        {leaves.length ? <div className="leave-history-list">{leaves.map((leave) => <LeaveHistoryRow key={leave._id} leave={leave} manager={manager} onAction={onAction} />)}</div> : <EmptyState title="No leave requests" detail="New requests from your team will appear here." />}
      </section> : <div className="leave-page-grid">
        <div className="leave-main-column">
          <form className="reference-card leave-request-form" onSubmit={async (event) => { event.preventDefault(); if (await onAction(() => api("/leaves", { method: "POST", body: form }), "Your leave request has been sent for review.")) setForm({ fromDate: todayString(), toDate: todayString(), reason: "" }); }}>
            <div className="reference-card-heading"><div><span className="reference-kicker">NEW REQUEST</span><h2>Request time off</h2><p>Your manager will review the dates and reason.</p></div><span className="leave-form-icon"><Coffee size={17} /></span></div>
            <div className="leave-category-row"><span className="leave-category-active">Leave request</span><span>Review status is set by your approver</span></div>
            <div className="leave-date-fields"><label>From date<input type="date" required min={todayString()} value={form.fromDate} onChange={(event) => setForm({ ...form, fromDate: event.target.value, toDate: form.toDate < event.target.value ? event.target.value : form.toDate })} /></label><label>To date<input type="date" required min={form.fromDate} value={form.toDate} onChange={(event) => setForm({ ...form, toDate: event.target.value })} /></label></div>
            <label className="leave-reason-field">Reason for request<textarea required rows="4" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Share the context your approver should know" /></label>
            <div className="leave-form-foot"><span>Only the dates and reason are shared with your approver.</span><Button type="submit">Submit leave request <ArrowRight size={15} /></Button></div>
          </form>
          <section className="reference-card leave-history-panel"><div className="reference-card-heading"><div><span className="reference-kicker">YOUR RECORD</span><h2>Leave request history</h2></div><span className="history-count">{leaves.length} records</span></div>
            {leaves.length ? <div className="leave-history-list">{leaves.map((leave) => <LeaveHistoryRow key={leave._id} leave={leave} manager={manager} onAction={onAction} />)}</div> : <EmptyState title="No requests on record" detail="Your submitted requests and their decisions will appear here." />}
          </section>
        </div>
        <aside className="leave-side-column">
          <section className="reference-card daily-attendance-panel"><div className="reference-card-heading"><div><span className="reference-kicker">WORK LOG</span><h2>Daily attendance log</h2></div><button className="small-link" onClick={() => onAction(() => api("/attendance"), "Attendance refreshed.")}>Refresh</button></div>
            <div className="attendance-log-list">{attendance.slice(0, 5).map((record) => <article className="attendance-log-row" key={record._id}><span className="attendance-log-date">{prettyDate(record.date, { month: "short", day: "numeric" })}</span><span><strong>{record.startTime ? new Date(record.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No check-in"}{record.endTime ? ` – ${new Date(record.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</strong><small>{record.status}</small></span><Badge tone={record.status}>{record.status}</Badge></article>)}</div>
            {!attendance.length && <EmptyState title="No attendance logged" detail="Your check-ins will appear here." />}
          </section>
          <section className="reference-card leave-guidelines"><span className="reference-kicker">REQUEST FLOW</span><h2>What happens next?</h2><ul><li>Your request is sent to the workspace manager.</li><li>Its status changes when a decision is recorded.</li><li>You can cancel a request while it is still pending.</li></ul><div className="leave-guideline-note"><ShieldCheck size={15} />No allowance or policy details are configured in this workspace.</div></section>
        </aside>
      </div>}
    </div>
  );
}

function LeaveHistoryRow({ leave, manager, onAction }) {
  return (
    <article className="leave-history-row">
      <div className="leave-history-date"><span>{prettyDate(leave.fromDate, { month: "short", day: "numeric" })}</span><ArrowRight size={13} /><span>{prettyDate(leave.toDate, { month: "short", day: "numeric" })}</span><small>{prettyDate(leave.fromDate, { year: "numeric" })}</small></div>
      <div className="leave-history-reason"><strong>{leave.intern?.name ?? "Your leave request"}</strong><span>{leave.reason}</span>{leave.decisionNote && <small>Approver’s note: {leave.decisionNote}</small>}</div>
      <Badge tone={leave.status}>{leave.status}</Badge>
      <div className="leave-history-actions">{manager && leave.status === "pending" && <><Button variant="secondary" onClick={() => onAction(() => api(`/leaves/${leave._id}/decision`, { method: "PUT", body: { decision: "rejected" } }), "Request declined.")}>Decline</Button><Button onClick={() => onAction(() => api(`/leaves/${leave._id}/decision`, { method: "PUT", body: { decision: "approved" } }), "Leave approved.")}>Approve <Check size={14} /></Button></>}{!manager && leave.status === "pending" && <Button variant="secondary" onClick={() => onAction(() => api(`/leaves/${leave._id}/cancel`, { method: "PUT", body: {} }), "Leave request cancelled.")}>Cancel</Button>}</div>
    </article>
  );
}

function MeetingsPage({ meetings, people, manager, onAction }) {
  const [showForm, setShowForm] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [conflictMode, setConflictMode] = useState("none");
  const [form, setForm] = useState({ title: "", description: "", date: todayString(), startTime: "10:00", endTime: "10:30", participants: [] });
  const submit = async (force = false) => {
    setConflicts([]);
    setConflictMode("none");
    const ok = await onAction(async () => {
      const invited = people.filter((person) => form.participants.includes(person._id));
      const start = timeMinutes(form.startTime);
      const end = timeMinutes(form.endTime);
      if (end <= start) throw new Error("Meeting end time must be later than its start time.");

      const overlapping = meetings
        .filter((meeting) => meeting.status === "scheduled" && String(meeting.date).slice(0, 10) === form.date)
        .filter((meeting) => meeting.participants?.some((person) => form.participants.includes(typeof person === "string" ? person : person._id)))
        .filter((meeting) => start < timeMinutes(meeting.endTime) && end > timeMinutes(meeting.startTime));
      if (overlapping.length) {
        const conflict = new Error("The selected time overlaps another scheduled meeting.");
        conflict.conflicts = overlapping.map((meeting) => ({ intern: meeting.title, reason: `${meeting.startTime}–${meeting.endTime}` }));
        conflict.blocking = true;
        throw conflict;
      }

      const availability = await Promise.all(invited.map(async (person) => ({
        person,
        resolved: dataOf(await api(`/availability/${person._id}/resolved?date=${form.date}`)),
      })));
      const unavailable = availability.filter(({ resolved }) => resolved?.isHoliday || resolved?.isOnLeave);
      if (unavailable.length) {
        const conflict = new Error("Meetings can’t be scheduled on a holiday or approved leave.");
        conflict.conflicts = unavailable.map(({ person, resolved }) => ({
          intern: person.name,
          reason: resolved.isHoliday ? `Holiday${resolved.holidayName ? `: ${resolved.holidayName}` : ""}` : "Approved leave",
        }));
        conflict.blocking = true;
        throw conflict;
      }

      return api("/meetings", { method: "POST", body: { ...form, force: force || undefined } });
    }, force ? "Meeting scheduled with availability exceptions noted." : "Meeting scheduled.", (err) => {
      if (!err.conflicts?.length) return false;
      setConflicts(err.conflicts);
      setConflictMode(err.blocking ? "blocked" : "server");
      return true;
    });
    if (ok) { setShowForm(false); setConflicts([]); setConflictMode("none"); setForm({ title: "", description: "", date: todayString(), startTime: "10:00", endTime: "10:30", participants: [] }); }
  };
  return (
    <>
      <PageTitle eyebrow="TIME TO THINK TOGETHER" title="Meetings" description="Make space for the conversations that move the work forward." action={manager && <Button icon={Plus} onClick={() => setShowForm(!showForm)}>Schedule a meeting</Button>} />
      {manager && showForm && <form className="panel form-panel" onSubmit={(e) => { e.preventDefault(); submit(false); }}><div className="form-heading"><strong>Bring the right people together</strong><button type="button" className="icon-button" aria-label="Close" onClick={() => { setShowForm(false); setConflicts([]); setConflictMode("none"); }}><X size={16} /></button></div><div className="form-grid"><label>Meeting title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Date<input type="date" required min={todayString()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Starts at<input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label><label>Ends at<input type="time" required min={form.startTime} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label><label className="field-wide">A note for attendees<textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="field-wide"><span className="field-label">INVITE PEOPLE</span><div className="people-picker">{people.map((person) => <label className="check-person" key={person._id}><input type="checkbox" checked={form.participants.includes(person._id)} onChange={(e) => setForm({ ...form, participants: e.target.checked ? [...form.participants, person._id] : form.participants.filter((id) => id !== person._id) })} /><Avatar name={person.name} small /><span>{person.name}</span></label>)}</div></div></div>{conflicts.length > 0 && <div className="conflict-warning"><strong>{conflictMode === "blocked" ? "This time needs a change." : "Some people are outside their meeting availability."}</strong><span>{conflicts.map((conflict) => `${conflict.intern}${conflict.reason ? ` · ${conflict.reason}` : ""}`).join(", ")}</span><small>{conflictMode === "blocked" ? "Choose a different time or participant. This conflict can’t be overridden." : "You can adjust the time or explicitly confirm anyway."}</small><div><Button type="button" variant="secondary" onClick={() => { setConflicts([]); setConflictMode("none"); }}>Adjust meeting</Button>{conflictMode === "server" && <Button type="button" onClick={() => submit(true)}>Schedule anyway</Button>}</div></div>}<Button type="submit" disabled={!form.participants.length || conflicts.length > 0}>Check availability & schedule <ArrowRight size={15} /></Button></form>}
      <section className="panel table-panel"><PanelHeader title="On the calendar" subtitle={`${meetings.length} upcoming ${meetings.length === 1 ? "meeting" : "meetings"}`} /><div className="meeting-agenda">{meetings.filter((meeting) => meeting.status !== "cancelled").map((meeting) => <article className="agenda-card" key={meeting._id}><div className="agenda-date"><strong>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).getDate()}</strong><span>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", weekday: "short" })}</span></div><div className="agenda-content"><div className="agenda-title"><h3>{meeting.title}</h3><Badge tone={meeting.status}>{meeting.status}</Badge></div><p>{meeting.description || "A chance to connect and move things forward."}</p><div className="agenda-meta"><span><Clock3 size={14} />{meeting.startTime} – {meeting.endTime}</span><span><Users size={14} />{meeting.participants?.length ?? 0} attendees</span></div></div>{manager && meeting.status === "scheduled" && <div className="agenda-actions"><Button variant="secondary" onClick={() => onAction(() => api(`/meetings/${meeting._id}`, { method: "PUT", body: { status: "completed" } }), "Meeting marked complete.")}>Complete</Button><button className="icon-button" title="Cancel meeting" onClick={() => onAction(() => api(`/meetings/${meeting._id}`, { method: "PUT", body: { status: "cancelled" } }), "Meeting cancelled.")}><X size={16} /></button></div>}</article>)}</div>{!meetings.length && <EmptyState title="Open space on the calendar" detail={manager ? "Schedule a thoughtful conversation with your team." : "Meetings you’re invited to will appear here."} />}</section>
    </>
  );
}

function AvailabilityPage({ user, profile, resolved, people, manager, onPersonChange, onAction }) {
  const personId = profile?._id ?? user._id;
  const [weekly, setWeekly] = useState([]);
  const [override, setOverride] = useState({ date: todayString(), reason: "", workSlots: [], meetingSlots: [] });
  const [resolvedForDate, setResolvedForDate] = useState(null);
  const [resolvedError, setResolvedError] = useState("");
  useEffect(() => {
    if (profile?.regularAvailability) setWeekly(WEEKDAYS.map((day) => profile.regularAvailability.find((item) => item.day === day) ?? { day, workSlots: [], meetingSlots: [] }));
  }, [profile]);
  useEffect(() => {
    if (override.date === todayString()) {
      setResolvedForDate(null);
      return undefined;
    }
    let active = true;
    setResolvedForDate(null);
    setResolvedError("");
    api(`/availability/${personId}/resolved?date=${override.date}`)
      .then((result) => { if (active) setResolvedForDate(dataOf(result)); })
      .catch((err) => { if (active) setResolvedError(err.message); });
    return () => { active = false; };
  }, [personId, override.date]);
  const effective = override.date === todayString() ? resolved : resolvedForDate;
  const effectiveSlots = effective?.isHoliday || effective?.isOnLeave
    ? { ...effective, workSlots: [], meetingSlots: [] }
    : effective;
  const updateSlot = (day, type, index, key, value) => setWeekly((items) => items.map((item) => item.day !== day ? item : ({ ...item, [type]: item[type].map((slot, i) => i === index ? { ...slot, [key]: value } : slot) })));
  const addSlot = (day, type) => setWeekly((items) => items.map((item) => item.day !== day ? item : ({ ...item, [type]: [...item[type], { start: "09:00", end: "17:00" }] })));
  const removeSlot = (day, type, index) => setWeekly((items) => items.map((item) => item.day !== day ? item : ({ ...item, [type]: item[type].filter((_, i) => i !== index) })));
  const save = (e) => { e.preventDefault(); onAction(() => api(`/interns/${personId}/regular-availability`, { method: "PUT", body: { regularAvailability: weekly } }), "Weekly availability saved."); };
  const submitOverride = (e) => { e.preventDefault(); onAction(() => api("/availability/override", { method: "POST", body: { internId: personId, ...override } }), "Date-specific availability saved."); };

  return (
    <>
      <PageTitle eyebrow="INTERN PROFILE" title="Profile & availability" description="Your account details and recurring schedule in one place." action={manager && people.length > 0 && <label className="person-filter">Viewing<select value={personId} onChange={(e) => onPersonChange(e.target.value)}>{people.map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}</select></label>} />
      <section className="reference-card profile-summary-card"><div className="profile-summary-avatar"><Avatar name={profile?.name ?? user.name} /></div><div className="profile-summary-main"><div className="profile-summary-name"><h2>{profile?.name ?? user.name}</h2><Badge tone={profile?.role ?? user.role}>{profile?.role ?? user.role}</Badge>{profile?.isActive === false && <Badge tone="pending">Inactive</Badge>}</div><p>{entityName(profile?.team) || "No team assigned"}{profile?.createdAt ? ` · Joined ${prettyDate(profile.createdAt, { month: "short", year: "numeric" })}` : ""}</p><div className="profile-contact-row"><span>{profile?.email ?? user.email}</span>{profile?.phone && <span>{profile.phone}</span>}</div></div><button className="profile-edit-link" onClick={() => document.querySelector(".weekly-panel")?.scrollIntoView({ behavior: "smooth" })}>Edit availability <ArrowRight size={14} /></button></section>
      <section className="availability-banner"><div className="availability-banner-icon"><CalendarDays size={19} /></div><div className="row-grow"><strong>{prettyDate(override.date)} · Effective schedule</strong><span>{resolvedError || (effective?.isHoliday ? `Holiday · ${effective.holidayName}` : effective?.isOnLeave ? "Approved leave" : `Effective schedule comes from ${effective?.source === "override" ? "a date-specific override" : "your recurring weekly availability"}.`)}</span></div><Badge tone={effective?.isHoliday || effective?.isOnLeave ? "pending" : "active"}>{effective?.isHoliday ? "Holiday" : effective?.isOnLeave ? "On leave" : effective?.source ?? "weekly"}</Badge></section>
      <div className="availability-two-col">
        <form className="panel weekly-panel" onSubmit={save}><PanelHeader title="Your weekly rhythm" subtitle="Monday through Saturday · recurring schedule" /><div className="schedule-legend"><span><i className="legend-work" />Work hours</span><span><i className="legend-meeting" />Meeting hours</span></div><div className="weekly-list">{weekly.map((day) => <div className="weekday-row" key={day.day}><div className="weekday-name">{day.day.slice(0, 3)}</div><div className="weekday-slots">{["workSlots", "meetingSlots"].map((type) => <div className={`slot-column slot-${type}`} key={type}><span className="slot-label">{type === "workSlots" ? "WORK" : "MEETINGS"}</span>{day[type].map((slot, index) => <div className="slot-inputs" key={`${type}-${index}`}><input aria-label={`${day.day} ${type} start`} type="time" value={slot.start} onChange={(e) => updateSlot(day.day, type, index, "start", e.target.value)} /><span>–</span><input aria-label={`${day.day} ${type} end`} type="time" value={slot.end} onChange={(e) => updateSlot(day.day, type, index, "end", e.target.value)} /><button type="button" className="icon-button slot-remove" aria-label={`Remove ${type} slot`} onClick={() => removeSlot(day.day, type, index)}><X size={13} /></button></div>)}<button className="add-slot" type="button" onClick={() => addSlot(day.day, type)}><Plus size={13} />Add time</button></div>)}</div></div>)}</div><div className="form-actions"><span>Leave a time empty to keep that day clear.</span><Button type="submit">Save weekly schedule <Check size={15} /></Button></div></form>
        <div className="availability-side">
          <section className="panel effective-panel"><PanelHeader title={`Effective ${prettyDate(override.date, { month: "short", day: "numeric" })}`} subtitle="What the team can expect" /><div className="effective-group"><span className="effective-icon work-icon"><Clock3 size={15} /></span><div><strong>Work availability</strong>{(effectiveSlots?.workSlots ?? []).length ? effectiveSlots.workSlots.map((slot, index) => <span key={index}>{slot.start} – {slot.end}</span>) : <span>No work hours set</span>}</div></div><div className="effective-group"><span className="effective-icon meet-icon"><CalendarDays size={15} /></span><div><strong>Meeting availability</strong>{(effectiveSlots?.meetingSlots ?? []).length ? effectiveSlots.meetingSlots.map((slot, index) => <span key={index}>{slot.start} – {slot.end}</span>) : <span>No meeting hours set</span>}</div></div><div className="precedence-note"><Sparkles size={15} /><span>Holiday → approved leave → date override → weekly schedule</span></div></section>
          <form className="panel override-panel" onSubmit={submitOverride}><PanelHeader title="A different day?" subtitle="Add an exception without changing your weekly schedule." /><label>Date<input type="date" required value={override.date} onChange={(e) => setOverride({ ...override, date: e.target.value })} /></label><label>Reason<input value={override.reason} onChange={(e) => setOverride({ ...override, reason: e.target.value })} placeholder="Optional note" /></label><div className="override-time-grid"><label>Work starts<input type="time" value={override.workSlots[0]?.start ?? ""} onChange={(e) => setOverride({ ...override, workSlots: e.target.value ? [{ start: e.target.value, end: override.workSlots[0]?.end ?? "17:00" }] : [] })} /></label><label>Work ends<input type="time" value={override.workSlots[0]?.end ?? ""} onChange={(e) => setOverride({ ...override, workSlots: override.workSlots[0] ? [{ ...override.workSlots[0], end: e.target.value }] : [{ start: "09:00", end: e.target.value }] })} /></label><label>Meetings start<input type="time" value={override.meetingSlots[0]?.start ?? ""} onChange={(e) => setOverride({ ...override, meetingSlots: e.target.value ? [{ start: e.target.value, end: override.meetingSlots[0]?.end ?? "17:00" }] : [] })} /></label><label>Meetings end<input type="time" value={override.meetingSlots[0]?.end ?? ""} onChange={(e) => setOverride({ ...override, meetingSlots: override.meetingSlots[0] ? [{ ...override.meetingSlots[0], end: e.target.value }] : [{ start: "09:00", end: e.target.value }] })} /></label></div><Button type="submit">Save date override <ArrowRight size={15} /></Button></form>
        </div>
      </div>
    </>
  );
}

function CalendarPage({ holidays, meetings, manager, onAction, onNavigate }) {
  const [form, setForm] = useState({ date: "", name: "", description: "" });
  const [selectedDate, setSelectedDate] = useState(todayString());
  const displayedWeek = weekDates(selectedDate);
  const weekKeys = new Set(displayedWeek.map(dateKey));
  const weekMeetings = meetings.filter((meeting) => weekKeys.has(String(meeting.date).slice(0, 10)));
  const selectedMeetings = weekMeetings.filter((meeting) => String(meeting.date).slice(0, 10) === selectedDate);
  const shiftWeek = (direction) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + direction * 7);
    setSelectedDate(dateKey(date));
  };
  return (
    <div className="reference-page calendar-page">
      <PageTitle eyebrow="SCHEDULE & AVAILABILITY" title="Schedule & Availability" description="Your weekly agenda, upcoming calls and shared organization holidays." action={manager && <Button icon={Plus} onClick={() => document.getElementById("holiday-form")?.scrollIntoView({ behavior: "smooth" })}>Add holiday</Button>} />
      {manager && <form id="holiday-form" className="reference-card holiday-create-form" onSubmit={async (event) => { event.preventDefault(); if (await onAction(() => api("/holidays", { method: "POST", body: form }), "Holiday added to the calendar.")) setForm({ date: "", name: "", description: "" }); }}><div className="reference-card-heading"><div><span className="reference-kicker">WORKSPACE SETTINGS</span><h2>Add an organization holiday</h2></div></div><div className="holiday-create-fields"><label>Holiday name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><Button type="submit">Save holiday <Plus size={14} /></Button></div></form>}
      <div className="calendar-page-grid">
        <section className="reference-card weekly-agenda-card">
          <div className="reference-card-heading calendar-heading"><div><span className="reference-kicker">WEEKLY AGENDA</span><h2>{displayedWeek[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {displayedWeek[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</h2><p>Meetings scheduled for this week</p></div><div className="week-controls"><button onClick={() => shiftWeek(-1)} aria-label="Previous week">‹</button><button onClick={() => setSelectedDate(todayString())}>Today</button><button onClick={() => shiftWeek(1)} aria-label="Next week">›</button></div></div>
          <div className="week-date-strip">{displayedWeek.map((day) => {
            const key = dateKey(day);
            const hasMeeting = weekMeetings.some((meeting) => String(meeting.date).slice(0, 10) === key);
            const holiday = holidays.find((item) => String(item.date).slice(0, 10) === key);
            return <button className={`week-date-button${selectedDate === key ? " selected" : ""}${key === todayString() ? " today" : ""}`} key={key} onClick={() => setSelectedDate(key)}><small>{day.toLocaleDateString("en-US", { weekday: "short" })}</small><strong>{day.getDate()}</strong>{(hasMeeting || holiday) && <i className={holiday ? "holiday-dot" : ""} />}</button>;
          })}</div>
          <div className="weekly-agenda-body"><div className="agenda-section-title"><span>{selectedDate === todayString() ? "TODAY’S TIMEFLOW" : prettyDate(selectedDate, { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}</span><small>{selectedMeetings.length} scheduled</small></div>
            {selectedMeetings.length ? selectedMeetings.map((meeting) => <article className="weekly-meeting-row" key={meeting._id}><time>{meeting.startTime}</time><span className="weekly-meeting-rule" /><div><strong>{meeting.title}</strong><small>{meeting.startTime} – {meeting.endTime}{meeting.description ? ` · ${meeting.description}` : ""}</small></div><Badge tone={meeting.status}>{meeting.status}</Badge></article>) : <div className="calendar-empty-day"><CalendarDays size={20} /><strong>No meetings scheduled</strong><span>Choose another day or review the week’s upcoming calls.</span></div>}
          </div>
          <div className="weekly-agenda-footer"><span><i /> Scheduled meeting</span><span><i className="holiday-dot" /> Organization holiday</span>{manager && <button className="small-link" onClick={() => onNavigate("meetings")}>Schedule a meeting <ArrowRight size={13} /></button>}</div>
        </section>
        <aside className="calendar-right-column">
          <section className="reference-card upcoming-calls-card"><div className="reference-card-heading"><div><span className="reference-kicker">COMING UP</span><h2>Upcoming calls</h2></div><span className="call-count">{meetings.length}</span></div>
            {meetings.length ? meetings.slice(0, 4).map((meeting) => <article className="upcoming-call-row" key={meeting._id}><div className="upcoming-call-date"><strong>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).getDate()}</strong><small>{new Date(`${String(meeting.date).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short" })}</small></div><span><strong>{meeting.title}</strong><small>{meeting.startTime} – {meeting.endTime}</small>{entityName(meeting.createdBy) && <small>{entityName(meeting.createdBy)}</small>}</span></article>) : <EmptyState title="No upcoming calls" detail="Scheduled meetings will appear here." />}
          </section>
          <section className="reference-card upcoming-holidays-card"><div className="reference-card-heading"><div><span className="reference-kicker">SHARED DAYS OFF</span><h2>Organization holidays</h2></div></div>
            {holidays.length ? holidays.slice(0, 4).map((holiday) => <article className="upcoming-holiday-row" key={holiday._id}><div className="upcoming-call-date holiday-date"><strong>{new Date(`${String(holiday.date).slice(0, 10)}T12:00:00`).getDate()}</strong><small>{new Date(`${String(holiday.date).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short" })}</small></div><span><strong>{holiday.name}</strong><small>{prettyDate(holiday.date, { weekday: "long" })}</small></span>{manager && <button className="icon-button" title="Remove holiday" onClick={() => onAction(() => api(`/holidays/${holiday._id}`, { method: "DELETE" }), "Holiday removed.")}><X size={14} /></button>}</article>) : <p className="reference-muted">No organization holidays are listed.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
