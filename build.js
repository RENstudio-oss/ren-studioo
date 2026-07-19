const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE = path.join(ROOT, "site");
const OUT = path.join(ROOT, "_site");
const STORIES = path.join(ROOT, "content", "stories");
const PROJECTS = path.join(ROOT, "content", "projects");
const LEGACY_POSTS = path.join(ROOT, "content", "posts");
const CATEGORIES = ["Tech", "Projects", "AI", "Creator", "Tutorials", "Reviews"];
const ADSENSE_CODE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9814495351652079" crossorigin="anonymous"></script>';

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const cut = line.indexOf(":");
    if (cut < 0) continue;
    const key = line.slice(0, cut).trim();
    let value = line.slice(cut + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (value === "true") value = true;
    if (value === "false") value = false;
    data[key] = value;
  }
  return { data, body: match[2].trim() };
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown = "") {
  const out = [];
  let paragraph = [];
  let list = null;
  let code = false;
  let codeLines = [];
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("```")) {
      flushParagraph(); flushList();
      if (code) { out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`); codeLines = []; }
      code = !code; continue;
    }
    if (code) { codeLines.push(line); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); out.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) { flushParagraph(); if (list !== "ul") { flushList(); list = "ul"; out.push("<ul>"); } out.push(`<li>${inlineMarkdown(bullet[1])}</li>`); continue; }
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) { flushParagraph(); if (list !== "ol") { flushList(); list = "ol"; out.push("<ol>"); } out.push(`<li>${inlineMarkdown(numbered[1])}</li>`); continue; }
    if (line.startsWith("> ")) { flushParagraph(); flushList(); out.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushList();
  return out.join("\n");
}

function getEntries(folder, type) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder).filter(file => file.endsWith(".md")).map(file => {
    const parsed = parseFrontmatter(fs.readFileSync(path.join(folder, file), "utf8"));
    const slug = file.replace(/\.md$/i, "");
    return { ...parsed.data, body: parsed.body, slug, type, url: `/${type}/${slug}.html` };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function siteHeader() {
  return `<header><a class="brand" href="/index.html"><strong>REN</strong><span>STUDIO</span></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/category/projects.html">Projects</a><a href="/category/tech.html">Tech</a><a href="/category/ai.html">AI</a><a href="/about.html">About</a></nav></header>`;
}

function siteFooter() {
  return `<footer><div><a class="brand" href="/index.html"><strong>REN</strong><span>STUDIO</span></a><p>Explore. Build. Create.</p></div><nav class="legal-links"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/cookies.html">Cookies</a><a href="/disclaimer.html">Disclaimer</a></nav><p>© <span data-year></span> REN Studio</p></footer>`;
}

function pageShell(title, description, content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)} — REN Studio</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/legal.css"><script src="/script.js" defer></script></head><body>${siteHeader()}${content}${siteFooter()}</body></html>`;
}

function storyRow(entry, number) {
  const meta = entry.type === "projects"
    ? `${entry.difficulty || "Beginner"} · ${entry.status || "Complete"}`
    : `${entry.category} · ${entry.reading_time || "6 min"}`;
  return `<a href="${entry.url}"><b>${String(number).padStart(2, "0")}</b><h3>${escapeHtml(entry.title)}</h3><span>${escapeHtml(meta)}</span><i>↗</i></a>`;
}

