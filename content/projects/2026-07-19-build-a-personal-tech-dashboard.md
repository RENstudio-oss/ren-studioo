---
title: "Build a Personal Tech Dashboard With HTML, CSS and JavaScript"
date: "2026-07-19T15:00:00Z"
description: "Build a clean browser dashboard for your projects, priorities and quick links—without a framework, account or paid service."
image: "/images/uploads/personal-tech-dashboard-cover.png"
featured: true
difficulty: "Beginner"
build_time: "60–90 minutes"
status: "Complete"
---

A useful first project does not need artificial intelligence, a database or a complicated framework. It needs a clear job.

In this project, we will build a personal dashboard that opens in any modern browser. It gives you one place for today’s priorities, active projects, useful links and a simple clock. Everything runs with plain HTML, CSS and JavaScript, and the browser remembers your tasks with local storage.

The result is small enough to understand in one sitting but polished enough to keep using.

## What you will build

The finished dashboard includes:

- A live clock and date
- Three editable priority items
- Project cards with progress indicators
- A set of quick links
- A dark, responsive interface
- Automatic saving in your browser

You do not need a server or an account. Your data stays inside the browser on the device where you created it.

## What you need

Create a folder named `personal-dashboard`. Inside it, create three files:

```text
personal-dashboard/
  index.html
  style.css
  script.js
```

You can edit them with Visual Studio Code, Notepad or any plain-text editor.

## Step 1: Build the structure

Open `index.html` and add the main page structure:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <main class="dashboard">
    <header>
      <div>
        <p class="eyebrow">PERSONAL COMMAND CENTER</p>
        <h1>Good morning.</h1>
      </div>
      <div class="time">
        <strong id="clock">00:00</strong>
        <span id="date">Loading date…</span>
      </div>
    </header>

    <section class="grid">
      <article class="panel priorities">
        <p class="label">Today</p>
        <h2>Top priorities</h2>
        <label><input type="checkbox"><input class="task" value="Finish the dashboard"></label>
        <label><input type="checkbox"><input class="task" value="Review current project"></label>
        <label><input type="checkbox"><input class="task" value="Plan tomorrow"></label>
      </article>

      <article class="panel project">
        <p class="label">Active project</p>
        <h2>Personal website</h2>
        <p>Design and publish the first complete version.</p>
        <div class="progress"><span style="width: 65%"></span></div>
        <small>65% complete</small>
      </article>

      <article class="panel links">
        <p class="label">Quick access</p>
        <h2>Useful links</h2>
        <a href="https://github.com/">GitHub <span>↗</span></a>
        <a href="https://developer.mozilla.org/">MDN Web Docs <span>↗</span></a>
        <a href="https://www.youtube.com/">YouTube <span>↗</span></a>
      </article>
    </section>
  </main>
</body>
</html>
```

There are no complicated components here. Each part is a semantic section that can be restyled or replaced later.

## Step 2: Create the visual system

Open `style.css`. Start with a small set of reusable colors, then build the layout:

```css
:root {
  --background: #050505;
  --panel: #101012;
  --line: #2a2527;
  --text: #f5f3f1;
  --muted: #999395;
  --accent: #ef233c;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: Arial, sans-serif;
}

.dashboard {
  width: min(1100px, calc(100% - 32px));
  margin: auto;
  padding: 64px 0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--line);
}

h1 {
  margin: 8px 0 0;
  font-size: clamp(3rem, 8vw, 6rem);
  letter-spacing: -0.07em;
}

.eyebrow, .label {
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.time { text-align: right; }
.time strong { display: block; font-size: 2.2rem; }
.time span { color: var(--muted); }

.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.panel {
  min-height: 260px;
  padding: 28px;
  background: var(--panel);
  border: 1px solid var(--line);
}

.priorities { grid-row: span 2; }
.panel h2 { margin: 8px 0 24px; }

.priorities label {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.task {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
}

.progress {
  height: 5px;
  margin: 32px 0 10px;
  overflow: hidden;
  background: #30292c;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--accent);
}

.panel p, .panel small { color: var(--muted); }

.links a {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  color: var(--text);
  text-decoration: none;
}

.links a:hover { color: var(--accent); }

@media (max-width: 700px) {
  .dashboard { padding-top: 32px; }
  header { align-items: start; flex-direction: column; }
  .time { text-align: left; }
  .grid { grid-template-columns: 1fr; }
  .priorities { grid-row: auto; }
}
```

The responsive rule is important. A dashboard that only works on your main monitor is less useful than one you can quickly check from a phone.

## Step 3: Make the clock work

Open `script.js` and create a function that updates both time elements:

```javascript
const clock = document.querySelector("#clock");
const date = document.querySelector("#date");

function updateTime() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  date.textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

updateTime();
setInterval(updateTime, 1000);
```

Calling the function once before starting the interval prevents the page from displaying placeholder text for the first second.

## Step 4: Remember your priorities

Browser local storage saves small pieces of information as text. We can use it to remember the editable task fields:

```javascript
const tasks = [...document.querySelectorAll(".task")];
const checks = [...document.querySelectorAll('input[type="checkbox"]')];

const savedTasks = JSON.parse(localStorage.getItem("dashboardTasks") || "null");
const savedChecks = JSON.parse(localStorage.getItem("dashboardChecks") || "null");

if (savedTasks) {
  tasks.forEach((task, index) => task.value = savedTasks[index] || "");
}

if (savedChecks) {
  checks.forEach((check, index) => check.checked = Boolean(savedChecks[index]));
}

function saveDashboard() {
  localStorage.setItem("dashboardTasks", JSON.stringify(tasks.map(task => task.value)));
  localStorage.setItem("dashboardChecks", JSON.stringify(checks.map(check => check.checked)));
}

tasks.forEach(task => task.addEventListener("input", saveDashboard));
checks.forEach(check => check.addEventListener("change", saveDashboard));
```

Refresh the page after editing a priority. The new text and checkbox state should remain.

Local storage is convenient, but it is not a cloud database. Clearing the browser’s site data removes the saved information, and another device will not automatically receive it. For a private single-device dashboard, that limitation is often acceptable.

## Step 5: Make it yours

The best dashboard reflects what you actually check every day. Useful improvements include:

- Replace the sample links with your tools
- Add cards for school assignments or content ideas
- Change the project progress value
- Add a notes field
- Create light and dark themes
- Display data from a public weather API
- Package the page as an installable progressive web app

Add one improvement at a time. The project becomes harder to understand when every new idea arrives at once.

## Run the dashboard

Double-click `index.html` to open it locally. Because this version does not load remote data, it works without a development server.

You can also publish it for free with GitHub Pages, Netlify or another static host. Remember that local-storage data remains tied to each visitor’s browser, even when the page is online.

## What this project teaches

This simple build covers several important web-development ideas:

- Semantic HTML gives content structure
- CSS Grid creates responsive layouts
- JavaScript updates the document
- Events respond to user input
- Local storage preserves small amounts of state
- Progressive enhancement keeps the core page understandable

More importantly, you finish with something useful. That is the standard REN Studio will keep returning to: learn the technology, but build a real thing with it.
