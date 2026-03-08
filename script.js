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
    'https://phi-lab-server.vercel.app/api/v1/lab/issue/{id}',
  );
  const data = await res.json();
  const issue = data.issues;
  renderModal(issue);
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
      status === 'open' ? 'border-t-green-500' : 'border-t-purple-500';
    const priorityClass = getPriorityClass(priority);
    const statusClass = getStatusClass(status);
    const borderColor =
      status === 'open' ? 'border-green-500/50' : 'border-purple-500/10';

    const div = document.createElement('div');
    div.className = `bg-white rounded-xl border ${borderColor} border-t-4 ${borderTop} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden`;
    div.style.animation = 'fadeIn 0.3s ease forwards';
    div.style.animationDelay = `${index * 30}ms`;
    div.style.opacity = '0';
    div.onclick = () => loadSingleIssue(issue.id);

    div.innerHTML = `
      <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${priorityClass}">${priority}</span>
          <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusClass}">${capitalize(status)}</span>
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


displayAllIssues()