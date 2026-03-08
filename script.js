const issuesGrid = document.getElementById('issues-grid');
const issueCount = document.getElementById('issue-count');
const loadingSpinner = document.getElementById('spinner');
const searchInput = document.getElementById('search-input');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
let allIssues = [];
let currentTab = 'all';
let searchTimeout = null;



// ========== LOADING HELPERS ==========
function showLoading() {
  loadingSpinner.style.display = 'flex';
  issuesGrid.innerHTML = '';
}

function hideLoading() {
  loadingSpinner.style.display = 'none';
}

// ========== SET ACTIVE TAB ==========
function setActiveTab(activeTab) {
  const allTabBtns = document.querySelectorAll('.tab-btn');
  allTabBtns.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-ghost', 'text-gray-500');
  });
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
  activeBtn.classList.add('btn-primary');
  activeBtn.classList.remove('btn-ghost', 'text-gray-500');
}

// ========== SWITCH TAB ==========
function switchTab(tab) {
  currentTab = tab;
  setActiveTab(tab);
  const input = searchInput.value.trim();
  if (input === '') {
    displayAllIssues(getFiltered());
  } else {
    searchIssues(input);
  }
}


// ========== API 1: LOAD ALL ISSUES ==========
async function loadAllIssues() {
  showLoading();
  const res = await fetch(
    'https://phi-lab-server.vercel.app/api/v1/lab/issues',
  );
  const data = await res.json();
  allIssues = data.issues;
  console.log(allIssues)
  displayAllIssues(getFiltered());
  hideLoading();
}

// ========== API 2: SEARCH ISSUES ==========
async function searchIssues(query) {
  showLoading();
  const res = await fetch(
    `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  const results = data.issues;
  console.log(results)
  if (currentTab === 'all') {
    displayAllIssues(results);
  } else {
    displayAllIssues(results.filter(issue => getStatus(issue) === currentTab));
  }
  hideLoading();
}

// ========== API 3: SINGLE ISSUE ==========
async function loadSingleIssue(id) {
  modalBox.innerHTML = `
    <div class="p-10 flex flex-col items-center justify-center gap-3">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-sm text-gray-400">Loading issue details...</p>
    </div>`;
  modalOverlay.classList.add('modal-open');
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const res = await fetch(
    `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
  );
  const data = await res.json();
  const issue = data.issues;
  renderModal(issue);
  console.log(issue)
}

// ========== HANDLE SEARCH ==========
function handleSearch() {
  const input = searchInput.value.trim();
  clearTimeout(searchTimeout);

  if (input === '') {
    displayAllIssues(getFiltered());
    return;
  }

  // 400ms debounce — user টাইপ করা থামালে তারপর API call
  searchTimeout = setTimeout(() => {
    searchIssues(input);
  }, 400);
}

// ========== GET FILTERED ==========
function getFiltered() {
  if (currentTab === 'all') return allIssues;
  return allIssues.filter(issue => getStatus(issue) === currentTab);
}


// ========== DISPLAY ALL ISSUES ==========
function displayAllIssues(issues) {
  issuesGrid.innerHTML = '';
  issueCount.textContent = `${issues.length} Issue${issues.length !== 1 ? 's' : ''}`;

  if (!issues || issues.length === 0) {
    issuesGrid.innerHTML = `
      <div class="col-span-4 text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-base font-medium">No issues found.</p>
      </div>`;
    return;
  }

  issues.forEach((issue, index) => {
    const status = getStatus(issue);
    const priority = getPriority(issue);
    const labels = getLabels(issue);
    const borderTop =
      status === 'open' ? 'border-t-green-700' : 'border-t-purple-700';
    const priorityClass = getPriorityClass(priority);
    const statusClass = getStatusClass(status);
    const borderColor =
      status === 'open' ? 'border-green-500/15' : 'border-purple-500/15';

    const div = document.createElement('div');
    div.className = `bg-white rounded-xl border ${borderColor} border-t-4 ${borderTop} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden`;
    div.style.animation = 'fadeIn 0.3s ease forwards';
    div.style.animationDelay = `${index * 30}ms`;
    div.style.opacity = '0';
    div.onclick = () => loadSingleIssue(issue.id);

    div.innerHTML = `
      <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          
          <span class="text-[11px] font-semibold p-2 rounded-full ${statusClass}">
        ${
          status == 'open'
            ? `<img src="assets/Open-Status.png" alt="">`
            : `<img src="assets/Closed- Status .png" alt="">`
        }
      </span>
      <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${priorityClass}">${priority}</span>
        </div>
        <h3 class="text-sm font-bold text-gray-900 leading-snug line-clamp-2">${issue.title || 'Untitled Issue'}</h3>
        <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">${issue.body || issue.description || 'No description provided.'}</p>
        ${labels.length ? `<div class="flex flex-wrap gap-1">${getLabelsHtml(labels)}</div>` : ''}
        ${issue.category ? `<span class="self-start text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">${issue.category}</span>` : ''}
        <div class="border-t border-gray-100 pt-3 flex flex-col items-start gap-2  text-[11px] text-gray-400">
          <span>#${issue.id || '?'} by <strong class="text-gray-600">${issue.author || 'Unknown'}</strong></span>
          <span>${fmtDate(issue.createdAt || issue.created_at)}</span>
        </div>
      </div>`;

    issuesGrid.appendChild(div);
  });
}