function addAdSenseCode(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "admin") addAdSenseCode(fullPath);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    const html = fs.readFileSync(fullPath, "utf8");
    if (!html.includes("ca-pub-9814495351652079")) {
      fs.writeFileSync(fullPath, html.replace("</head>", `${ADSENSE_CODE}</head>`));
    }
  }
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(SITE, OUT, { recursive: true });
  fs.cpSync(path.join(ROOT, "admin"), path.join(OUT, "admin"), { recursive: true });

  const stories = [...getEntries(STORIES, "stories"), ...getEntries(LEGACY_POSTS, "stories")]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const projects = getEntries(PROJECTS, "projects");
  const featured = projects.find(project => project.featured === true) || projects[0];

  let homepage = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const projectRows = projects.filter(project => project !== featured).slice(0, 3);
  const featuredHtml = featured
    ? `<section class="projects-home" id="projects"><div class="section-title"><p class="label">Projects</p><h2>Build something real.</h2></div><div class="featured"><a class="feature-image" href="${featured.url}"><img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.title)}"><span>01</span></a><div class="feature-copy"><p class="label">Featured project</p><h2>${escapeHtml(featured.title)}</h2><p>${escapeHtml(featured.description)}</p><a href="${featured.url}">View project <span>→</span></a></div></div>${projectRows.length ? `<div class="story-list project-list">${projectRows.map((project, i) => storyRow(project, i + 2)).join("")}</div>` : ""}</section>`
    : `<section class="projects-home" id="projects"><div class="section-title"><p class="label">Projects</p><h2>Build something real.</h2></div><div class="featured empty-feature"><div class="feature-copy"><p class="label">Start a project</p><h2>Your next build starts here.</h2><p>Create a project in the REN Studio CMS and it will appear in this section.</p></div></div></section>`;
  const storiesHtml = `<section class="stories" id="stories"><div class="section-title"><p class="label">Latest stories</p><h2>Ideas worth your time.</h2></div><div class="story-list">${stories.slice(0, 3).map((story, i) => storyRow(story, i + 1)).join("")}</div></section>`;
  homepage = homepage.replace(/<!-- CMS_FEATURED_START -->[\s\S]*?<!-- CMS_FEATURED_END -->/, featuredHtml)
    .replace(/<!-- CMS_STORIES_START -->[\s\S]*?<!-- CMS_STORIES_END -->/, storiesHtml);
  fs.writeFileSync(path.join(OUT, "index.html"), homepage);

  fs.mkdirSync(path.join(OUT, "stories"), { recursive: true });
  for (const story of stories) {
    const article = `<main class="article-page"><a class="back-link" href="/index.html">← Back to REN Studio</a><p class="label">${escapeHtml(story.category)}</p><h1>${escapeHtml(story.title)}</h1><p class="article-description">${escapeHtml(story.description)}</p><div class="article-meta"><span>${formatDate(story.date)}</span><span>${escapeHtml(story.reading_time || "6 min")}</span></div><img class="article-cover" src="${escapeHtml(story.image)}" alt="${escapeHtml(story.title)}"><article class="article-body">${markdownToHtml(story.body)}</article></main>`;
    fs.writeFileSync(path.join(OUT, "stories", `${story.slug}.html`), pageShell(story.title, story.description, article));
  }

  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });
  for (const project of projects) {
    const sourceLink = project.source_url ? `<a class="project-source" href="${escapeHtml(project.source_url)}">Get source files →</a>` : "";
    const article = `<main class="article-page project-page"><a class="back-link" href="/index.html">← Back to REN Studio</a><p class="label">Project</p><h1>${escapeHtml(project.title)}</h1><p class="article-description">${escapeHtml(project.description)}</p><div class="article-meta"><span>${formatDate(project.date)}</span><span>${escapeHtml(project.difficulty || "Beginner")}</span><span>${escapeHtml(project.build_time || "Build time varies")}</span><span>${escapeHtml(project.status || "Complete")}</span></div><img class="article-cover" src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}">${sourceLink}<article class="article-body">${markdownToHtml(project.body)}</article></main>`;
    fs.writeFileSync(path.join(OUT, "projects", `${project.slug}.html`), pageShell(project.title, project.description, article));
  }

  fs.mkdirSync(path.join(OUT, "category"), { recursive: true });
  for (const category of CATEGORIES) {
    const matches = category === "Projects" ? projects : stories.filter(story => story.category === category);
    const rows = matches.length ? matches.map((entry, i) => storyRow(entry, i + 1)).join("") : `<p class="empty-state">No ${escapeHtml(category)} entries yet. Add one from the CMS dashboard.</p>`;
    const content = `<main class="category-page"><p class="label">Explore</p><h1>${escapeHtml(category)}.</h1><div class="story-list">${rows}</div></main>`;
    fs.writeFileSync(path.join(OUT, "category", `${category.toLowerCase()}.html`), pageShell(category, `${category} from REN Studio`, content));
  }
  addAdSenseCode(OUT);
  console.log(`Built ${stories.length} stories, ${projects.length} projects and ${CATEGORIES.length} category pages into _site.`);
}

build();
