export const BRIEF_STORAGE_KEY = "ve-design-briefs";
export const ADMIN_SETTINGS_KEY = "ve-design-admin-settings";
export const BUSINESS_EMAIL = "vedesign.uk@gmail.com";
export const BUSINESS_WHATSAPP_NUMBER = "";

export const DEFAULT_AUTO_REPLY =
  "Thanks {{name}}, VE Design received your {{service}} brief. I will review it and reply soon with the next step.";

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getBriefs = () => {
  const briefs = safeParse(window.localStorage.getItem(BRIEF_STORAGE_KEY), []);
  return Array.isArray(briefs) ? briefs : [];
};

export const saveBriefs = (briefs) => {
  window.localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(briefs));
};

export const addBrief = (brief) => {
  const briefs = getBriefs();
  const savedBrief = {
    id: window.crypto?.randomUUID?.() || `brief-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "New",
    notes: "",
    replyDraft: "",
    ...brief,
  };

  saveBriefs([savedBrief, ...briefs]);
  return savedBrief;
};

export const updateBrief = (id, patch) => {
  const briefs = getBriefs().map((brief) => (brief.id === id ? { ...brief, ...patch } : brief));
  saveBriefs(briefs);
  return briefs.find((brief) => brief.id === id) || null;
};

export const deleteBrief = (id) => {
  saveBriefs(getBriefs().filter((brief) => brief.id !== id));
};

export const getAdminSettings = () => ({
  autoReplyEnabled: false,
  autoReplyTemplate: DEFAULT_AUTO_REPLY,
  ...safeParse(window.localStorage.getItem(ADMIN_SETTINGS_KEY), {}),
});

export const saveAdminSettings = (settings) => {
  window.localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
};

export const fillTemplate = (template, brief) =>
  String(template || DEFAULT_AUTO_REPLY)
    .replaceAll("{{name}}", brief.name || "there")
    .replaceAll("{{service}}", brief.service || "project")
    .replaceAll("{{medium}}", brief.medium || "email");

export const makeBriefMessage = (brief) =>
  [
    "New VE Design brief",
    `Name: ${brief.name || "-"}`,
    `Email: ${brief.email || "-"}`,
    `Phone: ${brief.phone || "-"}`,
    `Medium: ${brief.medium || "-"}`,
    `Service: ${brief.service || "-"}`,
    "",
    "Project details:",
    brief.message || "-",
  ].join("\n");

export const makeReplyMessage = (brief) =>
  brief.replyDraft || fillTemplate(getAdminSettings().autoReplyTemplate, brief);

export const makeMailtoUrl = (to, subject, body) =>
  `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const makeWhatsAppUrl = (body, number = BUSINESS_WHATSAPP_NUMBER) => {
  const cleanedNumber = String(number || "").replace(/[^\d]/g, "");
  const baseUrl = cleanedNumber ? `https://wa.me/${cleanedNumber}` : "https://wa.me/";
  return `${baseUrl}?text=${encodeURIComponent(body)}`;
};

export const normalizePhoneForWhatsApp = (phone) => String(phone || "").replace(/[^\d]/g, "");
