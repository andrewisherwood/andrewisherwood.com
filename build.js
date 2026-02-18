const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const sharp = require('sharp');

const start = Date.now();

// --- Helpers ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function render(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || '');
  }
  return result;
}

function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') return { data: {}, body: content };

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { endIndex = i; break; }
  }
  if (endIndex === -1) return { data: {}, body: content };

  const fmLines = lines.slice(1, endIndex);
  const data = {};
  let currentKey = null;
  let currentArray = null;
  let currentObj = null;

  for (const line of fmLines) {
    // Nested array item (starts with "  - " or "    ")
    if (currentArray !== null && /^\s{2,}-\s/.test(line)) {
      const itemContent = line.replace(/^\s*-\s*/, '');
      const colonIdx = itemContent.indexOf(':');
      if (colonIdx > -1) {
        // Start a new object in the array
        if (currentObj) currentArray.push(currentObj);
        currentObj = {};
        const k = itemContent.slice(0, colonIdx).trim();
        const v = itemContent.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        currentObj[k] = v;
      }
      continue;
    }

    if (currentArray !== null && /^\s{4,}\w/.test(line)) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > -1 && currentObj) {
        const k = line.slice(0, colonIdx).trim();
        const v = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        currentObj[k] = v;
      }
      continue;
    }

    // Close any pending array object
    if (currentObj) { currentArray.push(currentObj); currentObj = null; }
    if (currentArray !== null) { data[currentKey] = currentArray; currentArray = null; }

    // Top-level key: value
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Inline array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      currentKey = key;
      continue;
    }

    // Start of nested array
    if (value === '') {
      currentKey = key;
      currentArray = [];
      continue;
    }

    // String value
    data[key] = value.replace(/^["']|["']$/g, '');
    currentKey = key;
  }

  // Close any pending
  if (currentObj && currentArray) currentArray.push(currentObj);
  if (currentArray !== null && currentKey) data[currentKey] = currentArray;

  const body = lines.slice(endIndex + 1).join('\n');
  return { data, body };
}

async function optimizeImages(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  const files = fs.readdirSync(srcDir);
  const tasks = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
      const outName = file.replace(/\.(png|jpe?g|gif)$/i, '.webp');
      tasks.push(
        sharp(path.join(srcDir, file))
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(destDir, outName))
          .then(info => console.log(`    ${file} → ${outName} (${Math.round(info.size / 1024)}KB)`))
      );
    } else if (ext === '.svg') {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
  }
  await Promise.all(tasks);
}

