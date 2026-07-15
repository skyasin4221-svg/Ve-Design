import { createIcons, icons } from "lucide";
import {
  DEFAULT_AUTO_REPLY,
  deleteBrief,
  fillTemplate,
  getAdminSettings,
  getBriefs,
  makeMailtoUrl,
  makeReplyMessage,
  makeWhatsAppUrl,
  normalizePhoneForWhatsApp,
  saveAdminSettings,
  updateBrief,
} from "./brief-store.js";

const ADMIN_USERNAME = "yasin4221";
const ADMIN_PASSWORD_HASH = "afc30a3d3f5407bacd963a89591254680704dca219ab68b173a70dc2c18bb922";
const ADMIN_SESSION_KEY = "ve-design-admin-session";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

createIcons({ icons });

let selectedBriefId = "";

const hashText = async (value) => {
  const buffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const titleCase = (value) => String(value || "Unknown").replace(/^\w/, (letter) => letter.toUpperCase());

const setView = (isLoggedIn) => {
  qs("[data-admin-login]").hidden = isLoggedIn;
  qs("[data-admin-dashboard]").hidden = !isLoggedIn;
  if (isLoggedIn) {
    loadSettings();
    renderDashboard();
  }
};

const getFilteredBriefs = () => {
  const status = qs("[data-filter-status]")?.value || "all";
  const medium = qs("[data-filter-medium]")?.value || "all";

  return getBriefs().filter((brief) => {
    const statusMatch = status === "all" || brief.status === status;
    const mediumMatch = medium === "all" || brief.medium === medium;
    return statusMatch && mediumMatch;
  });
};

const renderStats = (briefs) => {
  qs("[data-stat-total]").textContent = String(briefs.length);
  qs("[data-stat-new]").textContent = String(briefs.filter((brief) => brief.status === "New").length);
  qs("[data-stat-replied]").textContent = String(briefs.filter((brief) => brief.status === "Replied").length);
};

const renderBriefList = () => {
  const list = qs("[data-brief-list]");
  const briefs = getFilteredBriefs();
  list.replaceChildren();

  if (!briefs.length) {
    const empty = document.createElement("p");
    empty.className = "admin-list-empty";
    empty.textContent = "No briefs found";
    list.append(empty);
    return;
  }

  briefs.forEach((brief) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `admin-brief-card${brief.id === selectedBriefId ? " is-active" : ""}`;
    button.addEventListener("click", () => {
      selectedBriefId = brief.id;
      renderDashboard();
    });

    const top = document.createElement("span");
    top.className = "admin-brief-card-top";

    const service = document.createElement("strong");
    service.textContent = brief.service || "Project brief";

    const status = document.createElement("small");
    status.textContent = brief.status || "New";

    const meta = document.createElement("span");
    meta.className = "admin-brief-meta";
    meta.textContent = `${brief.name || "Unknown"} - ${titleCase(brief.medium)} - ${formatDate(brief.createdAt)}`;

    top.append(service, status);
    button.append(top, meta);
    list.append(button);
  });
};

const addDetailRow = (root, label, value) => {
  const row = document.createElement("div");
  row.className = "admin-detail-row";
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value || "-";
  row.append(labelElement, valueElement);
  root.append(row);
};

