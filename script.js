// ═══════════════════════════════════════════
//  MAIN SCRIPT — Renders data to page
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // Override with localStorage data if admin saved anything
  const saved = localStorage.getItem('ashyy_data');
  const data = saved ? JSON.parse(saved) : SITE_DATA;

  renderBanner(data.banner);
  renderProfile(data.profile);
  renderResources(data.resources);
  renderProjects(data.projects);
  setupPopup();
  setupSeeMore();
});

// ── SVG ICONS MAP ──────────────────────────
const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>`,

  x: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`,

  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>`
};

// ── RENDER BANNER ──────────────────────────
function renderBanner(banner) {
  if (!banner) return;
  const link = document.getElementById('topBannerLink');
  const text = document.getElementById('topBannerText');
  if (link) link.href = banner.url || '#';
  if (text) text.textContent = banner.text || 'Visit';
}

// ── RENDER PROFILE ─────────────────────────
function renderProfile(profile) {
  if (!profile) return;

  const nameEl = document.getElementById('profileName');
  const taglineEl = document.getElementById('profileTagline');
  const photoEl = document.getElementById('profilePhoto');
  const socialsEl = document.getElementById('socialLinks');

  if (nameEl) nameEl.textContent = profile.name || '';
  if (taglineEl) taglineEl.textContent = profile.tagline || '';
  if (photoEl && profile.photo) {
    photoEl.src = profile.photo;
    photoEl.alt = profile.name || 'Profile';
  }

  // Render socials
  if (socialsEl && profile.socials) {
    socialsEl.innerHTML = profile.socials
      .map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer"
           class="social-link" title="${s.name}" aria-label="${s.name}">
          ${ICONS[s.icon] || ''}
        </a>
      `).join('');
  }
}

// ── RENDER RESOURCES ───────────────────────
let allResources = [];
let showingCount = 4;

function renderResources(resources) {
  allResources = (resources || []).filter(r => r.visible !== false);

  const grid = document.getElementById('resourceGrid');
  const countEl = document.getElementById('resourceCount');

  // Update count
  if (countEl) {
    countEl.textContent = `${allResources.length} video${allResources.length !== 1 ? 's' : ''}`;
  }

  // If no resources → keep skeleton
  if (allResources.length === 0) {
    // Skeleton stays as is (already in HTML)
    return;
  }

  // Clear skeleton, render cards
  if (grid) {
    grid.innerHTML = '';
    renderResourceCards(grid, showingCount);
  }

  // Show/hide "See more"
  const seeMoreBtn = document.getElementById('seeMoreBtn');
  if (seeMoreBtn) {
    seeMoreBtn.style.display = allResources.length > 4 ? 'flex' : 'none';
  }
}

function renderResourceCards(grid, count) {
  const toShow = allResources.slice(0, count);
  grid.innerHTML = toShow.map(r => `
    <div class="resource-card" data-link="${r.link || '#'}" data-title="${r.title || ''}">
      <img src="${r.thumbnail}" alt="${r.title || 'Resource'}"
           loading="lazy"
           onerror="this.style.background='#eee'" />
      <div class="card-overlay">
        ${r.tag ? `<span class="card-tag">${r.tag}</span>` : '<span></span>'}
        <span class="card-title">${r.title || ''}</span>
      </div>
    </div>
  `).join('');

  // Attach click events
  grid.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', () => {
      openPopup(card.dataset.link, card.dataset.title);
    });
  });
}

// ── SEE MORE ───────────────────────────────
function setupSeeMore() {
  const btn = document.getElementById('seeMoreBtn');
  const grid = document.getElementById('resourceGrid');
  if (!btn) return;

  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;
    showingCount = expanded ? allResources.length : 4;

    if (allResources.length > 0 && grid) {
      renderResourceCards(grid, showingCount);
    }

    btn.classList.toggle('expanded', expanded);
    btn.querySelector('span').textContent = expanded ? 'See less' : 'See more';
  });
}

// ── RENDER PROJECTS ────────────────────────
function renderProjects(projects) {
  const list = document.getElementById('buildingList');
  if (!list) return;

  const visible = (projects || []).filter(p => p.visible !== false);

  if (visible.length === 0) {
    list.innerHTML = `
      <div style="padding:24px;text-align:center;color:#999;font-size:14px;">
        Coming soon...
      </div>`;
    return;
  }

  list.innerHTML = visible.map(p => `
    <a href="${p.link || '#'}" target="_blank" rel="noopener noreferrer"
       class="building-item" ${!p.link ? 'onclick="return false"' : ''}>

      <div class="building-icon">
        <img src="${p.icon}" alt="${p.name}" loading="lazy"
             onerror="this.style.background='#eee';this.style.display='none'" />
      </div>

      <div class="building-info">
        <div class="building-info-top">
          <span class="building-name">${p.name}</span>
          ${renderTag(p.tag)}
        </div>
        <div class="building-desc">${p.description || ''}</div>
      </div>

      <svg class="building-arrow" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7 17L17 7M17 7H7M17 7v10"/>
      </svg>
    </a>
  `).join('');
}

function renderTag(tag) {
  if (!tag) return '';
  const map = {
    'COMING SOON': 'tag-coming',
    'LIVE': 'tag-live',
    'LATEST': 'tag-latest'
  };
  const cls = map[tag.toUpperCase()] || 'tag-latest';
  return `<span class="tag ${cls}">${tag}</span>`;
}

// ── POPUP ──────────────────────────────────
function setupPopup() {
  const overlay = document.getElementById('popupOverlay');
  const closeBtn = document.getElementById('popupClose');

  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  }

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
}

function openPopup(link, title) {
  const overlay = document.getElementById('popupOverlay');
  const popupLink = document.getElementById('popupLink');
  const label = document.getElementById('popupLabel') ||
                document.querySelector('.popup-label');

  if (label) label.textContent = title ? `Link for: ${title}` : 'Link for this video';
  if (popupLink) popupLink.href = link || '#';
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