(async () => {
// --- Load templates ---

const navTemplate = fs.readFileSync('templates/partials/nav.html', 'utf8');
const footerTemplate = fs.readFileSync('templates/partials/footer.html', 'utf8');
const blogPostTemplate = fs.readFileSync('templates/blog-post.html', 'utf8');
const caseStudyTemplate = fs.readFileSync('templates/case-study.html', 'utf8');
const blogIndexTemplate = fs.readFileSync('templates/blog-index.html', 'utf8');

// --- Generate blog posts ---

const blogDir = 'content/blog';
const blogFiles = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter(f => f.endsWith('.md')) : [];
const blogPosts = [];

for (const file of blogFiles) {
  const raw = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const htmlContent = marked(body);
  blogPosts.push({ ...data, htmlContent, bodyText: body, file });
}

// Sort by date descending
blogPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

for (let i = 0; i < blogPosts.length; i++) {
  const post = blogPosts[i];
  const slug = post.slug || post.file.replace('.md', '');
  const outDir = path.join('blog', slug);
  ensureDir(outDir);

  const nav = render(navTemplate, { navActiveWriting: 'nav-active', navActiveWork: '' });
  const prevPost = blogPosts[i + 1];
  const nextPost = blogPosts[i - 1];
  const prevLink = prevPost ? `<a href="/blog/${prevPost.slug || prevPost.file.replace('.md','')}/">&larr; ${prevPost.title}</a>` : '<span></span>';
  const nextLink = nextPost ? `<a href="/blog/${nextPost.slug || nextPost.file.replace('.md','')}/"> ${nextPost.title} &rarr;</a>` : '<span></span>';

  const html = render(blogPostTemplate, {
    title: post.title || '',
    description: post.description || '',
    slug,
    isoDate: post.date || '',
    formattedDate: formatDate(post.date),
    readingTime: String(readingTime(post.bodyText)),
    content: post.htmlContent,
    nav,
    footer: footerTemplate,
    prevLink,
    nextLink,
  });

  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`  blog/${slug}/index.html`);
}

// --- Generate case studies ---

const workDir = 'content/work';
const workFiles = fs.existsSync(workDir) ? fs.readdirSync(workDir).filter(f => f.endsWith('.md')) : [];
let caseStudyCount = 0;
const imageJobs = [];

for (const file of workFiles) {
  const raw = fs.readFileSync(path.join(workDir, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || file.replace('.md', '');
  const outDir = path.join('work', slug);
  ensureDir(outDir);

  let htmlContent = marked(body);
  // Rewrite image refs from .png/.jpg to .webp
  htmlContent = htmlContent.replace(/src="([^"]+)\.(png|jpe?g|gif)"/gi, 'src="$1.webp"');

  const nav = render(navTemplate, { navActiveWriting: '', navActiveWork: 'nav-active' });

  // Stack tags HTML
  const stack = data.stack || [];
  const stackTags = stack.map(s => `<span class="stack-tag">${s}</span>`).join('\n            ');

  // Metrics HTML
  const metrics = data.metrics || [];
  const metricsHtml = metrics.map(m =>
    `<div class="metric"><span class="metric-value">${m.value}</span><span class="metric-label">${m.label}</span></div>`
  ).join('\n            ');

  // Tags
  const tags = Array.isArray(data.tags) ? data.tags.join(' &middot; ') : (data.tags || '');

  const html = render(caseStudyTemplate, {
    title: data.title || '',
    description: data.description || '',
    slug,
    tags,
    stackTags,
    metricsHtml,
    content: htmlContent,
    nav,
    footer: footerTemplate,
  });

  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  // Optimize and copy images
  const imgSrcDir = path.join('content/work/images', slug);
  if (fs.existsSync(imgSrcDir)) {
    imageJobs.push(optimizeImages(imgSrcDir, outDir));
  }

  console.log(`  work/${slug}/index.html`);
  caseStudyCount++;
}

// --- Generate blog index ---

const postListItems = blogPosts.map(post => {
  const slug = post.slug || post.file.replace('.md', '');
  return `<li class="post-list-item">
        <a href="/blog/${slug}/">
          <div class="post-list-date">${formatDate(post.date)}</div>
          <div class="post-list-title">${post.title}</div>
          <div class="post-list-desc">${post.description || ''}</div>
        </a>
      </li>`;
}).join('\n      ');

const blogIndexNav = render(navTemplate, { navActiveWriting: 'nav-active', navActiveWork: '' });
const blogIndexHtml = render(blogIndexTemplate, {
  postListItems,
  nav: blogIndexNav,
  footer: footerTemplate,
});

ensureDir('blog');
fs.writeFileSync('blog/index.html', blogIndexHtml);
console.log('  blog/index.html');

// --- Generate RSS feed ---

const rssItems = blogPosts.map(post => {
  const slug = post.slug || post.file.replace('.md', '');
  return `    <item>
      <title>${escapeXml(post.title || '')}</title>
      <link>https://andrewisherwood.com/blog/${slug}/</link>
      <guid>https://andrewisherwood.com/blog/${slug}/</guid>
      <pubDate>${new Date(post.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(post.description || '')}</description>
    </item>`;
}).join('\n');

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Andrew Isherwood — Writing</title>
    <link>https://andrewisherwood.com/blog/</link>
    <description>Writing about product engineering, AI-augmented development, and building things that matter.</description>
    <language>en-gb</language>
    <atom:link href="https://andrewisherwood.com/blog/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

fs.writeFileSync('blog/feed.xml', rssFeed);
console.log('  blog/feed.xml');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Inject homepage writing section ---

const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const writingStart = '<!-- WRITING_SECTION_START -->';
const writingEnd = '<!-- WRITING_SECTION_END -->';

if (indexHtml.includes(writingStart) && indexHtml.includes(writingEnd)) {
  const latest = blogPosts.slice(0, 3);
  const writingItems = latest.map(post => {
    const slug = post.slug || post.file.replace('.md', '');
    return `      <li>
        <a href="/blog/${slug}/">
          <span class="writing-title">${post.title}</span>
          <span class="writing-date">${formatDate(post.date)}</span>
        </a>
      </li>`;
  }).join('\n');

  const writingSection = `<!-- WRITING_SECTION_START -->
<section id="writing" style="padding: 5rem 0;">
  <div class="container">
    <div class="section-label">Writing</div>
    <h2 class="section-title" style="margin-bottom: 2rem;">Latest writing</h2>
    <ul class="writing-list">
${writingItems}
    </ul>
    <div style="margin-top: 2rem;">
      <a href="/blog/" class="btn-secondary">All writing &rarr;</a>
    </div>
  </div>
</section>
<!-- WRITING_SECTION_END -->`;

  const startIdx = indexHtml.indexOf(writingStart);
  const endIdx = indexHtml.indexOf(writingEnd) + writingEnd.length;
  indexHtml = indexHtml.slice(0, startIdx) + writingSection + indexHtml.slice(endIdx);
  fs.writeFileSync(indexPath, indexHtml);
  console.log('  index.html (writing section injected)');
}

// --- Optimize images ---

await Promise.all(imageJobs);

// --- Summary ---

const elapsed = Date.now() - start;
console.log(`\nBuild complete: ${blogPosts.length} blog posts, ${caseStudyCount} case studies, ${elapsed}ms`);
})();
