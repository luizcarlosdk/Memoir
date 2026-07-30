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
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z"/><path d="m14.8 6.8 2.8 2.8"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>',
  progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 6.7M20 4v7h-7"/></svg>',
  blocked: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m6 18 12-12"/></svg>',
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
  personActionStatuses: new Set(),
  personOpenActionsOnly: false,
  activeTab: "overview",
  meetingPage: 1,
  meetingsPerPage: 5,
  showAllMeetings: false,
};

const MOTION = Object.freeze({
  duration: { short: 100, medium: 300, long: 500 },
  easing: {
    standard: "cubic-bezier(.2, 0, 0, 1)",
    accelerate: "cubic-bezier(.3, 0, .8, .15)",
    decelerate: "cubic-bezier(.05, .7, .1, 1)",
  },
});

const TAB_ORDER = ["overview", "transcript", "participants"];
const PERSON_TAB_ORDER = ["overview", "meetings", "contributions", "action-items"];
const PERSON_ACTION_FILTERS = Object.freeze([
  ["PENDING", "Pending"],
  ["IN_PROGRESS", "In progress"],
  ["BLOCKED", "Blocked"],
  ["FINISHED", "Finished"],
  ["CANCELLED", "Cancelled"],
]);
const PERSON_ACTION_STATUS_DESCRIPTIONS = Object.freeze({
  PENDING: "Not started yet",
  IN_PROGRESS: "Work is underway",
  BLOCKED: "Waiting on something else",
  FINISHED: "Completed successfully",
  CANCELLED: "No longer planned",
});
const ACTION_STATUS_ICONS = Object.freeze({
  PENDING: "clock",
  IN_PROGRESS: "progress",
  BLOCKED: "blocked",
  FINISHED: "check",
  CANCELLED: "close",
});
const OPEN_ACTION_STATUSES = new Set(["PENDING", "IN_PROGRESS", "BLOCKED"]);
let tabTransitionVersion = 0;
let personTabTransitionVersion = 0;
let modalReturnFocus = null;
let actionStatusReturnFocus = null;
let editingActionItem = null;

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
  viewAllMeetings: document.querySelector("#view-all-meetings"),
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
  transcript: document.querySelector("#raw-transcript"),
  fileLabel: document.querySelector("#file-label"),
  formError: document.querySelector("#form-error"),
  submitButton: document.querySelector("#submit-button"),
  modalFileZone: document.querySelector("#modal-file-zone"),
  actionStatusModal: document.querySelector("#action-status-backdrop"),
  actionStatusForm: document.querySelector("#action-status-form"),
  actionStatusContent: document.querySelector("#action-status-content"),
  actionItemContent: document.querySelector("#action-item-content"),
  actionAssigneeSelect: document.querySelector("#action-assignee-select"),
  actionStatusMeeting: document.querySelector("#action-status-meeting"),
  actionStatusOptions: document.querySelector("#action-status-options"),
  actionStatusError: document.querySelector("#action-status-error"),
  actionStatusSubmit: document.querySelector("#action-status-submit"),
  actionDeleteButton: document.querySelector("#action-delete-button"),
  actionDeleteConfirmation: document.querySelector("#action-delete-confirmation"),
  actionDeleteKeep: document.querySelector("#action-delete-keep"),
  actionDeleteConfirm: document.querySelector("#action-delete-confirm"),
  sidebar: document.querySelector("#sidebar"),
  sidebarScrim: document.querySelector("#sidebar-scrim"),
  toast: document.querySelector("#toast"),
  peopleLoading: document.querySelector("#people-loading"),
  peopleList: document.querySelector("#people-list"),
  peopleEmpty: document.querySelector("#empty-people"),
  peopleNoResults: document.querySelector("#no-person-results"),
  personSearch: document.querySelector("#person-search"),
  personOpenActionsFilter: document.querySelector("#person-open-actions-filter"),
  personSort: document.querySelector("#person-sort"),
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