const renderBriefDetail = () => {
  const detail = qs("[data-brief-detail]");
  const brief = getBriefs().find((item) => item.id === selectedBriefId);
  detail.replaceChildren();

  if (!brief) {
    const empty = document.createElement("div");
    empty.className = "admin-empty";
    empty.innerHTML = '<i data-lucide="inbox" aria-hidden="true"></i><p>Select a brief</p>';
    detail.append(empty);
    createIcons({ icons });
    return;
  }

  const header = document.createElement("div");
  header.className = "admin-detail-header";

  const heading = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = titleCase(brief.medium);
  const title = document.createElement("h2");
  title.textContent = brief.service || "Project brief";
  heading.append(eyebrow, title);

  const statusSelect = document.createElement("select");
  ["New", "Reviewing", "Replied"].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = brief.status === status;
    statusSelect.append(option);
  });
  statusSelect.addEventListener("change", () => {
    updateBrief(brief.id, { status: statusSelect.value });
    renderDashboard();
  });

  header.append(heading, statusSelect);
  detail.append(header);

  const rows = document.createElement("div");
  rows.className = "admin-detail-rows";
  addDetailRow(rows, "Name", brief.name);
  addDetailRow(rows, "Email", brief.email);
  addDetailRow(rows, "Phone", brief.phone);
  addDetailRow(rows, "Created", formatDate(brief.createdAt));
  detail.append(rows);

  const messageBlock = document.createElement("div");
  messageBlock.className = "admin-message";
  const messageLabel = document.createElement("span");
  messageLabel.textContent = "Brief";
  const messageText = document.createElement("p");
  messageText.textContent = brief.message || "-";
  messageBlock.append(messageLabel, messageText);
  detail.append(messageBlock);

  const replyRow = document.createElement("div");
  replyRow.className = "form-row";
  const replyLabel = document.createElement("label");
  replyLabel.setAttribute("for", "admin-reply");
  replyLabel.textContent = "Reply draft";
  const replyTextarea = document.createElement("textarea");
  replyTextarea.id = "admin-reply";
  replyTextarea.rows = 5;
  replyTextarea.value = brief.replyDraft || fillTemplate(getAdminSettings().autoReplyTemplate, brief);
  replyRow.append(replyLabel, replyTextarea);
  detail.append(replyRow);

  const notesRow = document.createElement("div");
  notesRow.className = "form-row";
  const notesLabel = document.createElement("label");
  notesLabel.setAttribute("for", "admin-notes");
  notesLabel.textContent = "Internal notes";
  const notesTextarea = document.createElement("textarea");
  notesTextarea.id = "admin-notes";
  notesTextarea.rows = 3;
  notesTextarea.value = brief.notes || "";
  notesRow.append(notesLabel, notesTextarea);
  detail.append(notesRow);

  const actions = document.createElement("div");
  actions.className = "admin-actions";

  const saveButton = makeActionButton("Save", "save", () => {
    updateBrief(brief.id, { replyDraft: replyTextarea.value.trim(), notes: notesTextarea.value.trim() });
    renderDashboard();
  });

  const copyButton = makeActionButton("Copy Reply", "copy", () => {
    navigator.clipboard?.writeText?.(replyTextarea.value).catch(() => {});
  });

  const emailButton = makeActionButton("Email Reply", "mail", () => {
    const currentBrief = updateBrief(brief.id, { replyDraft: replyTextarea.value.trim(), status: "Replied" }) || brief;
    window.location.href = makeMailtoUrl(currentBrief.email, `VE Design - ${currentBrief.service || "Project"}`, makeReplyMessage(currentBrief));
  });

  const whatsappButton = makeActionButton("WhatsApp Reply", "message-circle", () => {
    const currentBrief = updateBrief(brief.id, { replyDraft: replyTextarea.value.trim(), status: "Replied" }) || brief;
    const phone = normalizePhoneForWhatsApp(currentBrief.phone);
    window.open(makeWhatsAppUrl(makeReplyMessage(currentBrief), phone), "_blank", "noopener,noreferrer");
  });

  const deleteButton = makeActionButton("Delete", "trash-2", () => {
    if (!window.confirm("Delete this brief?")) return;
    deleteBrief(brief.id);
    selectedBriefId = "";
    renderDashboard();
  });
  deleteButton.classList.add("button-danger");

  actions.append(saveButton, copyButton, emailButton, whatsappButton, deleteButton);
  detail.append(actions);
  createIcons({ icons });
};

const makeActionButton = (label, iconName, onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-secondary admin-action-button";
  button.innerHTML = `<span>${label}</span><i data-lucide="${iconName}" aria-hidden="true"></i>`;
  button.addEventListener("click", onClick);
  return button;
};

const renderDashboard = () => {
  const briefs = getBriefs();
  if (!selectedBriefId && briefs.length) selectedBriefId = briefs[0].id;
  renderStats(briefs);
  renderBriefList();
  renderBriefDetail();
};

const loadSettings = () => {
  const settings = getAdminSettings();
  qs("[data-auto-reply-enabled]").checked = Boolean(settings.autoReplyEnabled);
  qs("[data-auto-reply-template]").value = settings.autoReplyTemplate || DEFAULT_AUTO_REPLY;
};

qsa("[data-filter-status], [data-filter-medium]").forEach((filter) => {
  filter.addEventListener("change", renderDashboard);
});

qs("[data-save-settings]")?.addEventListener("click", () => {
  saveAdminSettings({
    autoReplyEnabled: qs("[data-auto-reply-enabled]").checked,
    autoReplyTemplate: qs("[data-auto-reply-template]").value.trim() || DEFAULT_AUTO_REPLY,
  });
  qs("[data-settings-status]").textContent = "Saved";
  window.setTimeout(() => {
    qs("[data-settings-status]").textContent = "";
  }, 1800);
});

qs("[data-export-briefs]")?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getBriefs(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ve-design-briefs-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

qs("[data-admin-login-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const passwordHash = await hashText(password);

  if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    qs("[data-login-status]").textContent = "";
    setView(true);
    return;
  }

  qs("[data-login-status]").textContent = "Login details are incorrect.";
});

qs("[data-admin-logout]")?.addEventListener("click", () => {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  setView(false);
});

setView(window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1");
