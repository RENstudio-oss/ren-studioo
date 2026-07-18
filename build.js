const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE = path.join(ROOT, "site");
const POSTS = path.join(ROOT, "content", "posts");
const OUT = path.join(ROOT, "_site");
const CATEGORIES = ["Tech", "Projects", "AI", "Creator", "Tutorials", "Reviews"];

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

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = null;
  let code = false;
  let codeLines = [];
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`); paragraph = []; } };
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph(); flushList();
      if (code) { out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`); codeLines = []; }
      code = !code; continue;
    }
    if (code) { codeLines.push(line); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); const level = heading[1].length; out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
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

function slugFromFilename(filename) {
  return filename.replace(/\.md$/i, "");
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function getPosts() {
  return fs.readdirSync(POSTS).filter(file => file.endsWith(".md")).map(file => {
    const parsed = parseFrontmatter(fs.readFileSync(path.join(POSTS, file), "utf8"));
    const slug = slugFromFilename(file);
    return { ...parsed.data, body: parsed.body, slug, url: `/posts/${slug}.html` };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
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

function storyRow(post, number) {
  return `<a href="${post.url}"><b>${String(number).padStart(2, "0")}</b><h3>${escapeHtml(post.title)}</h3><span>${escapeHtml(post.category)} · ${escapeHtml(post.reading_time || "6 min")}</span><i>↗</i></a>`;
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(SITE, OUT, { recursive: true });
  fs.cpSync(path.join(ROOT, "admin"), path.join(OUT, "admin"), { recursive: true });
  const posts = getPosts();
  const featured = posts.find(post => post.featured === true) || posts[0];
  const rest = posts.filter(post => post !== featured).slice(0, 3);
  let homepage = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const featuredHtml = featured ? `<section class="featured" id="project"><a class="feature-image" href="${featured.url}"><img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.title)}"><span>01</span></a><div class="feature-copy"><p class="label">Featured project</p><h2>${escapeHtml(featured.title)}</h2><p>${escapeHtml(featured.description)}</p><a href="${featured.url}">View project <span>→</span></a></div></section>` : "";
  const storiesHtml = `<section class="stories" id="stories"><div class="section-title"><p class="label">Latest stories</p><h2>Ideas worth your time.</h2></div><div class="story-list">${rest.map((post, i) => storyRow(post, i + 1)).join("")}</div></section>`;
  homepage = homepage.replace(/<!-- CMS_FEATURED_START -->[\s\S]*?<!-- CMS_FEATURED_END -->/, featuredHtml)
    .replace(/<!-- CMS_STORIES_START -->[\s\S]*?<!-- CMS_STORIES_END -->/, storiesHtml);
  fs.writeFileSync(path.join(OUT, "index.html"), homepage);

  fs.mkdirSync(path.join(OUT, "posts"), { recursive: true });
  for (const post of posts) {
    const article = `<main class="article-page"><a class="back-link" href="/index.html">← Back to REN Studio</a><p class="label">${escapeHtml(post.category)}</p><h1>${escapeHtml(post.title)}</h1><p class="article-description">${escapeHtml(post.description)}</p><div class="article-meta"><span>${formatDate(post.date)}</span><span>${escapeHtml(post.reading_time || "6 min")}</span></div><img class="article-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}"><article class="article-body">${markdownToHtml(post.body)}</article></main>`;
    fs.writeFileSync(path.join(OUT, "posts", `${post.slug}.html`), pageShell(post.title, post.description, article));
  }

  fs.mkdirSync(path.join(OUT, "category"), { recursive: true });
  for (const category of CATEGORIES) {
    const matches = posts.filter(post => post.category === category);
    const rows = matches.length ? matches.map((post, i) => storyRow(post, i + 1)).join("") : `<p class="empty-state">No ${escapeHtml(category)} posts yet. Add one from the CMS dashboard.</p>`;
    const content = `<main class="category-page"><p class="label">Explore</p><h1>${escapeHtml(category)}.</h1><div class="story-list">${rows}</div></main>`;
    fs.writeFileSync(path.join(OUT, "category", `${category.toLowerCase()}.html`), pageShell(category, `${category} posts from REN Studio`, content));
  }
  console.log(`Built ${posts.length} posts and ${CATEGORIES.length} category pages into _site.`);
}

build();
