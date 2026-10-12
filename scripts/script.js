// HealthYou front-end demo.
// Everything is stored in this browser (localStorage); there is no server.

// ---------- Storage helpers ----------
const store = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable (private mode etc.) */
    }
  },
};

// Passwords are hashed before being saved, never stored as plain text.
async function hashPassword(pw) {
  if (!window.crypto || !crypto.subtle) return pw;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Health tips ----------
const healthTips = [
  "Drink water regularly through the day. Staying hydrated helps maintain energy levels and overall health.",
  "Take a 5-minute break every hour to stretch. This helps reduce muscle tension and improve circulation.",
  "Incorporate more fruits and vegetables into your diet. They provide essential vitamins, minerals, and fiber.",
  "Practice deep breathing to reduce stress. Inhale through your nose, hold for a few seconds, and exhale slowly.",
  "Aim for 7 to 9 hours of sleep each night. Quality sleep is vital for mental and physical health.",
  "Take a walk for at least 30 minutes a day. Walking helps cardiovascular health and mood.",
  "Stay consistent with your medication schedule. Always take your medications as prescribed.",
  "Visit your doctor for regular check-ups. Early detection of health issues leads to better outcomes.",
  "If you have high blood pressure, monitor it regularly and keep a record to share with your clinician.",
  "Keep a gratitude journal. Write down three things you are grateful for each day.",
  "Eat a balanced breakfast. A healthy breakfast fuels your body and improves concentration.",
  "Limit sugary drinks. Choose water or unsweetened drinks instead.",
  "Practice good posture. Sit and stand up straight to avoid back pain and improve breathing.",
  "Take a few minutes each day for mindfulness or quiet reflection to reduce stress.",
  "Include lean proteins in your diet. Protein is essential for muscle repair and immune function.",
  "Spend time outdoors. Fresh air and daylight can boost your mood and well-being.",
  "Choose whole, minimally processed foods for better nutrition.",
  "Stay socially connected. Regular contact with friends and family supports mental health.",
  "Wash your hands frequently. Good hand hygiene prevents the spread of infections.",
  "Set realistic health goals and break them into small, achievable steps.",
  "Include strength training. Building muscle supports metabolism and bone density.",
  "Avoid smoking and limit alcohol. Both have serious long-term health effects.",
  "Practice safe sun exposure. Use sunscreen and protective clothing.",
  "Learn about any health conditions you have and how to manage them.",
  "Take breaks from screens. Rest your eyes and stretch to prevent strain.",
  "Include healthy fats such as avocados, nuts, and olive oil.",
  "Be kind to yourself. Focus on progress, not perfection.",
];

function initHealthTips() {
  const el = document.getElementById("health-tip");
  if (!el) return;
  let last = -1;
  const show = () => {
    let i;
    do {
      i = Math.floor(Math.random() * healthTips.length);
    } while (i === last && healthTips.length > 1);
    last = i;
    el.textContent = healthTips[i];
  };
  const fade = () => {
    el.style.opacity = 0;
    setTimeout(() => { show(); el.style.opacity = 1; }, 250);
  };
  show();
  let timer = setInterval(fade, 10000);
  const next = document.getElementById("nextTip");
  if (next) next.addEventListener("click", () => { clearInterval(timer); fade(); timer = setInterval(fade, 10000); });
}

// ---------- Reminders ----------
const intervalHours = { "2hourly": 2, "4hourly": 4, "6hourly": 6, "8hourly": 8, "10hourly": 10 };
const timers = {};

function labelFor(selectId, value) {
  const opt = document.querySelector(`#${selectId} option[value="${value}"]`);
  return opt ? opt.textContent : value;
}

function notify(message) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") new Notification("HealthYou", { body: message });
}

function schedule(reminder) {
  clearInterval(timers[reminder.id]);
  const h = intervalHours[reminder.interval];
  if (!h || reminder.completed) return;
  timers[reminder.id] = setInterval(
    () => notify(`Reminder: ${labelFor("reminder-type", reminder.type)}`),
    h * 3600 * 1000
  );
}

const ICONS = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
};
const TILE_COLORS = ["blue", "green", "indigo", "amber", "rose"];

