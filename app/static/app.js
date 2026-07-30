const ICONS = {
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v3M18 3v3M4.5 8.5h15M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>',
  people: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 10.5a3 3 0 0 0 0-6M17.5 14.5a4 4 0 0 1 3.5 4V20"/></svg>',
  "check-square": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 6-7"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9.5 5 5 5-5"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 .9 2.6A5 5 0 0 0 16 8.7l2.6.9-2.6.9a5 5 0 0 0-3.1 3.1L12 16l-.9-2.4A5 5 0 0 0 8 10.5l-2.6-.9L8 8.7a5 5 0 0 0 3.1-3.1L12 3ZM18.5 15l.5 1.4a3 3 0 0 0 1.6 1.6l1.4.5-1.4.5a3 3 0 0 0-1.6 1.6l-.5 1.4-.5-1.4a3 3 0 0 0-1.6-1.6l-1.4-.5 1.4-.5a3 3 0 0 0 1.6-1.6l.5-1.4Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14a4 4 0 0 0 0 8h14a4 4 0 0 0 0-8"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  panel: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16M7 8h3M7 12h3"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
};

const state = {
  activeSection: "meetings",
  workspaces: [],
  currentWorkspace: null,
  meetings: [],
  persons: [],
  selectedMeetingId: null,
  selectedPersonId: null,
  personReturnContext: null,
  personDetail: null,
  personDetailTab: "overview",
  personContributionQuery: "",
  personActionStatus: "",
  activeTab: "overview",
  meetingPage: 1,
  meetingsPerPage: 5,
};

const elements = {
  shell: document.querySelector(".app-shell"),
  meetingColumn: document.querySelector(".meeting-column"),
  peopleColumn: document.querySelector(".people-column"),
  meetingsNav: document.querySelector("#meetings-nav"),
  personsNav: document.querySelector("#persons-nav"),
  workspaceButton: document.querySelector("#workspace-button"),
  workspaceName: document.querySelector("#workspace-name"),
  workspaceMenu: document.querySelector("#workspace-menu"),
  loading: document.querySelector("#loading-state"),
  list: document.querySelector("#meeting-list"),
  recentList: document.querySelector("#recent-meeting-list"),
  pagination: document.querySelector("#meeting-pagination"),
  empty: document.querySelector("#empty-meetings"),
  noResults: document.querySelector("#no-results"),
  search: document.querySelector("#meeting-search"),
  dateFilter: document.querySelector("#date-filter"),
  statusFilter: document.querySelector("#status-filter"),
  detailPanel: document.querySelector("#detail-panel"),
  detail: document.querySelector("#meeting-detail"),
  modal: document.querySelector("#modal-backdrop"),
  form: document.querySelector("#summary-form"),
  fileInput: document.querySelector("#transcript-file"),
  quickFile: document.querySelector("#quick-file"),
  transcript: document.querySelector("#raw-transcript"),
  fileLabel: document.querySelector("#file-label"),
  formError: document.querySelector("#form-error"),
  submitButton: document.querySelector("#submit-button"),
  headerUploadButton: document.querySelector("#header-upload-button"),
  modalFileZone: document.querySelector("#modal-file-zone"),
  sidebar: document.querySelector("#sidebar"),
  sidebarScrim: document.querySelector("#sidebar-scrim"),
  toast: document.querySelector("#toast"),
  peopleLoading: document.querySelector("#people-loading"),
  peopleList: document.querySelector("#people-list"),
  peopleEmpty: document.querySelector("#empty-people"),
  peopleNoResults: document.querySelector("#no-person-results"),
  personSearch: document.querySelector("#person-search"),
};

function setIcon(element, name) {
  element.dataset.icon = name;
  element.innerHTML = ICONS[name] || "";
  return element;
}

document.querySelectorAll("[data-icon]").forEach((element) => setIcon(element, element.dataset.icon));

function create(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function icon(name, className = "") {
  return setIcon(create("span", className), name);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function transitionPage(update, direction = "forward") {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }
  document.documentElement.classList.toggle("back-transition", direction === "back");
  const transition = document.startViewTransition(update);
  return transition.finished.finally(() => document.documentElement.classList.remove("back-transition"));
}

function initials(name = "?") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "?";
}

