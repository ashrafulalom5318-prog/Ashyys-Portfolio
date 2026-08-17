// ═══════════════════════════════════════════
//  SCRIPT.JS — GitHub data.json se fetch
// ═══════════════════════════════════════════

// ✅ GitHub raw URL — data.json
const DATA_URL =
  'https://raw.githubusercontent.com/ashrafulalom5318-prog/Ashyys-Portfolio/main/data.json';

// Cache bust — har baar fresh data
function fetchData() {
  return fetch(`${DATA_URL}?t=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    });
}

// ── INIT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchData()
    .then(data => {
      renderBanner(data.banner);
      renderProfile(data.profile);
      renderResources(data.resources || []);
      renderProjects(data.projects || []);
      setupPopup();
    })
    .catch(err => {
      console.error('Data load failed:', err);
      showError();
    });
});

// ── ERROR STATE ─────────────────────────────
function showError() {
  const grid = document.getElementById('resourceGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <p>Could not load data. Please try again.</p>
      </div>`;
  }
}

// ── SVG ICONS ───────────────────────────────
const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  x: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17
    l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08
    l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`,

  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852
    -3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046
    c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z
    M5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065z
    m1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0
    1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24
    22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>`
};

// ── RENDER BANNER ───────────────────────────
function renderBanner(banner) {
  if (!banner) return;
  const link = document.getElementById('topBannerLink');
  const text = document.getElementById('topBannerText');
  if (link) link.href        = banner.url  || '#';
  if (text) text.textContent = banner.text || '';
}

// ── RENDER PROFILE ──────────────────────────
function renderProfile(profile) {
  if (!profile) return;

  const nameEl    = document.getElementById('profileName');
  const taglineEl = document.getElementById('profileTagline');
  const photoEl   = document.getElementById('profilePhoto');
  const socialsEl = document.getElementById('socialLinks');

  if (nameEl)    nameEl.textContent    = profile.name    || '';
  if (taglineEl) taglineEl.textContent = profile.tagline || '';

  if (photoEl && profile.photo) {
    photoEl.src = profile.photo;
    photoEl.alt = profile.name || 'Profile';
  }

  if (socialsEl && profile.socials) {
    socialsEl.innerHTML = profile.socials.map(s => `
      <a href="${s.url}"
         target="_blank"
         rel="noopener noreferrer"
         class="social-link"
         title="${s.name}"
         aria-label="${s.name}">
        ${ICONS[s.icon] || ''}
      </a>
    `).join('');
  }
}

// ═══════════════════════════════════════════
//  RESOURCES
// ═══════════════════════════════════════════

const DEFAULT_SHOW = 2;
let allResources   = [];
let isExpanded     = false;

function renderResources(resources) {
  allResources = resources.filter(r => r.visible !== false);

  const grid      = document.getElementById('resourceGrid');
  const countEl   = document.getElementById('resourceCount');
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  const hintBtn   = document.getElementById('clickHintBtn');

  // Count
  if (countEl) {
    countEl.textContent = allResources.length > 0
      ? `${allResources.length} video${allResources.length !== 1 ? 's' : ''}`
      : '';
  }

  // ── Empty state ──
  if (allResources.length === 0) {
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="#ccc" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          <p>No resources yet</p>
          <span>Check back soon!</span>
        </div>`;
    }
    if (hintBtn)   hintBtn.style.display   = 'none';
    if (seeMoreBtn) seeMoreBtn.style.display = 'none';
    return;
  }

  // ── Has resources ──
  if (hintBtn) hintBtn.style.display = 'flex';
  if (grid) drawCards(grid);

  // See More btn
  if (seeMoreBtn) {
    if (allResources.length > DEFAULT_SHOW) {
      seeMoreBtn.style.display = 'flex';
      updateSeeMoreBtn(seeMoreBtn);

      // Fresh listener
      const freshBtn = seeMoreBtn.cloneNode(true);
      seeMoreBtn.parentNode.replaceChild(freshBtn, seeMoreBtn);

      freshBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (grid) drawCards(grid);
        updateSeeMoreBtn(freshBtn);
      });
    } else {
      seeMoreBtn.style.display = 'none';
    }
  }
}

function drawCards(grid) {
  const count  = isExpanded ? allResources.length : DEFAULT_SHOW;
  const toShow = allResources.slice(0, count);

  grid.innerHTML = toShow.map(r => `
    <div class="resource-card"
         data-link="${r.link || ''}"
         data-title="${(r.title || '').replace(/"/g, '&quot;')}">
      <img
        src="${r.thumbnail || ''}"
        alt="${r.title || 'Resource'}"
        loading="lazy"
        onerror="this.style.background='#eee'"
      />
      <div class="card-overlay">
        ${r.tag
          ? `<span class="card-tag">${r.tag}</span>`
          : `<span></span>`}
        <span class="card-title">${r.title || ''}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', () => {
      openPopup(card.dataset.link, card.dataset.title);
    });
  });
}