function renderReminders() {
  const list = document.querySelector(".reminder-list");
  if (!list) return;
  const reminders = store.get("reminders", []);
  const open = reminders.filter((r) => !r.completed).length;
  const count = document.getElementById("reminderCount");
  if (count) count.textContent = reminders.length;
  const summary = document.getElementById("reminderSummary");
  if (summary) {
    summary.textContent = reminders.length
      ? `${open} active, ${reminders.length - open} completed`
      : "Nothing set yet";
  }
  list.innerHTML = "";
  if (!reminders.length) {
    const empty = document.createElement("p");
    empty.className = "reminder-empty";
    empty.textContent = "No reminders yet. Add your first one.";
    list.appendChild(empty);
    return;
  }
  reminders.forEach((r, i) => {
    const item = document.createElement("div");
    item.className = "reminder-item" + (r.completed ? " completed" : "");
    item.dataset.id = r.id;

    const tile = document.createElement("span");
    tile.className = "tile sm " + TILE_COLORS[i % TILE_COLORS.length];
    tile.innerHTML = ICONS.bell;

    const text = document.createElement("div");
    text.className = "r-text";
    const title = document.createElement("p");
    title.className = "r-title";
    title.textContent = labelFor("reminder-type", r.type);
    const meta = document.createElement("p");
    meta.className = "r-meta";
    meta.innerHTML = ICONS.clock;
    meta.append(r.completed ? "Completed" : `Every ${labelFor("interval", r.interval)}`);
    text.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "reminder-actions";
    if (!r.completed) {
      const done = document.createElement("button");
      done.className = "icon-btn";
      done.type = "button";
      done.title = "Mark as completed";
      done.setAttribute("aria-label", "Mark as completed");
      done.innerHTML = ICONS.check;
      done.addEventListener("click", () => updateReminder(r.id, { completed: true }));
      actions.appendChild(done);
    }
    const del = document.createElement("button");
    del.className = "icon-btn danger";
    del.type = "button";
    del.title = "Delete";
    del.setAttribute("aria-label", "Delete reminder");
    del.innerHTML = ICONS.trash;
    del.addEventListener("click", () => deleteReminder(r.id));
    actions.appendChild(del);

    item.append(tile, text, actions);
    list.appendChild(item);
    schedule(r);
  });
}

function updateReminder(id, changes) {
  const reminders = store.get("reminders", []).map((r) => (r.id === id ? { ...r, ...changes } : r));
  store.set("reminders", reminders);
  if (changes.completed) clearInterval(timers[id]);
  renderReminders();
}

function deleteReminder(id) {
  clearInterval(timers[id]);
  store.set("reminders", store.get("reminders", []).filter((r) => r.id !== id));
  renderReminders();
}

function initReminders() {
  const form = document.getElementById("reminder-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const reminders = store.get("reminders", []);
    reminders.push({
      id: Date.now().toString(36),
      type: form.elements["reminder-type"].value,
      interval: form.elements["interval"].value,
      completed: false,
    });
    store.set("reminders", reminders);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    form.reset();
    renderReminders();
  });
  renderReminders();
}

// ---------- BMI ----------
function initBmi() {
  const form = document.getElementById("bmiForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const weight = parseFloat(form.elements.weight.value);
    const height = parseFloat(form.elements.height.value);
    const out = document.getElementById("bmiResult");
    const big = document.getElementById("bmiValue");
    const marker = document.getElementById("bmiMarker");
    if (!(weight > 0 && height > 0)) {
      out.textContent = "Please enter a valid weight and height.";
      return;
    }
    const bmi = weight / (height * height);
    let band;
    if (bmi < 18.5) band = "underweight";
    else if (bmi < 25) band = "a healthy weight";
    else if (bmi < 30) band = "overweight";
    else band = "obesity";
    out.textContent = `In the ${band} range. BMI is a screening measure, not a diagnosis.`;
    if (big) big.textContent = bmi.toFixed(1);
    if (marker) {
      // scale runs from BMI 13 to 40; band edges at 18.5, 25 and 30 fall at about 20%, 44% and 63%
      const pct = Math.min(100, Math.max(0, ((bmi - 13) / 27) * 100));
      marker.style.left = pct + "%";
      marker.classList.add("show");
    }
  });
}

