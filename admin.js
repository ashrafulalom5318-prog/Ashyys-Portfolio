// ═══════════════════════════════════════════
//  ADMIN PANEL LOGIC
// ═══════════════════════════════════════════

const ADMIN_PASSWORD = 'Ashyy9395@';
const STORAGE_KEY = 'ashyy_data';

let currentData = {};
let editingType = null;  // 'resource' | 'project'
let editingId   = null;  // null = new item

// ── INIT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (sessionStorage.getItem('ashyy_admin') === 'true') {
    showDashboard();
  }

  // Login
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('ashyy_admin');
    location.reload();
  });

  // Tabs
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Save
  document.getElementById('saveBtn').addEventListener('click', saveAll);

  // Add buttons
  document.getElementById('addResourceBtn').addEventListener('click', () => openModal('resource'));
  document.getElementById('addProjectBtn').addEventListener('click', () => openModal('project'));

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalConfirm').addEventListener('click', confirmModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
});

// ── LOGIN ────────────────────────────────────
function handleLogin() {
  const val = document.getElementById('passwordInput').value;
  const err = document.getElementById('loginError');

  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem('ashyy_admin', 'true');
    showDashboard();
  } else {
    err.textContent = '❌ Wrong password. Try again.';
    document.getElementById('passwordInput').value = '';
    setTimeout(() => err.textContent = '', 3000);
  }
}

// ── SHOW DASHBOARD ──────────────────────────
function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminWrap').style.display = 'flex';

  // Load data
  const saved = localStorage.getItem(STORAGE_KEY);
  currentData = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(SITE_DATA));

  // Render all panels
  renderBannerPanel();
  renderProfilePanel();
  renderResourcesPanel();
  renderProjectsPanel();
}

// ── TABS ─────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

// ── BANNER PANEL ─────────────────────────────
function renderBannerPanel() {
  document.getElementById('bannerText').value = currentData.banner?.text || '';
  document.getElementById('bannerUrl').value  = currentData.banner?.url  || '';
}

function readBannerPanel() {
  currentData.banner = {
    text: document.getElementById('bannerText').value.trim(),
    url:  document.getElementById('bannerUrl').value.trim()
  };
}

// ── PROFILE PANEL ────────────────────────────
function renderProfilePanel() {
  const p = currentData.profile || {};
  document.getElementById('profileName').value    = p.name    || '';
  document.getElementById('profileTagline').value = p.tagline || '';
  document.getElementById('profilePhoto').value   = p.photo   || '';

  // Socials
  const editor = document.getElementById('socialsEditor');
  editor.innerHTML = (p.socials || []).map((s, i) => `
    <div class="social-item">
      <input type="text" value="${s.name || ''}"
             placeholder="Platform" data-social="${i}" data-field="name" />
      <input type="url"  value="${s.url  || ''}"
             placeholder="URL" data-social="${i}" data-field="url" style="flex:2" />
    </div>
  `).join('');
}

function readProfilePanel() {
  currentData.profile = currentData.profile || {};
  currentData.profile.name    = document.getElementById('profileName').value.trim();
  currentData.profile.tagline = document.getElementById('profileTagline').value.trim();
  currentData.profile.photo   = document.getElementById('profilePhoto').value.trim();

  // Read socials
  const inputs = document.querySelectorAll('#socialsEditor [data-social]');
  const socialsMap = {};
  inputs.forEach(inp => {
    const idx   = inp.dataset.social;
    const field = inp.dataset.field;
    if (!socialsMap[idx]) socialsMap[idx] = { ...currentData.profile.socials[idx] };
    socialsMap[idx][field] = inp.value.trim();
  });
  currentData.profile.socials = Object.values(socialsMap);
}