function avatarColor(name = "") {
  const colors = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#db2777", "#15803d"];
  const hash = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function formatDate(value, includeTime = true) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function durationMinutes(meeting) {
  if (!meeting.scheduled_started_at || !meeting.scheduled_ended_at) return null;
  const duration = Math.round((new Date(meeting.scheduled_ended_at) - new Date(meeting.scheduled_started_at)) / 60_000);
  return duration > 0 ? duration : null;
}

function durationLabel(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${minutes} min`;
  return `${hours}h${remainder ? ` ${remainder}m` : ""}`;
}

function meetingPeople(meeting) {
  const names = [...(meeting.participants || []), ...(meeting.transcript || []).map((segment) => segment.speaker)].filter(Boolean);
  return [...new Set(names)];
}

function meetingStatus(meeting) {
  return meeting.summary || meeting.decisions || meeting.action_items?.length ? "processed" : "processing";
}

function decisionCount(meeting) {
  return meeting.decisions?.split(/\n+/).map((decision) => decision.trim()).filter(Boolean).length || 0;
}

function openActions(meeting) {
  return (meeting.action_items || []).filter((item) => !["FINISHED", "CANCELLED"].includes(String(item.status).toUpperCase()));
}

function overdueActionCount(meeting) {
  const now = new Date();
  return openActions(meeting).filter((item) => item.due_date && new Date(item.due_date) < now).length;
}

function meetingVisual(meeting) {
  const platform = String(meeting.platform || "").toLocaleLowerCase();
  if (platform.includes("zoom")) return { icon: "panel", className: "accent-blue" };
  if (platform.includes("google")) return { icon: "people", className: "accent-teal" };
  const accents = [
    { icon: "calendar", className: "accent-violet" },
    { icon: "sparkles", className: "accent-orange" },
    { icon: "people", className: "accent-blue" },
    { icon: "calendar", className: "accent-rose" },
  ];
  const source = meeting.id || meeting.title || "meeting";
  const hash = [...source].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return accents[hash % accents.length];
}

function renderStatusBadge(meeting) {
  const status = meetingStatus(meeting);
  if (status === "processed") return null;
  const badge = create("span", `status-badge ${status === "processing" ? "processing" : ""}`);
  badge.append(create("span", "status-dot"), document.createTextNode(status === "processed" ? "Processed" : "Processing"));
  return badge;
}

function renderStatusIndicator(meeting) {
  const badge = renderStatusBadge(meeting);
  if (badge) return badge;
  const indicator = icon("check", "processed-check");
  indicator.title = "Processed";
  indicator.setAttribute("aria-label", "Processed");
  return indicator;
}

function makeMeetingInteractive(element, meeting) {
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  element.setAttribute("aria-label", `Open ${meeting.title}`);
  const choose = () => selectMeeting(meeting.id);
  element.addEventListener("click", choose);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose();
    }
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.add("hidden"), 3200);
}

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Something went wrong. Please try again.");
  return body;
}

function toggleWorkspaceMenu(force) {
  const shouldOpen = force ?? elements.workspaceMenu.classList.contains("hidden");
  elements.workspaceMenu.classList.toggle("hidden", !shouldOpen);
  elements.workspaceButton.setAttribute("aria-expanded", String(shouldOpen));
}

function renderWorkspaces() {
  elements.workspaceMenu.replaceChildren();
  if (!state.workspaces.length) {
    elements.workspaceName.textContent = "No workspace";
    const message = create("p", "workspace-option", "No workspaces available");
    elements.workspaceMenu.append(message);
    return;
  }

  elements.workspaceName.textContent = state.currentWorkspace.name;
  document.querySelector(".workspace-button .workspace-avatar").textContent = initials(state.currentWorkspace.name);
  state.workspaces.forEach((workspace) => {
    const button = create("button", `workspace-option${workspace.id === state.currentWorkspace.id ? " selected" : ""}`);
    button.type = "button";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(workspace.id === state.currentWorkspace.id));
    const avatar = create("span", "workspace-avatar", initials(workspace.name));
    button.append(avatar, create("span", "", workspace.name));
    if (workspace.id === state.currentWorkspace.id) button.append(icon("check"));
    button.addEventListener("click", async () => {
      if (workspace.id === state.currentWorkspace.id) return toggleWorkspaceMenu(false);
      state.currentWorkspace = workspace;
      state.selectedMeetingId = null;
      state.selectedPersonId = null;
      state.personReturnContext = null;
      state.personDetail = null;
      localStorage.setItem("memoir.workspace", workspace.id);
      renderWorkspaces();
      toggleWorkspaceMenu(false);
      await Promise.all([loadMeetings(), loadPersons()]);
      showSection(state.activeSection);
      showToast(`Switched to ${workspace.name}`);
    });
    elements.workspaceMenu.append(button);
  });
}

async function loadWorkspaces() {
  try {
    const body = await request("/workspaces");
    state.workspaces = body.workspaces || [];
    const savedId = localStorage.getItem("memoir.workspace");
    state.currentWorkspace = state.workspaces.find((workspace) => workspace.id === savedId) || state.workspaces[0] || null;
    renderWorkspaces();
  } catch (error) {
    elements.workspaceName.textContent = "Unavailable";
    showToast(error.message);
  }
}

async function loadMeetings(preferredMeetingId = null) {
  elements.loading.classList.remove("hidden");
  elements.list.classList.add("hidden");
  elements.empty.classList.add("hidden");
  elements.noResults.classList.add("hidden");
  try {
    const query = state.currentWorkspace ? `?workspace_id=${encodeURIComponent(state.currentWorkspace.id)}` : "";
    const body = await request(`/meetings${query}`);
    state.meetings = body.meetings || [];
    const preferred = preferredMeetingId && state.meetings.find((meeting) => meeting.id === preferredMeetingId);
    const existing = state.meetings.find((meeting) => meeting.id === state.selectedMeetingId);
    const selection = preferred || existing || null;
    state.selectedMeetingId = selection?.id || null;
    renderMeetingList();
    renderDetail(selection);
  } catch (error) {
    state.meetings = [];
    renderMeetingList();
    showToast(error.message);
  } finally {
    elements.loading.classList.add("hidden");
  }
}

async function loadPersons() {
  elements.peopleLoading.classList.remove("hidden");
  elements.peopleList.classList.add("hidden");
  try {
    const params = new URLSearchParams({ limit: "100" });
    if (state.currentWorkspace) params.set("workspace_id", state.currentWorkspace.id);
    const body = await request(`/persons?${params}`);
    state.persons = body.items || [];
    renderPersonDirectory();
  } catch (error) {
    state.persons = [];
    renderPersonDirectory();
    showToast(error.message);
  } finally {
    elements.peopleLoading.classList.add("hidden");
  }
}

function filteredPersons() {
  const query = elements.personSearch.value.trim().toLocaleLowerCase();
  if (!query) return state.persons;
  return state.persons.filter((person) => [person.name, person.email].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));
}

function renderPersonDirectory() {
  const persons = filteredPersons();
  elements.peopleList.replaceChildren();
  elements.peopleEmpty.classList.toggle("hidden", state.persons.length > 0);
  elements.peopleNoResults.classList.toggle("hidden", state.persons.length === 0 || persons.length > 0);
  elements.peopleList.classList.toggle("hidden", persons.length === 0);

  persons.forEach((person) => {
    const card = create("article", "person-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${person.name}`);
    const header = create("header", "person-card-header");
    const avatar = create("span", "person-avatar", initials(person.name));
    avatar.style.setProperty("--avatar-color", avatarColor(person.name));
    const copy = create("div", "person-card-copy");
    copy.append(create("strong", "", person.name), create("span", "", person.email || "No email recorded"));
    header.append(avatar, copy);
    const stats = create("div", "person-card-stats");
    [
      [person.meeting_count, "meetings"],
      [person.contribution_count, "contributions"],
      [person.open_action_item_count, "open actions"],
    ].forEach(([value, label]) => {
      const stat = create("div", "person-card-stat");
      stat.append(create("strong", "", String(value)), create("span", "", label));
      stats.append(stat);
    });
    const lastSeen = person.last_participated_at ? `Last participated ${formatDate(person.last_participated_at, false)}` : "No meeting participation yet";
    card.append(header, stats, create("footer", "person-card-footer", lastSeen));
    const choose = () => selectPerson(person.id);
    card.addEventListener("click", choose);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose();
      }
    });
    elements.peopleList.append(card);
  });
}

