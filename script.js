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
  allIssues = Array.isArray(data) ? data : data.issues || data.data || [];
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
  const results = Array.isArray(data) ? data : data.issues || data.data || [];
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
  const issue = data.id ? data : data.issue || data.data || data;
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
