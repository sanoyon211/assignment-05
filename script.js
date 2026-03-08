const issuesGrid = document.getElementById('issues-grid');
const issueCount = document.getElementById('issue-count');
const loadingSpinner = document.getElementById('spinner');
const searchInput = document.getElementById('search-input');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
let allIssues = [];
let currentTab = 'all';
let searchTimeout = null;

const API = 'https://phi-lab-server.vercel.app/api/v1/lab';

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