function showSection(section) {
  return transitionPage(() => {
    state.activeSection = section;
    state.selectedMeetingId = null;
    state.selectedPersonId = null;
    state.personReturnContext = null;
    state.personDetail = null;
    elements.shell.classList.remove("detail-view");
    elements.detail.classList.add("hidden");
    elements.detail.replaceChildren();
    elements.meetingColumn.classList.toggle("hidden", section !== "meetings");
    elements.peopleColumn.classList.toggle("hidden", section !== "persons");
    elements.meetingsNav.classList.toggle("active", section === "meetings");
    elements.personsNav.classList.toggle("active", section === "persons");
    document.title = section === "persons" ? "Memoir · Persons" : "Memoir · Meetings";
    window.history.replaceState(null, "", `#${section}`);
    if (section === "meetings") renderMeetingList();
    if (section === "persons") renderPersonDirectory();
    window.scrollTo({ top: 0 });
  }, "back");
}

function filteredMeetings() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const date = elements.dateFilter.value;
  const status = elements.statusFilter.value;
  const now = new Date();
  const cutoff = new Date(now);
  if (date === "week") cutoff.setDate(now.getDate() - 7);
  if (date === "month") cutoff.setMonth(now.getMonth() - 1);

  return state.meetings.filter((meeting) => {
    const searchable = [meeting.title, meeting.description, meeting.summary, ...meetingPeople(meeting)].filter(Boolean).join(" ").toLocaleLowerCase();
    const timestamp = meeting.scheduled_started_at || meeting.created_at;
    const matchesDate = date === "all" || (timestamp && new Date(timestamp) >= cutoff);
    return (!query || searchable.includes(query)) && matchesDate && (status === "all" || meetingStatus(meeting) === status);
  });
}

function renderMeetingList() {
  const meetings = filteredMeetings();
  elements.list.replaceChildren();
  elements.recentList.replaceChildren();
  elements.pagination.replaceChildren();
  elements.empty.classList.toggle("hidden", state.meetings.length > 0);
  elements.noResults.classList.toggle("hidden", state.meetings.length === 0 || meetings.length > 0);
  elements.list.classList.toggle("hidden", meetings.length === 0);
  elements.pagination.classList.toggle("hidden", meetings.length === 0);
  elements.recentList.closest(".recent-section").classList.toggle("hidden", state.meetings.length === 0);

  state.meetings.slice(0, 3).forEach((meeting) => {
    const people = meetingPeople(meeting);
    const visual = meetingVisual(meeting);
    const card = create("article", "recent-meeting-card");
    const top = create("div", "recent-card-top");
    top.append(icon(visual.icon, `meeting-type ${visual.className}`));
    const exceptionalStatus = renderStatusBadge(meeting);
    if (exceptionalStatus) top.append(exceptionalStatus);
    const title = create("h3", "", meeting.title || "Untitled meeting");
    const meta = create("div", "recent-card-meta");
    const timestamp = meeting.scheduled_started_at || meeting.created_at;
    [formatDate(timestamp, false), formatTime(timestamp), durationLabel(durationMinutes(meeting))].filter(Boolean).forEach((value) => meta.append(create("span", "", value)));
    if (meetingStatus(meeting) === "processed") meta.append(renderStatusIndicator(meeting));
    const participants = create("div", "recent-participants");
    if (people.length) participants.append(renderAvatars(people, 4));
    else participants.append(create("span", "no-participants", "No speakers recorded"));
    const summary = create("p", "recent-summary", meeting.summary || meeting.description || "Meeting insights are still being prepared.");
    const footer = create("footer", "recent-card-footer");
    const openActionCount = openActions(meeting).length;
    const overdueCount = overdueActionCount(meeting);
    const actions = create("span", "open-actions"); actions.append(icon("check-square"), document.createTextNode(`${openActionCount} open ${openActionCount === 1 ? "action" : "actions"}`));
    if (overdueCount) actions.append(create("span", "overdue-actions", `· ${overdueCount} overdue`));
    const decisionsTotal = decisionCount(meeting);
    const decisions = create("span"); decisions.append(icon("sparkles"), document.createTextNode(`${decisionsTotal} ${decisionsTotal === 1 ? "decision" : "decisions"}`));
    footer.append(actions, decisions);
    card.append(top, title, meta, participants, summary, footer);
    makeMeetingInteractive(card, meeting);
    elements.recentList.append(card);
  });

  const pageCount = Math.max(1, Math.ceil(meetings.length / state.meetingsPerPage));
  state.meetingPage = Math.min(state.meetingPage, pageCount);
  const start = (state.meetingPage - 1) * state.meetingsPerPage;
  meetings.slice(start, start + state.meetingsPerPage).forEach((meeting) => {
    const people = meetingPeople(meeting);
    const visual = meetingVisual(meeting);
    const row = create("article", "meeting-row");
    row.append(icon(visual.icon, `row-meeting-icon ${visual.className}`), create("strong", "row-meeting-title", meeting.title || "Untitled meeting"));
    const participantCell = create("div", "row-participants");
    if (people.length) participantCell.append(renderAvatars(people, 3));
    else participantCell.append(create("span", "no-participants", "—"));
    const timestamp = meeting.scheduled_started_at || meeting.created_at;
    const openActionCount = openActions(meeting).length;
    const overdueCount = overdueActionCount(meeting);
    const actions = create("span", "row-stat row-actions"); actions.append(icon("check-square"), document.createTextNode(`${openActionCount} open ${openActionCount === 1 ? "action" : "actions"}${overdueCount ? ` · ${overdueCount} overdue` : ""}`));
    const decisionsTotal = decisionCount(meeting);
    const decisions = create("span", "row-stat row-decisions"); decisions.append(icon("sparkles"), document.createTextNode(`${decisionsTotal} ${decisionsTotal === 1 ? "decision" : "decisions"}`));
    row.append(
      participantCell,
      create("time", "row-date", formatDate(timestamp) || "No date"),
      create("span", "row-duration", durationLabel(durationMinutes(meeting)) || "—"),
      actions,
      decisions,
      renderStatusIndicator(meeting),
      icon("more", "row-more"),
    );
    makeMeetingInteractive(row, meeting);
    elements.list.append(row);
  });

  if (meetings.length) {
    const end = Math.min(start + state.meetingsPerPage, meetings.length);
    elements.pagination.append(create("span", "pagination-summary", `Showing ${start + 1} to ${end} of ${meetings.length} meetings`));
    const controls = create("div", "pagination-controls");
    const addPageButton = (label, page, disabled = false, active = false) => {
      const button = create("button", active ? "active" : "", label); button.type = "button"; button.disabled = disabled;
      button.addEventListener("click", () => { state.meetingPage = page; renderMeetingList(); document.querySelector("#all-meetings").scrollIntoView({ behavior: "smooth", block: "start" }); });
      controls.append(button);
    };
    addPageButton("‹", Math.max(1, state.meetingPage - 1), state.meetingPage === 1);
    for (let page = 1; page <= pageCount; page += 1) addPageButton(String(page), page, false, page === state.meetingPage);
    addPageButton("›", Math.min(pageCount, state.meetingPage + 1), state.meetingPage === pageCount);
    elements.pagination.append(controls);
  }
}