// ---------- Sign up, login, logout ----------
function initAuth() {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = signupForm.elements;
      f.password.setCustomValidity(f.password.value.length < 8 ? "Password must be at least 8 characters long." : "");
      f.passwordVerify.setCustomValidity(f.password.value !== f.passwordVerify.value ? "Passwords do not match." : "");
      if (!signupForm.reportValidity()) return;

      const users = store.get("users", []);
      const email = f.email.value.trim().toLowerCase();
      if (users.some((u) => u.email === email)) {
        alert("An account with this email already exists on this device. Please log in.");
        return;
      }
      const user = {
        name: f.name.value.trim(),
        email,
        passwordHash: await hashPassword(f.password.value),
        birthday: f.birthday.value,
        sex: f.sex.value,
      };
      users.push(user);
      store.set("users", users);
      store.set("currentUser", { name: user.name, email: user.email });
      window.location.href = "./features.html";
    });
    ["password", "passwordVerify"].forEach((n) =>
      signupForm.elements[n].addEventListener("input", (e) => e.target.setCustomValidity(""))
    );
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginForm.elements.email.value.trim().toLowerCase();
      const hash = await hashPassword(loginForm.elements.password.value);
      const user = store.get("users", []).find((u) => u.email === email && u.passwordHash === hash);
      if (user) {
        store.set("currentUser", { name: user.name, email: user.email });
        window.location.href = "./features.html";
      } else {
        alert("Login failed: invalid email or password.");
      }
    });
  }

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    window.location.href = "./index.html";
  };
  const logoutForm = document.getElementById("logoutForm");
  if (logoutForm) logoutForm.addEventListener("submit", logout);
  const logoutLink = document.getElementById("logout");
  if (logoutLink) logoutLink.addEventListener("click", logout);
}

// ---------- Account page ----------
function initAccount() {
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const current = store.get("currentUser", null);
    if (current) {
      profileForm.elements.name.value = current.name || "";
      profileForm.elements.email.value = current.email || "";
    }
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = profileForm.elements;
      const users = store.get("users", []);
      const prev = store.get("currentUser", null);
      const idx = prev ? users.findIndex((u) => u.email === prev.email) : -1;
      if (idx < 0) {
        alert("Please sign up or log in first.");
        return;
      }
      users[idx].name = f.name.value.trim();
      users[idx].email = f.email.value.trim().toLowerCase();
      if (f.password.value) {
        if (f.password.value.length < 8) {
          alert("Password must be at least 8 characters long.");
          return;
        }
        users[idx].passwordHash = await hashPassword(f.password.value);
      }
      store.set("users", users);
      store.set("currentUser", { name: users[idx].name, email: users[idx].email });
      f.password.value = "";
      alert("Profile saved.");
    });
  }

  const notifyForm = document.getElementById("notifyForm");
  if (notifyForm) {
    const prefs = store.get("notificationPrefs", {});
    notifyForm.elements["push-notifications"].checked = !!prefs.push;
    notifyForm.elements["sms-notifications"].checked = !!prefs.sms;
    notifyForm.elements["notification-sound"].value = prefs.sound || "default";
    notifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const push = notifyForm.elements["push-notifications"].checked;
      store.set("notificationPrefs", {
        push,
        sms: notifyForm.elements["sms-notifications"].checked,
        sound: notifyForm.elements["notification-sound"].value,
      });
      if (push && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      alert("Notification preferences saved.");
    });
  }

  const exportBtn = document.getElementById("exportDataButton");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = {
        profile: store.get("currentUser", null),
        reminders: store.get("reminders", []),
        notificationPrefs: store.get("notificationPrefs", {}),
        exported: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "healthyou-data.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  const clearBtn = document.getElementById("clearDataButton");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Delete all HealthYou data stored in this browser?")) return;
      ["users", "currentUser", "reminders", "notificationPrefs"].forEach((k) => localStorage.removeItem(k));
      alert("All data cleared.");
      window.location.href = "./index.html";
    });
  }
}

// ---------- Contact form (About page) ----------
function initContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    const subject = `HealthYou message from ${f.contactName.value}`;
    const body = `${f.contactMessage.value}\n\nFrom: ${f.contactName.value} <${f.contactEmail.value}>`;
    window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

// ---------- Navigation ----------
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const list = document.querySelector(".nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", () => {
      const open = list.classList.toggle("active");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
}

// Show the right header buttons and greeting for guests vs logged-in users.
function initSession() {
  const user = store.get("currentUser", null);
  document.querySelectorAll("[data-guest]").forEach((el) => { el.closest("li").hidden = !!user; });
  document.querySelectorAll("[data-member]").forEach((el) => { el.hidden = !user; el.closest("li").hidden = !user; });
  const greet = document.getElementById("greeting");
  if (greet) {
    const h = new Date().getHours();
    const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    greet.textContent = user ? `${part}, ${user.name.split(" ")[0]}` : part;
  }
  const status = document.getElementById("accountStatus");
  if (status && !user) {
    status.innerHTML = 'You are not logged in. <a href="./login.html">Log in</a> or <a href="./signup.html">create an account</a> to save a profile.';
  }
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initSession();
  initReveal();
  initHealthTips();
  initReminders();
  initBmi();
  initAuth();
  initAccount();
  initContact();
});