function animateIterable(container, selector) {
  if (prefersReducedMotion()) return;
  container.querySelectorAll(selector).forEach((item, index) => {
    item.animate(
      [
        { opacity: 0, transform: "translateY(10px) scale(.985)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: MOTION.duration.medium,
        delay: Math.min(index * 35, 210),
        easing: MOTION.easing.decelerate,
        fill: "both",
      },
    );
  });
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
  const colors = ["#006a60", "#405d73", "#66558f", "#8b5000", "#8f4a5f", "#3f6b47"];
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

function formatActionStatus(status) {
  return String(status).replaceAll("_", " ").toLocaleLowerCase().replace(/^./, (character) => character.toLocaleUpperCase());
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
      state.showAllMeetings = false;
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
    animateIterable(elements.recentList, ".recent-meeting-card");
    animateIterable(elements.list, ".meeting-row");
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
    animateIterable(elements.peopleList, ".person-card");
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
  const persons = state.persons.filter((person) => {
    const matchesQuery = !query || [person.name, person.email].filter(Boolean).join(" ").toLocaleLowerCase().includes(query);
    const matchesActions = !state.personOpenActionsOnly || person.open_action_item_count > 0;
    return matchesQuery && matchesActions;
  });
  return persons.sort((left, right) => {
    if (elements.personSort.value === "name") return left.name.localeCompare(right.name);
    if (elements.personSort.value === "contributions") return right.contribution_count - left.contribution_count || left.name.localeCompare(right.name);
    const leftTime = left.last_participated_at ? new Date(left.last_participated_at).getTime() : 0;
    const rightTime = right.last_participated_at ? new Date(right.last_participated_at).getTime() : 0;
    return rightTime - leftTime || left.name.localeCompare(right.name);
  });
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
    header.append(avatar, copy, icon("chevron", "person-card-arrow"));
    const stats = create("div", "person-card-stats");
    [
      ["calendar", person.meeting_count, person.meeting_count === 1 ? "meeting" : "meetings", ""],
      ["file", person.contribution_count, "contributions", ""],
      ["check-square", person.open_action_item_count, person.open_action_item_count === 1 ? "open action" : "open actions", person.open_action_item_count ? "has-actions" : ""],
    ].forEach(([iconName, value, label, className]) => {
      const stat = create("div", `person-card-stat ${className}`);
      stat.append(icon(iconName));
      const statCopy = create("div");
      statCopy.append(create("strong", "", String(value)), create("span", "", label));
      stat.append(statCopy);
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
  }, section === "persons" ? "forward" : "back");
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

function setAllMeetingsExpanded(expanded) {
  state.showAllMeetings = expanded;
  state.meetingPage = 1;
  renderMeetingList();
  if (expanded) animateIterable(elements.list, ".meeting-row");
  document.querySelector("#all-meetings").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMeetingList() {
  const meetings = filteredMeetings();
  elements.list.replaceChildren();
  elements.recentList.replaceChildren();
  elements.pagination.replaceChildren();
  elements.empty.classList.toggle("hidden", state.meetings.length > 0);
  elements.noResults.classList.toggle("hidden", state.meetings.length === 0 || meetings.length > 0);
  elements.list.classList.toggle("hidden", meetings.length === 0);
  elements.viewAllMeetings.textContent = state.showAllMeetings ? "Show less" : "View all";
  elements.viewAllMeetings.setAttribute("aria-expanded", String(state.showAllMeetings));
  elements.viewAllMeetings.classList.toggle("hidden", state.meetings.length <= 3);
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

  const pageSize = state.showAllMeetings ? Math.max(meetings.length, 1) : state.meetingsPerPage;
  const pageCount = Math.max(1, Math.ceil(meetings.length / pageSize));
  state.meetingPage = Math.min(state.meetingPage, pageCount);
  const start = (state.meetingPage - 1) * pageSize;
  meetings.slice(start, start + pageSize).forEach((meeting) => {
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

  elements.pagination.classList.toggle("hidden", meetings.length === 0);
  if (meetings.length) {
    const end = Math.min(start + pageSize, meetings.length);
    elements.pagination.append(create("span", "pagination-summary", `Showing ${start + 1} to ${end} of ${meetings.length} meetings`));
    if (state.showAllMeetings) {
      const showLess = create("button", "inline-button", "Show less");
      showLess.type = "button";
      showLess.addEventListener("click", () => setAllMeetingsExpanded(false));
      elements.pagination.append(showLess);
      return;
    }
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
  if (countLabel) {
    card.classList.add("has-count");
    card.append(create("span", "insight-count", countLabel));
  }
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

function createMeetingActionItem(item, meeting) {
  const status = String(item.status).toUpperCase();
  const done = status === "FINISHED";
  const cancelled = status === "CANCELLED";
  const row = create("li", `action-item editable${done ? " done" : ""}${cancelled ? " cancelled" : ""}`);
  row.dataset.actionItemId = item.id;
  row.tabIndex = 0;
  row.setAttribute("role", "button");
  row.setAttribute("aria-label", `Edit ${item.content}. Current status: ${formatActionStatus(item.status)}`);
  const check = create("span", "action-check");
  if (done) check.append(icon("check"));
  if (cancelled) check.append(icon("close"));
  const content = create("div");
  content.append(create("div", "action-content", item.content));
  const meta = create("div", "action-meta");
  if (item.assignee) meta.append(create("span", "action-assignee", item.assignee));
  if (item.due_date) { const due = create("span"); due.append(icon("calendar"), document.createTextNode(formatDate(item.due_date, false))); meta.append(due); }
  const statusBadge = create("span", `action-status ${actionStatusClass(item.status)}`);
  statusBadge.append(document.createTextNode(formatActionStatus(item.status)), icon("edit", "action-status-edit-icon"));
  meta.append(statusBadge);
  content.append(meta);
  row.append(check, content);
  const editItem = () => openActionStatusEditor(item, row, {
    meetingId: meeting.id,
    meetingTitle: meeting.title || "Untitled meeting",
  });
  row.addEventListener("click", editItem);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      editItem();
    }
  });
  return row;
}

function renderActionList(meeting) {
  const list = create("ul", "action-list");
  if (!meeting.action_items?.length) {
    list.append(create("li", "muted-list-item", "No action items were identified."));
    return list;
  }
  meeting.action_items.forEach((item) => list.append(createMeetingActionItem(item, meeting)));
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
    viewAll.addEventListener("click", () => {
      const previousTab = state.activeTab;
      state.activeTab = "transcript";
      renderActiveTab(meeting, previousTab);
    });
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

async function renderActiveTab(meeting, previousTab = null) {
  const body = elements.detail.querySelector(".detail-body");
  const version = ++tabTransitionVersion;
  const previousIndex = TAB_ORDER.indexOf(previousTab);
  const nextIndex = TAB_ORDER.indexOf(state.activeTab);
  const direction = previousIndex < 0 || nextIndex >= previousIndex ? 1 : -1;

  if (body.childElementCount && previousTab && !prefersReducedMotion()) {
    const outgoing = body.animate(
      [
        { opacity: 1, transform: "translateX(0) scale(1)" },
        { opacity: 0, transform: `translateX(${-10 * direction}px) scale(.985)` },
      ],
      {
        duration: MOTION.duration.short,
        easing: MOTION.easing.accelerate,
        fill: "forwards",
      },
    );
    await outgoing.finished.catch(() => {});
    outgoing.cancel();
    if (version !== tabTransitionVersion) return;
  }

  body.replaceChildren();
  if (state.activeTab === "overview") body.append(renderOverview(meeting));
  if (state.activeTab === "transcript") body.append(renderTranscript(meeting));
  if (state.activeTab === "participants") body.append(renderParticipants(meeting));
  elements.detail.querySelectorAll(".detail-tab").forEach((tab) => {
    const selected = tab.dataset.tab === state.activeTab;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  body.setAttribute("aria-labelledby", `meeting-tab-${state.activeTab}`);

  if (!prefersReducedMotion()) {
    body.animate(
      [
        { opacity: 0, transform: `translateX(${14 * direction}px) scale(.985)` },
        { opacity: 1, transform: "translateX(0) scale(1)" },
      ],
      { duration: MOTION.duration.medium, easing: MOTION.easing.decelerate },
    );
  }

  const iterableSelector = state.activeTab === "participants"
    ? ".participant-row"
    : state.activeTab === "transcript"
      ? ".transcript-row"
      : ".insight-card, .transcript-preview";
  animateIterable(body, iterableSelector);
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
  elements.detail.classList.remove("person-page");
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
  tabs.setAttribute("role", "tablist");
  [["overview", "Overview"], ["transcript", "Transcript"], ["participants", `Participants${people.length ? ` (${people.length})` : ""}`]].forEach(([key, label]) => {
    const tab = create("button", `detail-tab${state.activeTab === key ? " active" : ""}`, label);
    tab.type = "button";
    tab.id = `meeting-tab-${key}`;
    tab.dataset.tab = key;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "meeting-tab-panel");
    tab.setAttribute("aria-selected", String(state.activeTab === key));
    tab.tabIndex = state.activeTab === key ? 0 : -1;
    tab.addEventListener("click", () => {
      if (state.activeTab === key) return;
      const previousTab = state.activeTab;
      state.activeTab = key;
      renderActiveTab(meeting, previousTab);
    });
    tabs.append(tab);
  });
  tabs.addEventListener("keydown", (event) => {
    const currentIndex = TAB_ORDER.indexOf(state.activeTab);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TAB_ORDER.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    tabs.querySelector(`[data-tab="${TAB_ORDER[nextIndex]}"]`).click();
    tabs.querySelector(`[data-tab="${TAB_ORDER[nextIndex]}"]`).focus();
  });
  header.append(tabs);
  const detailBody = create("div", "detail-body");
  detailBody.id = "meeting-tab-panel";
  detailBody.setAttribute("role", "tabpanel");
  detailBody.setAttribute("aria-labelledby", `meeting-tab-${state.activeTab}`);
  elements.detail.append(header, detailBody);
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
    state.personActionStatuses.clear();
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
    state.personDetail = {
      insight,
      meetings,
      contributions,
      actionItems,
      allActionItems: actionItems,
      overviewActionItems: actionItems.items,
    };
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

async function openMeetingFromPerson(meetingId) {
  await showSection("meetings");
  await loadMeetings(meetingId);
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
  const open = () => openMeetingFromPerson(meeting.id);
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

function createPersonActionItem(item) {
  const status = String(item.status).toUpperCase();
  const completed = status === "FINISHED";
  const cancelled = status === "CANCELLED";
  const row = create("li", `person-todo-item editable${completed ? " completed" : ""}${cancelled ? " cancelled" : ""}`);
  row.dataset.actionItemId = item.id;
  row.tabIndex = 0;
  row.setAttribute("role", "button");
  row.setAttribute("aria-label", `Edit ${item.content}. Current status: ${formatActionStatus(item.status)}`);
  const checkbox = create("span", "todo-checkbox");
  if (completed) checkbox.append(icon("check"));
  if (cancelled) checkbox.append(icon("close"));
  const copy = create("div", "todo-copy");
  copy.append(create("p", "todo-title", item.content));
  const meta = create("div", "person-action-meta");
  meta.append(create("strong", "", item.meeting.title));
  if (item.due_date) meta.append(create("span", "", `Due ${formatDate(item.due_date, false)}`));
  copy.append(meta);
  const statusBadge = create("span", `action-status ${actionStatusClass(item.status)}`);
  statusBadge.append(document.createTextNode(formatActionStatus(item.status)), icon("edit", "action-status-edit-icon"));
  row.append(checkbox, copy, statusBadge);
  const editItem = () => openPersonActionStatusEditor(item, row);
  row.addEventListener("click", editItem);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      editItem();
    }
  });
  return row;
}

function renderPersonActions(actionItems) {
  if (!actionItems.length) return create("p", "tab-empty", "No matching action items are assigned to this person.");
  const list = create("ul", "person-todo-list");
  actionItems.forEach((item) => list.append(createPersonActionItem(item)));
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

function renderFeaturedMeeting(meeting) {
  if (!meeting) return create("p", "person-panel-empty", "No meeting activity is linked to this person yet.");
  const card = create("article", "featured-person-meeting");
  const top = create("div", "featured-meeting-top");
  const meetingIcon = icon("calendar", "featured-meeting-icon");
  const copy = create("div", "featured-meeting-copy");
  copy.append(create("strong", "", meeting.title || "Untitled meeting"));
  if (meeting.summary) copy.append(create("p", "", meeting.summary));
  top.append(meetingIcon, copy, create("time", "", formatDate(meeting.scheduled_started_at, false) || "No date"));
  const footer = create("footer", "featured-meeting-footer");
  const contributionCount = create("span");
  contributionCount.append(icon("file"), document.createTextNode(`${meeting.contribution_count} ${meeting.contribution_count === 1 ? "contribution" : "contributions"}`));
  const open = create("button", "person-inline-link", "View meeting");
  open.type = "button";
  open.append(icon("chevron"));
  open.addEventListener("click", () => openMeetingFromPerson(meeting.id));
  footer.append(contributionCount, open);
  card.append(top, footer);
  return card;
}

function renderAtGlance(stats) {
  const list = create("div", "glance-list");
  [
    ["calendar", stats.meeting_count, stats.meeting_count === 1 ? "Meeting" : "Meetings"],
    ["file", stats.contribution_count, "Contributions"],
    ["check-square", stats.finished_action_item_count, "Finished actions"],
  ].forEach(([iconName, value, label]) => {
    const row = create("div", "glance-row");
    row.append(icon(iconName, "glance-icon"));
    const copy = create("div");
    copy.append(create("strong", "", String(value)), create("span", "", label));
    row.append(copy);
    list.append(row);
  });
  return personSection("At a glance", list);
}

function renderOpenActionsPanel(actionItems) {
  const openItems = actionItems.filter((item) => !["FINISHED", "CANCELLED"].includes(item.status));
  if (openItems.length) return personSection("Open actions", renderPersonActions(openItems.slice(0, 3)));
  const empty = create("div", "person-empty-state");
  empty.append(icon("check", "person-empty-icon"), create("strong", "", "No open actions"), create("span", "", "Great job—nothing pending right now."));
  return personSection("Open actions", empty);
}

function renderPersonOverview() {
  const { insight, meetings, overviewActionItems } = state.personDetail;
  const dashboard = create("div", "person-dashboard");
  const activity = personSection("Recent activity", create("div", "person-recent-stack"));
  const activityBody = activity.querySelector(".person-recent-stack");
  if (meetings.items.length) meetings.items.slice(0, 3).forEach((meeting) => activityBody.append(renderFeaturedMeeting(meeting)));
  else activityBody.append(renderFeaturedMeeting(null));
  const sidebar = create("aside", "person-overview-sidebar");
  sidebar.append(renderAtGlance(insight.stats), renderOpenActionsPanel(overviewActionItems));
  dashboard.append(activity, sidebar);
  return dashboard;
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

function refreshPersonActions(statuses) {
  state.personActionStatuses = new Set(statuses);
  const source = state.personDetail.allActionItems;
  const items = state.personActionStatuses.size
    ? source.items.filter((item) => state.personActionStatuses.has(item.status))
    : source.items;
  const actionItems = {
    ...source,
    items,
    total: state.personActionStatuses.size ? items.length : source.total,
  };
  state.personDetail.actionItems = actionItems;
  return actionItems;
}

async function renderPersonActiveTab(previousTab = null) {
  const body = elements.detail.querySelector(".detail-body");
  const version = ++personTabTransitionVersion;
  const previousIndex = PERSON_TAB_ORDER.indexOf(previousTab);
  const nextIndex = PERSON_TAB_ORDER.indexOf(state.personDetailTab);
  const direction = previousIndex < 0 || nextIndex >= previousIndex ? 1 : -1;

  if (body.childElementCount && previousTab && !prefersReducedMotion()) {
    const outgoing = body.animate(
      [
        { opacity: 1, transform: "translateX(0) scale(1)" },
        { opacity: 0, transform: `translateX(${-10 * direction}px) scale(.985)` },
      ],
      {
        duration: MOTION.duration.short,
        easing: MOTION.easing.accelerate,
        fill: "forwards",
      },
    );
    await outgoing.finished.catch(() => {});
    outgoing.cancel();
    if (version !== personTabTransitionVersion) return;
  }

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
    const filters = create("fieldset", "person-status-filters");
    filters.append(create("legend", "", "Filter by status"));
    const options = create("div", "person-status-options");
    const summary = create("p", "person-result-summary");
    const results = create("div", "person-action-results");
    const updateResults = (actionItems) => {
      summary.textContent = `${actionItems.total} ${actionItems.total === 1 ? "action item" : "action items"}`;
      results.replaceChildren(renderPersonActions(actionItems.items));
      animateIterable(results, ".person-todo-item");
    };

    PERSON_ACTION_FILTERS.forEach(([value, label]) => {
      const option = create("label", "person-status-option");
      const input = create("input");
      input.type = "checkbox";
      input.name = "person-action-status";
      input.value = value;
      input.checked = state.personActionStatuses.has(value);
      const indicator = create("span", "person-status-check");
      indicator.append(icon("check"));
      const chip = create("span", "person-status-chip");
      chip.append(indicator, create("span", "person-status-label", label));
      option.append(input, chip);
      options.append(option);
      input.addEventListener("change", () => {
        const statuses = [...options.querySelectorAll("input:checked")].map((control) => control.value);
        updateResults(refreshPersonActions(statuses));
      });
    });

    filters.append(options, create("p", "person-status-hint", "Select any combination. No selection shows all items."));
    updateResults(state.personDetail.actionItems);
    body.append(filters, summary, results);
  }
  elements.detail.querySelectorAll(".detail-tab").forEach((tab) => {
    const selected = tab.dataset.tab === state.personDetailTab;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  body.setAttribute("aria-labelledby", `person-tab-${state.personDetailTab}`);

  if (!prefersReducedMotion()) {
    body.animate(
      [
        { opacity: 0, transform: `translateX(${14 * direction}px) scale(.985)` },
        { opacity: 1, transform: "translateX(0) scale(1)" },
      ],
      { duration: MOTION.duration.medium, easing: MOTION.easing.decelerate },
    );
  }

  const iterableSelector = state.personDetailTab === "meetings"
    ? ".person-meeting-card"
    : state.personDetailTab === "contributions"
      ? ".contribution-card"
      : state.personDetailTab === "action-items"
        ? ".person-todo-item"
        : ".person-dashboard > .person-section, .person-overview-sidebar > .person-section";
  animateIterable(body, iterableSelector);
}

function renderPersonDetail() {
  const { person, stats } = state.personDetail.insight;
  elements.detail.replaceChildren();
  elements.detail.classList.add("person-page");
  elements.detail.classList.remove("hidden");
  elements.shell.classList.add("detail-view");
  const header = create("header", "detail-header person-profile-header");
  const returnContext = state.personReturnContext;
  const backLabel = returnContext ? `Back to ${returnContext.meetingTitle}` : "Back to persons";
  const backButton = create("button", "back-button", backLabel);
  backButton.type = "button";
  backButton.prepend(icon("chevron"));
  backButton.addEventListener("click", returnFromPersonDetail);
  header.append(backButton);

  const identity = create("div", "person-profile-hero");
  const avatar = create("span", "person-avatar", initials(person.name));
  avatar.style.setProperty("--avatar-color", avatarColor(person.name));
  const title = create("div", "person-profile-copy");
  title.append(create("h2", "", person.name));
  title.append(create("p", "person-last-seen", stats.last_participated_at ? `Last participated ${formatDate(stats.last_participated_at, false)}` : "No meeting participation yet"));
  identity.append(avatar, title);
  header.append(identity);

  const tabs = create("nav", "detail-tabs");
  tabs.setAttribute("aria-label", "Person details");
  tabs.setAttribute("role", "tablist");
  [["overview", "Overview"], ["meetings", `Meetings (${state.personDetail.meetings.total})`], ["contributions", `Contributions (${state.personDetail.contributions.total})`], ["action-items", `Action items (${state.personDetail.allActionItems.total})`]].forEach(([key, label]) => {
    const tab = create("button", `detail-tab${state.personDetailTab === key ? " active" : ""}`, label);
    tab.type = "button";
    tab.id = `person-tab-${key}`;
    tab.dataset.tab = key;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "person-tab-panel");
    tab.setAttribute("aria-selected", String(state.personDetailTab === key));
    tab.tabIndex = state.personDetailTab === key ? 0 : -1;
    tab.addEventListener("click", () => {
      if (state.personDetailTab === key) return;
      const previousTab = state.personDetailTab;
      state.personDetailTab = key;
      renderPersonActiveTab(previousTab);
    });
    tabs.append(tab);
  });
  tabs.addEventListener("keydown", (event) => {
    const currentIndex = PERSON_TAB_ORDER.indexOf(state.personDetailTab);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % PERSON_TAB_ORDER.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + PERSON_TAB_ORDER.length) % PERSON_TAB_ORDER.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = PERSON_TAB_ORDER.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs.querySelector(`[data-tab="${PERSON_TAB_ORDER[nextIndex]}"]`);
    nextTab.click();
    nextTab.focus();
  });
  header.append(tabs);
  const detailBody = create("div", "detail-body");
  detailBody.id = "person-tab-panel";
  detailBody.setAttribute("role", "tabpanel");
  detailBody.setAttribute("aria-labelledby", `person-tab-${state.personDetailTab}`);
  elements.detail.append(header, detailBody);
  renderPersonActiveTab();
}

function openActionStatusEditor(item, returnFocus, context = {}) {
  editingActionItem = { item, ...context };
  actionStatusReturnFocus = returnFocus;
  elements.actionStatusContent.textContent = item.content;
  elements.actionItemContent.value = item.content;
  elements.actionStatusMeeting.replaceChildren(
    icon("calendar"),
    document.createTextNode(context.meetingTitle || item.meeting?.title || "Meeting action item"),
  );
  elements.actionAssigneeSelect.replaceChildren();
  const unassigned = create("option", "", "Unassigned");
  unassigned.value = "";
  elements.actionAssigneeSelect.append(unassigned);
  const people = [...state.persons].sort((first, second) => first.name.localeCompare(second.name));
  if (item.assignee_id && !people.some((person) => person.id === item.assignee_id)) {
    people.push({ id: item.assignee_id, name: item.assignee || "Current assignee" });
  }
  people.forEach((person) => {
    const option = create("option", "", person.name);
    option.value = person.id;
    elements.actionAssigneeSelect.append(option);
  });
  elements.actionAssigneeSelect.value = item.assignee_id || "";
  elements.actionStatusError.classList.add("hidden");
  elements.actionStatusOptions.replaceChildren();
  setActionDeleteConfirmation(false);

  PERSON_ACTION_FILTERS.forEach(([value, label]) => {
    const option = create("label", `action-status-option status-${value.toLocaleLowerCase().replaceAll("_", "-")}`);
    const input = create("input");
    input.type = "radio";
    input.name = "action-status";
    input.value = value;
    input.checked = value === String(item.status).toUpperCase();
    input.required = true;
    const control = create("span", "action-status-radio");
    control.append(create("span"));
    const statusIcon = icon(ACTION_STATUS_ICONS[value], "action-status-option-icon");
    const copy = create("span", "action-status-option-copy");
    copy.append(create("strong", "", label), create("small", "", PERSON_ACTION_STATUS_DESCRIPTIONS[value]));
    option.append(input, control, statusIcon, copy);
    elements.actionStatusOptions.append(option);
  });

  elements.actionStatusModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => elements.actionItemContent.focus(), 50);
}

function openPersonActionStatusEditor(item, returnFocus) {
  openActionStatusEditor(item, returnFocus, {
    personId: state.selectedPersonId,
    meetingId: item.meeting.id,
    meetingTitle: item.meeting.title,
  });
}

function closeActionStatusEditor(restoreFocus = true) {
  elements.actionStatusModal.classList.add("hidden");
  setActionDeleteConfirmation(false);
  if (elements.modal.classList.contains("hidden")) document.body.style.overflow = "";
  if (restoreFocus) actionStatusReturnFocus?.focus();
  actionStatusReturnFocus = null;
  editingActionItem = null;
}

function setActionDeleteConfirmation(visible) {
  elements.actionDeleteConfirmation.classList.toggle("hidden", !visible);
  elements.actionStatusForm.classList.toggle("confirming-delete", visible);
  if (visible) window.setTimeout(() => elements.actionDeleteKeep.focus(), 0);
}

function adjustDirectoryOpenActions(personId, delta) {
  if (!personId || !delta) return;
  const person = state.persons.find((item) => item.id === personId);
  if (person) person.open_action_item_count = Math.max(0, person.open_action_item_count + delta);
}

function applyActionItemUpdate(updatedItem, originalItem, context) {
  const mergedItem = { ...originalItem, ...updatedItem };
  const previousStatus = String(originalItem.status).toUpperCase();
  const nextStatus = String(updatedItem.status).toUpperCase();
  const wasOpen = OPEN_ACTION_STATUSES.has(previousStatus);
  const isOpen = OPEN_ACTION_STATUSES.has(nextStatus);
  const openDelta = Number(isOpen) - Number(wasOpen);
  const finishedDelta = Number(nextStatus === "FINISHED") - Number(previousStatus === "FINISHED");
  const previousAssigneeId = originalItem.assignee_id || context.personId || null;
  const nextAssigneeId = updatedItem.assignee_id || null;
  const meeting = state.meetings.find((item) => item.id === context.meetingId);
  const meetingAction = meeting?.action_items?.find((item) => item.id === updatedItem.id);
  if (meetingAction) Object.assign(meetingAction, mergedItem);

  if (previousAssigneeId === nextAssigneeId) {
    adjustDirectoryOpenActions(nextAssigneeId, openDelta);
  } else {
    adjustDirectoryOpenActions(previousAssigneeId, wasOpen ? -1 : 0);
    adjustDirectoryOpenActions(nextAssigneeId, isOpen ? 1 : 0);
  }

  const personId = state.personDetail?.insight.person.id;
  const allActionItems = state.personDetail?.allActionItems;
  const personItem = allActionItems?.items.find((item) => item.id === updatedItem.id);
  if (personId && personId === previousAssigneeId && personItem && previousAssigneeId !== nextAssigneeId) {
    allActionItems.items = allActionItems.items.filter((item) => item.id !== updatedItem.id);
    allActionItems.total = Math.max(0, allActionItems.total - 1);
    state.personDetail.overviewActionItems = state.personDetail.overviewActionItems.filter((item) => item.id !== updatedItem.id);
    state.personDetail.insight.assigned_action_items = state.personDetail.insight.assigned_action_items.filter((item) => item.id !== updatedItem.id);
    state.personDetail.insight.stats.open_action_item_count = Math.max(0, state.personDetail.insight.stats.open_action_item_count - Number(wasOpen));
    state.personDetail.insight.stats.finished_action_item_count = Math.max(0, state.personDetail.insight.stats.finished_action_item_count - Number(previousStatus === "FINISHED"));
    refreshPersonActions([...state.personActionStatuses]);
  } else if (personId && personId === nextAssigneeId && personItem) {
    const personItemUpdate = { ...personItem, ...mergedItem };
    allActionItems.items = allActionItems.items.map((item) => item.id === updatedItem.id ? personItemUpdate : item);
    state.personDetail.overviewActionItems = state.personDetail.overviewActionItems.map((item) => item.id === updatedItem.id ? personItemUpdate : item);
    state.personDetail.insight.assigned_action_items = state.personDetail.insight.assigned_action_items.map((item) => item.id === updatedItem.id ? personItemUpdate : item);
    state.personDetail.insight.stats.open_action_item_count += openDelta;
    state.personDetail.insight.stats.finished_action_item_count += finishedDelta;
    refreshPersonActions([...state.personActionStatuses]);
  }

  return mergedItem;
}

function applyActionItemDeletion(originalItem, context) {
  const status = String(originalItem.status).toUpperCase();
  const assigneeId = originalItem.assignee_id || context.personId || null;
  const meeting = state.meetings.find((item) => item.id === context.meetingId);
  if (meeting) meeting.action_items = meeting.action_items.filter((item) => item.id !== originalItem.id);
  adjustDirectoryOpenActions(assigneeId, OPEN_ACTION_STATUSES.has(status) ? -1 : 0);

  const personId = state.personDetail?.insight.person.id;
  const allActionItems = state.personDetail?.allActionItems;
  if (personId === assigneeId && allActionItems?.items.some((item) => item.id === originalItem.id)) {
    allActionItems.items = allActionItems.items.filter((item) => item.id !== originalItem.id);
    allActionItems.total = Math.max(0, allActionItems.total - 1);
    state.personDetail.overviewActionItems = state.personDetail.overviewActionItems.filter((item) => item.id !== originalItem.id);
    state.personDetail.insight.assigned_action_items = state.personDetail.insight.assigned_action_items.filter((item) => item.id !== originalItem.id);
    state.personDetail.insight.stats.open_action_item_count = Math.max(0, state.personDetail.insight.stats.open_action_item_count - Number(OPEN_ACTION_STATUSES.has(status)));
    state.personDetail.insight.stats.finished_action_item_count = Math.max(0, state.personDetail.insight.stats.finished_action_item_count - Number(status === "FINISHED"));
    refreshPersonActions([...state.personActionStatuses]);
  }
}

function syncMeetingActionCard(meeting, actionItem, deleted = false) {
  const row = [...elements.detail.querySelectorAll("[data-action-item-id]")]
    .find((element) => element.dataset.actionItemId === actionItem.id);
  if (!row) return null;
  const list = row.parentElement;
  const card = row.closest(".insight-card");
  let replacement = null;
  if (deleted) row.remove();
  else {
    replacement = createMeetingActionItem(actionItem, meeting);
    replacement.classList.add("action-item-updated");
    row.replaceWith(replacement);
  }
  if (!list.querySelector("[data-action-item-id]")) {
    list.append(create("li", "muted-list-item", "No action items were identified."));
  }

  const openActionCount = openActions(meeting).length;
  const overdueCount = overdueActionCount(meeting);
  let count = card.querySelector(".insight-count");
  if (!openActionCount) {
    count?.remove();
    card.classList.remove("has-count");
    return replacement;
  }
  if (!count) {
    count = create("span", "insight-count");
    card.append(count);
  }
  count.textContent = `${openActionCount} open ${openActionCount === 1 ? "action" : "actions"}${overdueCount ? ` · ${overdueCount} overdue` : ""}`;
  card.classList.add("has-count");
  return replacement;
}

function renderPersonDetailAtCurrentPosition() {
  const scrollLeft = window.scrollX;
  const scrollTop = window.scrollY;
  renderPersonDetail();
  window.scrollTo(scrollLeft, scrollTop);
  elements.detail.querySelector(`#person-tab-${state.personDetailTab}`)?.focus({ preventScroll: true });
}

function openModal() {
  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  elements.formError.classList.add("hidden");
  elements.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => document.querySelector("#title").focus(), 50);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  document.body.style.overflow = "";
  modalReturnFocus?.focus();
  modalReturnFocus = null;
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
document.querySelector("#action-status-close").addEventListener("click", () => closeActionStatusEditor());
document.querySelector("#action-status-cancel").addEventListener("click", () => closeActionStatusEditor());
elements.actionDeleteButton.addEventListener("click", () => setActionDeleteConfirmation(true));
elements.actionDeleteKeep.addEventListener("click", () => setActionDeleteConfirmation(false));
elements.actionStatusModal.addEventListener("click", (event) => { if (event.target === elements.actionStatusModal) closeActionStatusEditor(); });
elements.workspaceButton.addEventListener("click", () => toggleWorkspaceMenu());
document.addEventListener("click", (event) => { if (!event.target.closest(".workspace-picker")) toggleWorkspaceMenu(false); });

elements.fileInput.addEventListener("change", () => useFile(elements.fileInput.files[0]));
bindDropTarget(elements.modalFileZone, useFile);

[elements.search, elements.dateFilter, elements.statusFilter].forEach((control) => control.addEventListener("input", () => { state.meetingPage = 1; renderMeetingList(); }));
elements.personSearch.addEventListener("input", renderPersonDirectory);
elements.personOpenActionsFilter.addEventListener("click", () => {
  state.personOpenActionsOnly = !state.personOpenActionsOnly;
  elements.personOpenActionsFilter.classList.toggle("active", state.personOpenActionsOnly);
  elements.personOpenActionsFilter.setAttribute("aria-pressed", String(state.personOpenActionsOnly));
  renderPersonDirectory();
});
elements.personSort.addEventListener("change", renderPersonDirectory);
elements.viewAllMeetings.addEventListener("click", () => setAllMeetingsExpanded(!state.showAllMeetings));

function openSidebar() { elements.sidebar.classList.add("open"); elements.sidebarScrim.classList.remove("hidden"); }
document.querySelector("#menu-button").addEventListener("click", openSidebar);
document.querySelector("#people-menu-button").addEventListener("click", openSidebar);
function closeSidebar() { elements.sidebar.classList.remove("open"); elements.sidebarScrim.classList.add("hidden"); }
document.querySelector("#sidebar-close").addEventListener("click", closeSidebar);
elements.sidebarScrim.addEventListener("click", closeSidebar);
elements.meetingsNav.addEventListener("click", (event) => { event.preventDefault(); showSection("meetings"); closeSidebar(); });
elements.personsNav.addEventListener("click", (event) => { event.preventDefault(); showSection("persons"); closeSidebar(); });

elements.actionStatusForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (elements.actionStatusForm.classList.contains("confirming-delete")) return;
  if (!editingActionItem) return;
  const formData = new FormData(elements.actionStatusForm);
  const status = formData.get("action-status");
  const content = elements.actionItemContent.value.trim();
  if (!status) return;
  if (!content) {
    elements.actionStatusError.textContent = "Action item text cannot be empty.";
    elements.actionStatusError.classList.remove("hidden");
    elements.actionItemContent.focus();
    return;
  }

  const editContext = editingActionItem;
  const originalItem = editContext.item;
  const actionItemId = originalItem.id;
  const params = personRequestParams();
  const query = params.toString();
  const endpoint = `/action-items/${encodeURIComponent(actionItemId)}`;
  elements.actionStatusError.classList.add("hidden");
  elements.actionStatusSubmit.disabled = true;
  elements.actionStatusSubmit.classList.add("updating");
  elements.actionStatusSubmit.replaceChildren(icon("progress"), document.createTextNode("Saving…"));
  try {
    const updatedItem = await request(
      `${endpoint}${query ? `?${query}` : ""}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status,
          assignee_id: elements.actionAssigneeSelect.value || null,
        }),
      },
    );
    const mergedItem = applyActionItemUpdate(updatedItem, originalItem, editContext);
    const meeting = state.meetings.find((item) => item.id === editContext.meetingId);
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    closeActionStatusEditor(false);
    renderPersonDirectory();
    if (editContext.personId && state.selectedPersonId === editContext.personId && state.personDetail) {
      renderPersonDetailAtCurrentPosition();
    } else if (meeting && state.selectedMeetingId === editContext.meetingId) {
      const updatedRow = syncMeetingActionCard(meeting, mergedItem);
      window.scrollTo(scrollLeft, scrollTop);
      updatedRow?.focus({ preventScroll: true });
    }
    showToast("Action item updated");
  } catch (error) {
    elements.actionStatusError.textContent = error.message;
    elements.actionStatusError.classList.remove("hidden");
  } finally {
    elements.actionStatusSubmit.disabled = false;
    elements.actionStatusSubmit.classList.remove("updating");
    elements.actionStatusSubmit.replaceChildren(icon("check"), document.createTextNode("Save changes"));
  }
});

elements.actionDeleteConfirm.addEventListener("click", async () => {
  if (!editingActionItem) return;
  const editContext = editingActionItem;
  const originalItem = editContext.item;
  const params = personRequestParams();
  const query = params.toString();
  elements.actionStatusError.classList.add("hidden");
  elements.actionDeleteConfirm.disabled = true;
  elements.actionDeleteConfirm.classList.add("updating");
  elements.actionDeleteConfirm.replaceChildren(icon("progress"), document.createTextNode("Deleting…"));
  try {
    await request(
      `/action-items/${encodeURIComponent(originalItem.id)}${query ? `?${query}` : ""}`,
      { method: "DELETE" },
    );
    const meeting = state.meetings.find((item) => item.id === editContext.meetingId);
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    applyActionItemDeletion(originalItem, editContext);
    closeActionStatusEditor(false);
    renderPersonDirectory();
    if (editContext.personId && state.selectedPersonId === editContext.personId && state.personDetail) {
      renderPersonDetailAtCurrentPosition();
    } else if (meeting && state.selectedMeetingId === editContext.meetingId) {
      syncMeetingActionCard(meeting, originalItem, true);
      window.scrollTo(scrollLeft, scrollTop);
      elements.detail.querySelector(`#meeting-tab-${state.activeTab}`)?.focus({ preventScroll: true });
    }
    showToast("Action item deleted");
  } catch (error) {
    elements.actionStatusError.textContent = error.message;
    elements.actionStatusError.classList.remove("hidden");
  } finally {
    elements.actionDeleteConfirm.disabled = false;
    elements.actionDeleteConfirm.classList.remove("updating");
    elements.actionDeleteConfirm.replaceChildren(icon("trash"), document.createTextNode("Delete permanently"));
  }
});

document.addEventListener("keydown", (event) => {
  const activeModal = !elements.actionStatusModal.classList.contains("hidden")
    ? elements.actionStatusModal
    : !elements.modal.classList.contains("hidden")
      ? elements.modal
      : null;
  if (event.key === "Tab" && activeModal) {
    const focusable = [...activeModal.querySelectorAll("button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.hidden && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    return;
  }

  if (event.key === "Escape") {
    if (!elements.actionStatusModal.classList.contains("hidden")) closeActionStatusEditor();
    else if (!elements.modal.classList.contains("hidden")) closeModal();
    else if (elements.sidebar.classList.contains("open")) closeSidebar();
    else if (elements.shell.classList.contains("detail-view")) {
      if (state.activeSection === "persons") returnFromPersonDetail();
      else showMeetingList();
    }
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