function selectMeeting(meetingId) {
  const meeting = state.meetings.find((item) => item.id === meetingId);
  transitionPage(() => {
    state.selectedMeetingId = meetingId;
    state.activeTab = "overview";
    renderMeetingList();
    renderDetail(meeting);
    window.scrollTo({ top: 0 });
  });
}

function renderAvatars(names, limit = 4) {
  const stack = create("div", "avatar-stack");
  names.slice(0, limit).forEach((name) => {
    const avatar = create("span", "avatar", initials(name));
    avatar.style.setProperty("--avatar-color", avatarColor(name));
    avatar.title = name;
    stack.append(avatar);
  });
  if (names.length > limit) {
    const more = create("span", "avatar", `+${names.length - limit}`);
    more.style.setProperty("--avatar-color", "#8b91a5");
    stack.append(more);
  }
  return stack;
}

function insightCard(title, iconName, body, countLabel = null, accent = "purple") {
  const card = create("section", `insight-card ${accent}`);
  const heading = create("header", "insight-card-heading");
  heading.append(icon(iconName), create("h3", "", title));
  card.append(heading, body);
  if (countLabel) card.append(create("span", "insight-count", countLabel));
  return card;
}

function renderDecisionList(meeting) {
  const list = create("ul", "decision-list");
  if (!meeting.decisions) {
    list.append(create("li", "muted-list-item", "No decisions were recorded."));
    return list;
  }
  meeting.decisions.split(/\n+/).map((item) => item.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).forEach((decision) => list.append(create("li", "", decision)));
  return list;
}

function renderActionList(meeting) {
  const list = create("ul", "action-list");
  if (!meeting.action_items?.length) {
    list.append(create("li", "muted-list-item", "No action items were identified."));
    return list;
  }
  meeting.action_items.forEach((item) => {
    const done = String(item.status).toUpperCase() === "FINISHED";
    const row = create("li", `action-item${done ? " done" : ""}`);
    const check = create("span", "action-check");
    if (done) check.append(icon("check"));
    const content = create("div");
    content.append(create("div", "action-content", item.content));
    const meta = create("div", "action-meta");
    if (item.assignee) meta.append(create("span", "action-assignee", item.assignee));
    if (item.due_date) { const due = create("span"); due.append(icon("calendar"), document.createTextNode(formatDate(item.due_date, false))); meta.append(due); }
    if (meta.children.length) content.append(meta);
    row.append(check, content); list.append(row);
  });
  return list;
}

function renderOverview(meeting) {
  const wrapper = create("div", "overview-layout");
  const grid = create("div", "insight-grid");
  const summary = create("p", meeting.summary ? "" : "empty-copy", meeting.summary || "A summary is not available for this meeting yet.");
  const decisionCount = meeting.decisions ? meeting.decisions.split(/\n+/).filter(Boolean).length : 0;
  const openActionCount = openActions(meeting).length;
  const overdueCount = overdueActionCount(meeting);
  grid.append(
    insightCard("Summary", "sparkles", summary),
    insightCard("Decisions", "check", renderDecisionList(meeting), decisionCount ? `${decisionCount} ${decisionCount === 1 ? "decision" : "decisions"}` : null, "green"),
    insightCard("Action items", "check-square", renderActionList(meeting), openActionCount ? `${openActionCount} open ${openActionCount === 1 ? "action" : "actions"}${overdueCount ? ` · ${overdueCount} overdue` : ""}` : null, "blue"),
  );
  wrapper.append(grid);

  const preview = create("section", "transcript-preview");
  const previewHeading = create("header", "preview-heading");
  previewHeading.append(create("h3", "", "Transcript preview"));
  if (meeting.transcript?.length > 3) {
    const viewAll = create("button", "preview-link", "View full transcript");
    viewAll.type = "button";
    viewAll.addEventListener("click", () => { state.activeTab = "transcript"; renderActiveTab(meeting); });
    previewHeading.append(viewAll);
  }
  preview.append(previewHeading, renderTranscript(meeting, 3));
  wrapper.append(preview);
  return wrapper;
}