// ========== RENDER MODAL ==========
function renderModal(issue) {
  const status = getStatus(issue);
  const priority = getPriority(issue);
  const labels = getLabels(issue);
  const author = issue.author || issue.user?.login || 'Unknown';
  const statusClass = getStatusClass(status);
  const priorityClass = getPriorityClass(priority);

  const div = document.createElement('div');
  div.innerHTML = `
    <div class="p-6">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}">${capitalize(status)}</span>
            <span class="text-xs text-gray-400">by <strong class="text-gray-700">${author}</strong> · ${fmtDate(issue.createdAt || issue.created_at)}</span>
          </div>
          <h2 class="text-lg font-bold text-gray-900">${issue.title || 'Untitled Issue'}</h2>
        </div>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-700 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      ${labels.length ? `<div class="flex flex-wrap gap-1.5 mb-5">${getLabelsHtml(labels)}</div>` : ''}
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
        <p class="text-sm text-gray-700 leading-relaxed">${issue.body || issue.description || 'No description.'}</p>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Assignee</p>
          <p class="text-sm font-bold text-gray-800">${issue.assignee || author}</p>
        </div>
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Priority</p>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full ${priorityClass}">${priority}</span>
        </div>
        ${
          issue.category
            ? `
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Category</p>
          <p class="text-sm font-bold text-gray-800">${issue.category}</p>
        </div>`
            : ''
        }
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Issue</p>
          <p class="text-sm font-bold text-gray-800">#${issue.id || '?'}</p>
        </div>
      </div>
      <div class="flex justify-end">
        <button onclick="closeModal()" class="btn btn-ghost btn-sm">Close</button>
      </div>
    </div>`;

  modalBox.innerHTML = '';
  modalBox.appendChild(div);
}

// ========== CLOSE MODAL ==========
function closeModal() {
  modalOverlay.classList.remove('modal-open');
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// modal এর বাইরে click করলে বন্ধ হবে
modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) closeModal();
});

// Escape চাপলে modal বন্ধ হবে
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// ========== SHOW ERROR ==========
function showError() {
  issuesGrid.innerHTML = `
    <div class="col-span-4 text-center py-16 text-gray-400">
      <div class="text-5xl mb-4">⚠️</div>
      <p class="text-lg font-semibold text-red-500 mb-1">Failed to load issues</p>
      <p class="text-sm">Please check your connection and reload.</p>
    </div>`;
}

// ========== HELPER FUNCTIONS ==========

function getStatus(issue) {
  const s = (issue.status || issue.state || '').toLowerCase();
  return s === 'closed' ? 'closed' : 'open';
}

function getPriority(issue) {
  const p = (issue.priority || '').toLowerCase();
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
}

function getLabels(issue) {
  if (Array.isArray(issue.labels)) {
    return issue.labels.map(l => (typeof l === 'string' ? l : l.name));
  }
  if (issue.label) return [issue.label];
  return [];
}

function getLabelsHtml(labels) {
  return labels
    .map(
      l =>
        `<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">${l}</span>`,
    )
    .join('');
}

function getStatusIcon(status) {
  if (status === 'open') {
    return `<span style="width:28px;height:28px;border-radius:50%;border:2px dashed #22c55e;display:flex;align-items:center;justify-content:center;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>
    </span>`;
  }
  return `<span style="width:28px;height:28px;border-radius:50%;background:#f3e8ff;display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
  </span>`;
}

function getStatusClass(status) {
  return status === 'open'
    ? 'bg-green-100 text-green-700'
    : 'bg-purple-100 text-purple-700';
}

function getPriorityClass(priority) {
  if (priority === 'High')
    return 'bg-red-50 text-red-600 border border-red-200';
  if (priority === 'Medium')
    return 'bg-orange-50 text-orange-600 border border-orange-200';
  if (priority === 'Low')
    return 'bg-green-50 text-green-600 border border-green-200';
  return 'bg-gray-100 text-gray-600';
}

function fmtDate(str) {
  if (!str) return 'N/A';
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function capitalize(s) {
  if (!s) return '';
  return s[0].toUpperCase() + s.slice(1);
}

// ========== INIT ==========
loadAllIssues();
searchInput.addEventListener('input', handleSearch);