function updateSeeMoreBtn(btn) {
  const span = btn.querySelector('span');
  const svg  = btn.querySelector('svg');
  if (isExpanded) {
    if (span) span.textContent    = 'See less';
    if (svg)  svg.style.transform = 'rotate(180deg)';
  } else {
    if (span) span.textContent    = 'See more';
    if (svg)  svg.style.transform = 'rotate(0deg)';
  }
}

// ═══════════════════════════════════════════
//  PROJECTS
// ═══════════════════════════════════════════

function renderProjects(projects) {
  const list = document.getElementById('buildingList');
  if (!list) return;

  const visible = projects.filter(p => p.visible !== false);

  // ── Empty state ──
  if (visible.length === 0) {
    list.innerHTML = `
      <div class="empty-state-projects">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="#ccc" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 12h6M12 9v6"/>
        </svg>
        <p>Nothing here yet</p>
        <span>Projects coming soon!</span>
      </div>`;
    return;
  }

  list.innerHTML = visible.map(p => {
    const hasLink = p.link && p.link.trim() !== '';
    return `
      <a class="building-item"
         href="${hasLink ? p.link.trim() : '#'}"
         ${hasLink
           ? 'target="_blank" rel="noopener noreferrer"'
           : 'onclick="event.preventDefault()"'}>

        <div class="building-icon">
          <img
            src="${p.icon || ''}"
            alt="${p.name || ''}"
            loading="lazy"
            onerror="this.parentElement.style.background='#f0f0f0'"
          />
        </div>

        <div class="building-info">
          <div class="building-info-top">
            <span class="building-name">${p.name || ''}</span>
            ${renderTag(p.tag)}
          </div>
          <div class="building-desc">${p.description || ''}</div>
        </div>

        <svg class="building-arrow" width="18" height="18"
             viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </a>
    `;
  }).join('');
}

function renderTag(tag) {
  if (!tag) return '';
  const map = {
    'COMING SOON': 'tag-coming',
    'LIVE':        'tag-live',
    'LATEST':      'tag-latest'
  };
  const cls = map[tag.toUpperCase()] || 'tag-latest';
  return `<span class="tag ${cls}">${tag}</span>`;
}

// ═══════════════════════════════════════════
//  POPUP
// ═══════════════════════════════════════════

function setupPopup() {
  const overlay  = document.getElementById('popupOverlay');
  const closeBtn = document.getElementById('popupClose');

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closePopup();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePopup();
  });
}

function openPopup(link, title) {
  const overlay   = document.getElementById('popupOverlay');
  const popupLink = document.getElementById('popupLink');
  const label     = document.querySelector('.popup-label');

  if (label)     label.textContent = title
                   ? `Link for: ${title}`
                   : 'Link for this video';
  if (popupLink) popupLink.href = link || '#';
  if (overlay)   overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