function renderTranscript(meeting, limit = null) {
  if (!meeting.transcript?.length) return create("p", "tab-empty", "No transcript segments are stored for this meeting.");
  const list = create("div", "transcript-list");
  const segments = limit ? meeting.transcript.slice(0, limit) : meeting.transcript;
  segments.forEach((segment) => {
    const row = create("article", "transcript-row");
    const avatar = create("span", "avatar", initials(segment.speaker));
    avatar.style.setProperty("--avatar-color", avatarColor(segment.speaker));
    const copy = create("div");
    const speaker = create("div", "transcript-speaker");
    speaker.append(create("strong", "", segment.speaker || "Unknown speaker"));
    if (segment.timestamp_start) speaker.append(create("time", "", segment.timestamp_start));
    copy.append(speaker, create("p", "", segment.text));
    row.append(avatar, copy); list.append(row);
  });
  return list;
}

function renderParticipants(meeting) {
  const people = meeting.participant_details?.length
    ? meeting.participant_details
    : meetingPeople(meeting).map((name) => ({
      id: meeting.transcript?.find((segment) => segment.speaker === name)?.person_id || null,
      name,
    }));
  if (!people.length) return create("p", "tab-empty", "No participants are stored for this meeting.");
  const list = create("div", "participant-list");
  people.forEach((person) => {
    const row = create(person.id ? "button" : "div", `participant-row${person.id ? " participant-link" : ""}`);
    if (person.id) {
      row.type = "button";
      row.setAttribute("aria-label", `Open ${person.name}'s person page`);
    }
    const avatar = create("span", "avatar", initials(person.name));
    avatar.style.setProperty("--avatar-color", avatarColor(person.name));
    const contributionCount = meeting.transcript?.filter((segment) => person.id ? segment.person_id === person.id : segment.speaker === person.name).length || 0;
    const copy = create("div");
    copy.append(create("strong", "", person.name), create("span", "", contributionCount ? `${contributionCount} transcript ${contributionCount === 1 ? "segment" : "segments"}` : "Meeting participant"));
    row.append(avatar, copy);
    if (person.id) {
      row.append(icon("chevron", "participant-link-arrow"));
      row.addEventListener("click", () => {
        selectPerson(person.id, {
          meetingId: meeting.id,
          meetingTitle: meeting.title || "Meeting",
          meetingTab: "participants",
        });
      });
    }
    list.append(row);
  });
  return list;
}