// ── RESOURCES PANEL ──────────────────────────
function renderResourcesPanel() {
  const list = document.getElementById('resourcesList');
  const resources = currentData.resources || [];

  if (resources.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:14px;padding:12px 0">No resources yet. Click + Add Video.</p>';
    return;
  }

  list.innerHTML = resources.map(r => `
    <div class="item-card" data-id="${r.id}">
      <div class="item-card-icon">
        <img src="${r.thumbnail || ''}" alt="" onerror="this.style.display='none'" />
      </div>
      <div class="item-card-info">
        <div class="item-card-name">${r.title || 'Untitled'}</div>
        <div class="item-card-sub">${r.tag || 'No tag'} • ${r.visible !== false ? 'Visible' : 'Hidden'}</div>
      </div>
      <div class="item-card-actions">
        <button class="btn-toggle ${r.visible !== false ? 'on' : ''}"
                onclick="toggleResource(${r.id})">
          ${r.visible !== false ? '👁 Show' : '🙈 Hide'}
        </button>
        <button class="btn-edit" onclick="openModal('resource', ${r.id})">Edit</button>
        <button class="btn-delete" onclick="deleteResource(${r.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function toggleResource(id) {
  const r = currentData.resources.find(x => x.id === id);
  if (r) {
    r.visible = r.visible === false ? true : false;
    renderResourcesPanel();
    markUnsaved();
  }
}

function deleteResource(id) {
  if (!confirm('Delete this resource?')) return;
  currentData.resources = currentData.resources.filter(x => x.id !== id);
  renderResourcesPanel();
  markUnsaved();
}

// ── PROJECTS PANEL ───────────────────────────
function renderProjectsPanel() {
  const list = document.getElementById('projectsList');
  const projects = currentData.projects || [];

  if (projects.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:14px;padding:12px 0">No projects yet. Click + Add Project.</p>';
    return;
  }

  list.innerHTML = projects.map(p => `
    <div class="item-card" data-id="${p.id}">
      <div class="item-card-icon">
        <img src="${p.icon || ''}" alt="" onerror="this.style.display='none'" />
      </div>
      <div class="item-card-info">
        <div class="item-card-name">${p.name || 'Untitled'}</div>
        <div class="item-card-sub">${p.tag || 'No tag'} • ${p.visible !== false ? 'Visible' : 'Hidden'}</div>
      </div>
      <div class="item-card-actions">
        <button class="btn-toggle ${p.visible !== false ? 'on' : ''}"
                onclick="toggleProject(${p.id})">
          ${p.visible !== false ? '👁 Show' : '🙈 Hide'}
        </button>
        <button class="btn-edit" onclick="openModal('project', ${p.id})">Edit</button>
        <button class="btn-delete" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function toggleProject(id) {
  const p = currentData.projects.find(x => x.id === id);
  if (p) {
    p.visible = p.visible === false ? true : false;
    renderProjectsPanel();
    markUnsaved();
  }
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  currentData.projects = currentData.projects.filter(x => x.id !== id);
  renderProjectsPanel();
  markUnsaved();
}

// ── MODAL ─────────────────────────────────────
function openModal(type, id = null) {
  editingType = type;
  editingId   = id;

  const title  = document.getElementById('modalTitle');
  const body   = document.getElementById('modalBody');
  const overlay = document.getElementById('modalOverlay');

  let existing = null;
  if (id !== null) {
    if (type === 'resource') existing = currentData.resources.find(x => x.id === id);
    if (type === 'project')  existing = currentData.projects.find(x => x.id === id);
  }

  if (type === 'resource') {
    title.textContent = id ? 'Edit Resource' : 'Add Resource';
    body.innerHTML = `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="m_title" value="${existing?.title || ''}"
               placeholder="How not to get hacked" />
      </div>
      <div class="form-group">
        <label>Thumbnail Path / URL</label>
        <input type="text" id="m_thumb" value="${existing?.thumbnail || ''}"
               placeholder="assets/images/thumb1.jpg" />
        <small>Upload image to folder then write path, OR paste external URL</small>
      </div>
      <div class="form-group">
        <label>Video Link</label>
        <input type="url" id="m_link" value="${existing?.link || ''}"
               placeholder="https://youtube.com/..." />
      </div>
      <div class="form-group">
        <label>Tag (optional)</label>
        <select id="m_tag">
          <option value="" ${!existing?.tag ? 'selected' : ''}>No Tag</option>
          <option value="LATEST" ${existing?.tag === 'LATEST' ? 'selected' : ''}>LATEST</option>
        </select>
      </div>
    `;
  }

  if (type === 'project') {
    title.textContent = id ? 'Edit Project' : 'Add Project';
    body.innerHTML = `
      <div class="form-group">
        <label>App Name</label>
        <input type="text" id="m_name" value="${existing?.name || ''}"
               placeholder="My App" />
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="m_desc" value="${existing?.description || ''}"
               placeholder="Short description..." />
      </div>
      <div class="form-group">
        <label>Icon Path / URL</label>
        <input type="text" id="m_icon" value="${existing?.icon || ''}"
               placeholder="assets/images/app1.png" />
      </div>
      <div class="form-group">
        <label>Link URL</label>
        <input type="url" id="m_link" value="${existing?.link || ''}"
               placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>Tag</label>
        <select id="m_tag">
          <option value="" ${!existing?.tag ? 'selected' : ''}>No Tag</option>
          <option value="LIVE" ${existing?.tag === 'LIVE' ? 'selected' : ''}>LIVE</option>
          <option value="COMING SOON" ${existing?.tag === 'COMING SOON' ? 'selected' : ''}>COMING SOON</option>
        </select>
      </div>
    `;
  }

  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  editingType = null;
  editingId   = null;
}

function confirmModal() {
  if (editingType === 'resource') saveResource();
  if (editingType === 'project')  saveProject();
  closeModal();
  markUnsaved();
}

function saveResource() {
  const obj = {
    id:        editingId || Date.now(),
    title:     document.getElementById('m_title')?.value.trim() || '',
    thumbnail: document.getElementById('m_thumb')?.value.trim() || '',
    link:      document.getElementById('m_link')?.value.trim()  || '',
    tag:       document.getElementById('m_tag')?.value          || '',
    visible:   true
  };

  if (editingId) {
    const idx = currentData.resources.findIndex(x => x.id === editingId);
    if (idx > -1) {
      currentData.resources[idx] = { ...currentData.resources[idx], ...obj };
    }
  } else {
    currentData.resources.push(obj);
  }

  renderResourcesPanel();
}

function saveProject() {
  const obj = {
    id:          editingId || Date.now(),
    name:        document.getElementById('m_name')?.value.trim() || '',
    description: document.getElementById('m_desc')?.value.trim() || '',
    icon:        document.getElementById('m_icon')?.value.trim() || '',
    link:        document.getElementById('m_link')?.value.trim() || '',
    tag:         document.getElementById('m_tag')?.value         || '',
    visible:     true
  };

  if (editingId) {
    const idx = currentData.projects.findIndex(x => x.id === editingId);
    if (idx > -1) {
      currentData.projects[idx] = { ...currentData.projects[idx], ...obj };
    }
  } else {
    currentData.projects.push(obj);
  }

  renderProjectsPanel();
}

// ── SAVE ALL ─────────────────────────────────
function saveAll() {
  readBannerPanel();
  readProfilePanel();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

  const status = document.getElementById('saveStatus');
  status.textContent = 'Saved successfully!';
  status.classList.add('saved');

  setTimeout(() => {
    status.textContent = 'All changes saved';
    status.classList.remove('saved');
  }, 3000);
}

function markUnsaved() {
  const status = document.getElementById('saveStatus');
  status.textContent = 'Unsaved changes';
  status.classList.remove('saved');
}