function renderActiveTab(meeting) {
  const body = elements.detail.querySelector(".detail-body");
  body.replaceChildren();
  if (state.activeTab === "overview") body.append(renderOverview(meeting));
  if (state.activeTab === "transcript") body.append(renderTranscript(meeting));
  if (state.activeTab === "participants") body.append(renderParticipants(meeting));
  elements.detail.querySelectorAll(".detail-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.activeTab));
  if (!prefersReducedMotion()) {
    body.animate(
      [{ opacity: 0, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 220, easing: "cubic-bezier(.2, .75, .25, 1)" },
    );
  }
}

function showMeetingList() {
  transitionPage(() => {
    state.selectedMeetingId = null;
    state.activeTab = "overview";
    elements.shell.classList.remove("detail-view");
    elements.detail.classList.add("hidden");
    elements.detail.replaceChildren();
    renderMeetingList();
    window.scrollTo({ top: 0 });
  }, "back");
}

function renderDetail(meeting) {
  elements.detail.replaceChildren();
  if (!meeting) {
    elements.detail.classList.add("hidden");
    elements.shell.classList.remove("detail-view");
    return;
  }
  elements.shell.classList.add("detail-view");
  elements.detail.classList.remove("hidden");

  const header = create("header", "detail-header");
  const backButton = create("button", "back-button", "Back to meetings");
  backButton.type = "button";
  backButton.prepend(icon("chevron"));
  backButton.addEventListener("click", showMeetingList);
  header.append(backButton);
  const titleRow = create("div", "detail-title-row");
  const title = create("div", "detail-title");
  title.append(create("h2", "", meeting.title || "Untitled meeting"));
  const meta = create("div", "detail-title-meta");
  const people = meetingPeople(meeting);
  if (people.length) meta.append(renderAvatars(people, 5));
  const date = formatDate(meeting.scheduled_started_at || meeting.created_at);
  if (date) { const item = create("span"); item.append(icon("calendar"), document.createTextNode(date)); meta.append(item); }
  const duration = durationLabel(durationMinutes(meeting));
  if (duration) { const item = create("span"); item.append(icon("clock"), document.createTextNode(duration)); meta.append(item); }
  title.append(meta);
  const actions = create("div", "detail-header-actions");
  const moreButton = setIcon(create("button", "icon-button"), "more"); moreButton.type = "button"; moreButton.title = "More options"; moreButton.setAttribute("aria-label", "More options");
  actions.append(moreButton); titleRow.append(title, actions); header.append(titleRow);
  const tabs = create("nav", "detail-tabs", undefined);
  tabs.setAttribute("aria-label", "Meeting details");
  [["overview", "Overview"], ["transcript", "Transcript"], ["participants", `Participants${people.length ? ` (${people.length})` : ""}`]].forEach(([key, label]) => {
    const tab = create("button", `detail-tab${state.activeTab === key ? " active" : ""}`, label);
    tab.type = "button"; tab.dataset.tab = key;
    tab.addEventListener("click", () => { state.activeTab = key; renderActiveTab(meeting); });
    tabs.append(tab);
  });
  header.append(tabs);
  elements.detail.append(header, create("div", "detail-body"));
  renderActiveTab(meeting);
  elements.detailPanel.scrollTop = 0;
}

function personRequestParams(extra = {}) {
  const params = new URLSearchParams(extra);
  if (state.currentWorkspace) params.set("workspace_id", state.currentWorkspace.id);
  return params;
}

async function selectPerson(personId, returnContext = null) {
  const directoryPerson = state.persons.find((person) => person.id === personId);
  transitionPage(() => {
    state.activeSection = "persons";
    state.selectedPersonId = personId;
    state.personReturnContext = returnContext;
    state.personDetailTab = "overview";
    state.personContributionQuery = "";
    state.personActionStatus = "";
    elements.shell.classList.add("detail-view");
    elements.meetingColumn.classList.add("hidden");
    elements.peopleColumn.classList.remove("hidden");
    elements.meetingsNav.classList.remove("active");
    elements.personsNav.classList.add("active");
    window.history.replaceState(null, "", "#persons");
    document.title = "Memoir · Persons";
    elements.detail.classList.remove("hidden");
    elements.detail.replaceChildren();
    const loading = create("div", "detail-body");
    loading.append(create("p", "tab-empty", `Loading ${directoryPerson?.name || "person"}…`));
    elements.detail.append(loading);
    window.scrollTo({ top: 0 });
  });

  try {
    const common = personRequestParams();
    const page = personRequestParams({ limit: "100", offset: "0" });
    const [insight, meetings, contributions, actionItems] = await Promise.all([
      request(`/persons/${encodeURIComponent(personId)}?${common}`),
      request(`/persons/${encodeURIComponent(personId)}/meetings?${page}`),
      request(`/persons/${encodeURIComponent(personId)}/contributions?${page}`),
      request(`/persons/${encodeURIComponent(personId)}/action-items?${page}`),
    ]);
    if (state.selectedPersonId !== personId) return;
    state.personDetail = { insight, meetings, contributions, actionItems };
    renderPersonDetail();
  } catch (error) {
    showToast(error.message);
    await returnFromPersonDetail();
  }
}

function showPeopleList() {
  transitionPage(() => {
    state.selectedPersonId = null;
    state.personReturnContext = null;
    state.personDetail = null;
    elements.shell.classList.remove("detail-view");
    elements.detail.classList.add("hidden");
    elements.detail.replaceChildren();
    renderPersonDirectory();
    window.scrollTo({ top: 0 });
  }, "back");
}

async function returnFromPersonDetail() {
  const context = state.personReturnContext;
  if (!context) return showPeopleList();

  const meeting = state.meetings.find((item) => item.id === context.meetingId);
  if (!meeting) {
    await showSection("meetings");
    await loadMeetings(context.meetingId);
    return;
  }

  return transitionPage(() => {
    state.activeSection = "meetings";
    state.selectedPersonId = null;
    state.personReturnContext = null;
    state.personDetail = null;
    state.selectedMeetingId = meeting.id;
    state.activeTab = context.meetingTab || "participants";
    elements.meetingColumn.classList.remove("hidden");
    elements.peopleColumn.classList.add("hidden");
    elements.meetingsNav.classList.add("active");
    elements.personsNav.classList.remove("active");
    window.history.replaceState(null, "", "#meetings");
    document.title = "Memoir · Meetings";
    renderDetail(meeting);
    window.scrollTo({ top: 0 });
  }, "back");
}

function personMeetingCard(meeting) {
  const card = create("article", "person-meeting-card");
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  const heading = create("div", "person-activity-heading");
  heading.append(create("strong", "", meeting.title || "Untitled meeting"), create("time", "", formatDate(meeting.scheduled_started_at, false) || "No date"));
  card.append(heading);
  if (meeting.summary) card.append(create("p", "person-meeting-summary", meeting.summary));
  const previews = create("div", "contribution-preview-list");
  (meeting.contribution_preview || []).forEach((text) => previews.append(create("p", "contribution-preview", `“${text}”`)));
  if (previews.children.length) card.append(previews);
  const meta = create("div", "contribution-meta", `${meeting.contribution_count} ${meeting.contribution_count === 1 ? "contribution" : "contributions"}`);
  card.append(meta);
  const open = async () => {
    await showSection("meetings");
    await loadMeetings(meeting.id);
  };
  card.addEventListener("click", open);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return card;
}

function renderPersonMeetings(meetings) {
  if (!meetings.length) return create("p", "tab-empty", "No attended meetings are linked to this person.");
  const list = create("div", "person-activity-list");
  meetings.forEach((meeting) => list.append(personMeetingCard(meeting)));
  return list;
}

function renderPersonContributions(contributions) {
  if (!contributions.length) return create("p", "tab-empty", "No matching transcript contributions were found.");
  const list = create("div", "person-activity-list");
  contributions.forEach((contribution) => {
    const card = create("article", "contribution-card");
    card.append(create("p", "", contribution.text));
    const meta = create("div", "contribution-meta");
    meta.append(create("strong", "", contribution.meeting.title));
    const meetingDate = formatDate(contribution.meeting.scheduled_started_at, false);
    if (meetingDate) meta.append(create("span", "", meetingDate));
    if (contribution.timestamp_start) meta.append(create("span", "", contribution.timestamp_start));
    card.append(meta);
    list.append(card);
  });
  return list;
}

function actionStatusClass(status) {
  const value = String(status).toLocaleLowerCase();
  if (["finished", "blocked", "cancelled"].includes(value)) return value;
  return "";
}

function renderPersonActions(actionItems) {
  if (!actionItems.length) return create("p", "tab-empty", "No matching action items are assigned to this person.");
  const list = create("div", "person-activity-list");
  actionItems.forEach((item) => {
    const card = create("article", "person-action-card");
    const copy = create("div");
    copy.append(create("p", "", item.content));
    const meta = create("div", "person-action-meta");
    meta.append(create("strong", "", item.meeting.title));
    if (item.due_date) meta.append(create("span", "", `Due ${formatDate(item.due_date, false)}`));
    copy.append(meta);
    card.append(copy, create("span", `action-status ${actionStatusClass(item.status)}`, item.status.replaceAll("_", " ")));
    list.append(card);
  });
  return list;
}

function personSection(title, body, action = null) {
  const section = create("section", "person-section");
  const heading = create("header", "person-section-heading");
  heading.append(create("h3", "", title));
  if (action) heading.append(action);
  section.append(heading, body);
  return section;
}

function renderPersonOverview() {
  const { insight, meetings, actionItems } = state.personDetail;
  const wrapper = create("div", "person-overview");
  const stats = create("div", "person-stat-grid");
  [
    [insight.stats.meeting_count, "Meetings attended"],
    [insight.stats.contribution_count, "Contributions"],
    [insight.stats.open_action_item_count, "Open actions"],
    [insight.stats.finished_action_item_count, "Finished actions"],
  ].forEach(([value, label]) => {
    const card = create("div", "person-stat-card");
    card.append(create("strong", "", String(value)), create("span", "", label));
    stats.append(card);
  });
  wrapper.append(stats);

  const meetingsButton = create("button", "inline-button", "View all");
  meetingsButton.type = "button";
  meetingsButton.addEventListener("click", () => { state.personDetailTab = "meetings"; renderPersonActiveTab(); });
  wrapper.append(personSection("Recent meetings", renderPersonMeetings(meetings.items.slice(0, 5)), meetingsButton));

  const actionsButton = create("button", "inline-button", "View all");
  actionsButton.type = "button";
  actionsButton.addEventListener("click", () => { state.personDetailTab = "action-items"; renderPersonActiveTab(); });
  wrapper.append(personSection("Assigned action items", renderPersonActions(actionItems.items.slice(0, 5)), actionsButton));
  return wrapper;
}

async function refreshPersonContributions(query) {
  const personId = state.selectedPersonId;
  state.personContributionQuery = query;
  try {
    const params = personRequestParams({ limit: "100", offset: "0" });
    if (query) params.set("query", query);
    const contributions = await request(`/persons/${encodeURIComponent(personId)}/contributions?${params}`);
    if (state.selectedPersonId !== personId || !state.personDetail) return;
    state.personDetail.contributions = contributions;
    renderPersonActiveTab();
  } catch (error) {
    showToast(error.message);
  }
}

async function refreshPersonActions(status) {
  const personId = state.selectedPersonId;
  state.personActionStatus = status;
  try {
    const params = personRequestParams({ limit: "100", offset: "0" });
    if (status) params.set("status", status);
    const actionItems = await request(`/persons/${encodeURIComponent(personId)}/action-items?${params}`);
    if (state.selectedPersonId !== personId || !state.personDetail) return;
    state.personDetail.actionItems = actionItems;
    renderPersonActiveTab();
  } catch (error) {
    showToast(error.message);
  }
}

function renderPersonActiveTab() {
  const body = elements.detail.querySelector(".detail-body");
  body.replaceChildren();
  if (state.personDetailTab === "overview") body.append(renderPersonOverview());
  if (state.personDetailTab === "meetings") {
    body.append(create("p", "person-result-summary", `${state.personDetail.meetings.total} ${state.personDetail.meetings.total === 1 ? "meeting" : "meetings"}`));
    body.append(renderPersonMeetings(state.personDetail.meetings.items));
  }
  if (state.personDetailTab === "contributions") {
    const form = create("form", "person-tab-tools");
    const label = create("label", "search-box");
    label.append(icon("search"));
    const input = create("input");
    input.type = "search";
    input.placeholder = "Search this person's contributions…";
    input.value = state.personContributionQuery;
    label.append(input);
    const submit = create("button", "secondary-button", "Search");
    submit.type = "submit";
    form.append(label, submit);
    form.addEventListener("submit", (event) => { event.preventDefault(); refreshPersonContributions(input.value.trim()); });
    body.append(form, create("p", "person-result-summary", `${state.personDetail.contributions.total} ${state.personDetail.contributions.total === 1 ? "contribution" : "contributions"}`), renderPersonContributions(state.personDetail.contributions.items));
  }
  if (state.personDetailTab === "action-items") {
    const tools = create("div", "person-tab-tools");
    const select = create("select");
    select.setAttribute("aria-label", "Filter action items by status");
    [["", "All statuses"], ["PENDING", "Pending"], ["IN_PROGRESS", "In progress"], ["BLOCKED", "Blocked"], ["FINISHED", "Finished"], ["CANCELLED", "Cancelled"]].forEach(([value, label]) => {
      const option = create("option", "", label); option.value = value; option.selected = state.personActionStatus === value; select.append(option);
    });
    select.addEventListener("change", () => refreshPersonActions(select.value));
    tools.append(select);
    body.append(tools, create("p", "person-result-summary", `${state.personDetail.actionItems.total} ${state.personDetail.actionItems.total === 1 ? "action item" : "action items"}`), renderPersonActions(state.personDetail.actionItems.items));
  }
  elements.detail.querySelectorAll(".detail-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.personDetailTab));
}

function renderPersonDetail() {
  const { person, stats } = state.personDetail.insight;
  elements.detail.replaceChildren();
  elements.detail.classList.remove("hidden");
  elements.shell.classList.add("detail-view");
  const header = create("header", "detail-header");
  const returnContext = state.personReturnContext;
  const backLabel = returnContext ? `Back to ${returnContext.meetingTitle}` : "Back to persons";
  const backButton = create("button", "back-button", backLabel);
  backButton.type = "button";
  backButton.prepend(icon("chevron"));
  backButton.addEventListener("click", returnFromPersonDetail);
  header.append(backButton);

  const identity = create("div", "person-detail-identity");
  const avatar = create("span", "person-avatar", initials(person.name));
  avatar.style.setProperty("--avatar-color", avatarColor(person.name));
  const title = create("div", "detail-title");
  title.append(create("h2", "", person.name));
  const contact = create("div", "person-contact");
  if (person.email) contact.append(create("span", "", person.email));
  if (person.phone_number) contact.append(create("span", "", person.phone_number));
  if (stats.last_participated_at) contact.append(create("span", "", `Last participated ${formatDate(stats.last_participated_at, false)}`));
  if (!contact.children.length) contact.append(create("span", "", "No contact information recorded"));
  title.append(contact);
  identity.append(avatar, title);
  header.append(identity);

  const tabs = create("nav", "detail-tabs");
  tabs.setAttribute("aria-label", "Person details");
  [["overview", "Overview"], ["meetings", `Meetings (${state.personDetail.meetings.total})`], ["contributions", `Contributions (${state.personDetail.contributions.total})`], ["action-items", `Action items (${state.personDetail.actionItems.total})`]].forEach(([key, label]) => {
    const tab = create("button", `detail-tab${state.personDetailTab === key ? " active" : ""}`, label);
    tab.type = "button";
    tab.dataset.tab = key;
    tab.addEventListener("click", () => { state.personDetailTab = key; renderPersonActiveTab(); });
    tabs.append(tab);
  });
  header.append(tabs);
  elements.detail.append(header, create("div", "detail-body"));
  renderPersonActiveTab();
}

function openModal() {
  elements.formError.classList.add("hidden");
  elements.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => document.querySelector("#title").focus(), 50);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  document.body.style.overflow = "";
}

async function useFile(file) {
  if (!file) return;
  const allowedExtensions = ["txt", "md", "json", "srt", "vtt"];
  const extension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    elements.formError.textContent = "Choose a .txt, .md, .json, .srt, or .vtt transcript file.";
    elements.formError.classList.remove("hidden");
    return;
  }
  try {
    elements.transcript.value = await file.text();
    elements.fileLabel.textContent = file.name;
    if (!document.querySelector("#title").value) document.querySelector("#title").value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    elements.formError.classList.add("hidden");
  } catch {
    elements.formError.textContent = "The selected file could not be read as text.";
    elements.formError.classList.remove("hidden");
  }
}

function bindDropTarget(target, onFile) {
  ["dragenter", "dragover"].forEach((type) => target.addEventListener(type, (event) => { event.preventDefault(); target.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((type) => target.addEventListener(type, (event) => { event.preventDefault(); target.classList.remove("dragover"); }));
  target.addEventListener("drop", (event) => onFile(event.dataTransfer.files[0]));
}

document.querySelectorAll("[data-open-upload]").forEach((button) => button.addEventListener("click", openModal));
document.querySelector("#modal-close").addEventListener("click", closeModal);
document.querySelector("#cancel-button").addEventListener("click", closeModal);
elements.modal.addEventListener("click", (event) => { if (event.target === elements.modal) closeModal(); });
elements.workspaceButton.addEventListener("click", () => toggleWorkspaceMenu());
document.addEventListener("click", (event) => { if (!event.target.closest(".workspace-picker")) toggleWorkspaceMenu(false); });

elements.headerUploadButton.addEventListener("click", () => elements.quickFile.click());
elements.quickFile.addEventListener("change", async () => { const file = elements.quickFile.files[0]; if (file) { openModal(); await useFile(file); } elements.quickFile.value = ""; });
elements.fileInput.addEventListener("change", () => useFile(elements.fileInput.files[0]));
bindDropTarget(elements.modalFileZone, useFile);

[elements.search, elements.dateFilter, elements.statusFilter].forEach((control) => control.addEventListener("input", () => { state.meetingPage = 1; renderMeetingList(); }));
elements.personSearch.addEventListener("input", renderPersonDirectory);
document.querySelector("#view-all-meetings").addEventListener("click", () => document.querySelector("#all-meetings").scrollIntoView({ behavior: "smooth", block: "start" }));

function openSidebar() { elements.sidebar.classList.add("open"); elements.sidebarScrim.classList.remove("hidden"); }
document.querySelector("#menu-button").addEventListener("click", openSidebar);
document.querySelector("#people-menu-button").addEventListener("click", openSidebar);
function closeSidebar() { elements.sidebar.classList.remove("open"); elements.sidebarScrim.classList.add("hidden"); }
document.querySelector("#sidebar-close").addEventListener("click", closeSidebar);
elements.sidebarScrim.addEventListener("click", closeSidebar);
elements.meetingsNav.addEventListener("click", (event) => { event.preventDefault(); showSection("meetings"); closeSidebar(); });
elements.personsNav.addEventListener("click", (event) => { event.preventDefault(); showSection("persons"); closeSidebar(); });

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.modal.classList.contains("hidden")) closeModal();
  else if (elements.sidebar.classList.contains("open")) closeSidebar();
  else if (elements.shell.classList.contains("detail-view")) {
    if (state.activeSection === "persons") returnFromPersonDetail();
    else showMeetingList();
  }
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.formError.classList.add("hidden");
  elements.submitButton.disabled = true;
  const originalContent = elements.submitButton.innerHTML;
  elements.submitButton.textContent = "Generating insights…";
  const startValue = document.querySelector("#meeting-start").value;
  const duration = Number(document.querySelector("#duration").value) || null;
  const start = startValue ? new Date(startValue) : null;
  const payload = {
    raw_transcript: elements.transcript.value,
    title: document.querySelector("#title").value.trim() || "Untitled Meeting",
    description: document.querySelector("#description").value.trim() || null,
    meeting_start: start?.toISOString() || null,
    meeting_end: start && duration ? new Date(start.getTime() + duration * 60_000).toISOString() : null,
    workspace_id: state.currentWorkspace?.id || "1",
  };
  try {
    const body = await request("/meetings/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    closeModal();
    elements.form.reset();
    elements.fileLabel.textContent = "Choose a transcript file";
    await Promise.all([
      loadMeetings(body.meeting_id),
      loadPersons(),
    ]);
    showToast("Meeting insights generated and saved.");
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.classList.remove("hidden");
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.innerHTML = originalContent;
  }
});

async function init() {
  await loadWorkspaces();
  await Promise.all([loadMeetings(), loadPersons()]);
  if (window.location.hash === "#persons") showSection("persons");
}

init();
