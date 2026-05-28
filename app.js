/* ==================== Configuration & State ==================== */
const API_BASE_URL = "http://localhost:5000/api";
const CURRENCY_SYMBOL = "₹";
let allTransactions = [], allCategories = [], currentEditId = null;

/* ==================== Enhanced Visual Effects ==================== */

// Smooth number counter animation
function animateValue(element, start, end, duration = 1000) {
  let startTimestamp = null;
  const originalText = element.textContent;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = originalText.replace(/[\d.,-]+/g, value.toLocaleString());
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Intersection Observer for scroll reveal animations
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.stat-card, .chart-wrapper, .category-item').forEach(el => {
    Object.assign(el.style, { opacity: '0', transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' });
    observer.observe(el);
  });
}

function addRippleEffect() {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      Object.assign(ripple.style, {
        width: `${size}px`, height: `${size}px`,
        left: `${e.clientX - rect.left - size / 2}px`, top: `${e.clientY - rect.top - size / 2}px`
      });
      ripple.classList.add('ripple');
      
      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `.ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.6); transform: scale(0); animation: ripple-animation 0.6s ease-out; pointer-events: none; } @keyframes ripple-animation { to { transform: scale(4); opacity: 0; } }`;
        document.head.appendChild(style);
      }
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('searchInput')?.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); document.querySelector('[data-section="dashboard"]')?.click(); }
  });
}

function setupScrollReveal() {
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.stat-card, .chart-wrapper').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 50 && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
        Object.assign(el.style, { opacity: '1', transform: 'translateY(0)' });
      }
    });
  });
}

/* ==================== Loading & Utilities ==================== */
function showLoadingSpinner(container) {
  container.innerHTML = '<div class="spinner" id="loading-spinner"></div>';
}
function hideLoadingSpinner() { document.getElementById("loading-spinner")?.remove(); }
function formatCurrency(amount) { return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`; }

/* ==================== Initialization & Navigation ==================== */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setTimeout(() => { addRippleEffect(); observeElements(); setupScrollReveal(); setupKeyboardShortcuts(); }, 100);
});

async function initializeApp() {
  document.getElementById("transactionDate").valueAsDate = new Date();
  document.getElementById("editDate").valueAsDate = new Date();
  await loadCategories();
  await loadTransactions();
  await loadStatistics();
  setupEventListeners();
  console.log("PayPulse initialized successfully");
}

function setupEventListeners() {
  document.querySelectorAll(".nav-button").forEach(btn => btn.addEventListener("click", handleNavigation));
  document.getElementById("transactionForm").addEventListener("submit", handleAddTransaction);
  document.getElementById("editForm").addEventListener("submit", handleUpdateTransaction);
  document.getElementById("deleteBtn").addEventListener("click", handleDeleteTransaction);
  document.getElementById("searchInput").addEventListener("input", filterTransactions);
  document.getElementById("categoryFilter").addEventListener("change", filterTransactions);
  document.getElementById("exportBtn").addEventListener("click", handleExportData);
}

function handleNavigation(e) {
  const section = e.target.dataset.section;
  document.querySelectorAll(".nav-button").forEach(btn => btn.classList.toggle("active", btn === e.target));
  document.querySelectorAll(".section").forEach(sec => sec.classList.toggle("active", sec.id === section));

  if (section === "dashboard" || section === "analytics") {
    setTimeout(() => { renderCharts(); }, 100);
  }
}

/* ==================== API Service Layer ==================== */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    showNotification("Server communication failed", "error");
    return { success: false };
  }
}

async function loadCategories() {
  const res = await apiRequest('/categories');
  if (res.success) { allCategories = res.data; populateCategorySelects(); }
}

async function loadTransactions() {
  const res = await apiRequest('/transactions');
  if (res.success) {
    allTransactions = res.data;
    renderTransactionsTable(allTransactions);
    renderRecentTransactions(allTransactions);
    renderCharts();
  }
}

async function loadStatistics() {
  const res = await apiRequest('/statistics');
  if (res.success) { updateStatistics(res.data); updateCategorySummary(res.data.by_category); }
}

async function handleAddTransaction(e) {
  e.preventDefault();
  const transaction = {
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    date: new Date(document.getElementById("transactionDate").value).toISOString(),
    type: document.getElementById("transactionType").value
  };

  if (!transaction.amount || !transaction.category || !transaction.description) {
    return showNotification("Please fill in all required fields", "error");
  }

  const res = await apiRequest('/transactions', {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transaction)
  });
  if (res.success) {
    showNotification("Transaction added successfully!", "success");
    await loadTransactions(); await loadStatistics();
    document.getElementById("transactionForm").reset();
    document.getElementById("transactionDate").valueAsDate = new Date();
  }
}

async function handleUpdateTransaction(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById("editId").value);
  const transaction = {
    amount: parseFloat(document.getElementById("editAmount").value),
    category: document.getElementById("editCategory").value,
    description: document.getElementById("editDescription").value,
    date: new Date(document.getElementById("editDate").value).toISOString(),
    type: document.getElementById("editType").value
  };

  const res = await apiRequest(`/transactions/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transaction)
  });
  if (res.success) { showNotification("Transaction updated successfully!", "success"); await loadTransactions(); await loadStatistics(); closeModal(); }
}

async function handleDeleteTransaction() {
  if (confirm("Are you sure you want to delete this transaction?")) {
    const res = await apiRequest(`/transactions/${currentEditId}`, { method: "DELETE" });
    if (res.success) { showNotification("Transaction deleted successfully!", "success"); await loadTransactions(); await loadStatistics(); closeModal(); }
  }
}

/* ==================== UI Rendering Functions ==================== */
function populateCategorySelects() {
  const options = allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  document.getElementById("category").innerHTML = '<option value="">Select a category</option>' + options;
  document.getElementById("editCategory").innerHTML = '<option value="">Select a category</option>' + options;
  document.getElementById("categoryFilter").innerHTML = '<option value="">All Categories</option>' + options;
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactionsBody");
  if (!transactions.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No transactions found</td></tr>';
    return;
  }
  tbody.innerHTML = transactions.map(t => {
    const isInc = t.type === "income";
    return `<tr>
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td>${t.description}</td>
      <td>${t.category}</td>
      <td><span class="badge ${isInc ? 'bg-success' : 'bg-danger'}">${t.type.toUpperCase()}</span></td>
      <td class="${isInc ? 'text-success' : 'text-danger'} fw-bold">${isInc ? '+' : '-'}${formatCurrency(t.amount)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openEditModal(${t.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openEditModal(${t.id}, true)">Delete</button>
      </td>
    </tr>`;
  }).join("");
}

function renderRecentTransactions(transactions, limit = 5) {
  const container = document.getElementById("recentTransactions");
  const recent = transactions.slice(0, limit);
  if (!recent.length) { container.innerHTML = '<p class="text-center text-muted py-4">No transactions yet</p>'; return; }
  
  container.innerHTML = recent.map(t => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div>
            <div class="fw-bold">${t.description}</div>
            <div class="text-muted small">${t.category} • ${new Date(t.date).toLocaleDateString()}</div>
        </div>
        <div class="fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    </div>`).join("");
}

function updateStatistics(stats) {
  const targetMap = { "stat-income": stats.total_income, "stat-expense": stats.total_expense, "stat-balance": stats.balance };
  Object.entries(targetMap).forEach(([id, val], i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { el.textContent = formatCurrency(val); el.style.animation = 'scaleIn 0.6s ease-out'; }
    }, (i + 1) * 50);
  });
  setTimeout(() => {
    const cnt = document.getElementById("stat-count");
    if (cnt) { cnt.textContent = stats.transaction_count; cnt.style.animation = 'scaleIn 0.6s ease-out'; }
  }, 200);
}

function updateCategorySummary(byCategory) {
  const container = document.getElementById("categorySummary");
  if (!Object.keys(byCategory).length) { container.innerHTML = '<p class="text-center text-muted">No expense data available</p>'; return; }
  const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);

  container.innerHTML = Object.entries(byCategory).map(([category, amount]) => `
    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
        <div>
            <div class="fw-bold">${category}</div>
            <div class="small text-muted">${((amount / total) * 100).toFixed(1)}% of expenses</div>
        </div>
        <div class="badge bg-primary">${formatCurrency(amount)}</div>
    </div>`).join("");
}

/* ==================== Chart Visualizations ==================== */
function renderCharts() {
  const expensesByCategory = {};
  allTransactions.forEach(t => {
    if (t.type === "expense") expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });

  const categories = Object.keys(expensesByCategory), amounts = Object.values(expensesByCategory);
  const layoutBase = { height: 400, margin: { l: 40, r: 20, t: 20, b: 50 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { family: "Segoe UI", color: "#64748b" } };
  const config = { responsive: true, displayModeBar: false };

  if (!categories.length) {
    const noDataHtml = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No expense data to display</p>';
    if(document.getElementById("pieChart")) document.getElementById("pieChart").innerHTML = noDataHtml;
    if(document.getElementById("expenseChart")) document.getElementById("expenseChart").innerHTML = noDataHtml;
    return;
  }

  // 1. Pie Chart
  if (document.getElementById("pieChart")) {
    Plotly.newPlot("pieChart", [{ labels: categories, values: amounts, type: "pie", marker: { line: { color: "#fff", width: 2 } }, hovertemplate: `<b>%{label}</b><br>${CURRENCY_SYMBOL}%{value:,.2f}<extra></extra>`, textposition: "inside", textinfo: "label+percent" }], layoutBase, config);
  }
  // 2. Bar Chart
  if (document.getElementById("expenseChart")) {
    Plotly.newPlot("expenseChart", [{ x: categories, y: amounts, type: "bar", marker: { color: "#6366f1" }, hovertemplate: `<b>%{x}</b><br>${CURRENCY_SYMBOL}%{y:,.2f}<extra></extra>` }], { ...layoutBase, xaxis: { title: "Category" }, yaxis: { title: `Amount (${CURRENCY_SYMBOL})` } }, config);
  }
}

/* ==================== Filters & Modal Handlers ==================== */
function filterTransactions() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filterCat = document.getElementById("categoryFilter").value;

  const filtered = allTransactions.filter(t => 
    (!search || t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search)) &&
    (!filterCat || t.category === filterCat)
  );
  renderTransactionsTable(filtered);
}

function openEditModal(id, isDelete = false) {
  const transaction = allTransactions.find(t => t.id === id);
  if (!transaction) return;
  currentEditId = id;

  document.getElementById("editId").value = transaction.id;
  document.getElementById("editAmount").value = transaction.amount;
  document.getElementById("editCategory").value = transaction.category;
  document.getElementById("editDescription").value = transaction.description;
  document.getElementById("editDate").value = transaction.date.split("T")[0];
  document.getElementById("editType").value = transaction.type;

  new bootstrap.Modal(document.getElementById("editModal")).show();
}

function closeModal() {
  const mEl = document.getElementById("editModal");
  bootstrap.Modal.getInstance(mEl)?.hide();
  currentEditId = null;
}

/* ==================== Export & Toast Notification ==================== */
async function handleExportData() {
  const res = await apiRequest('/export');
  if (res.success) {
    const dataBlob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `paypulse_export_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification("Data exported successfully!", "success");
  }
}

function showNotification(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div"); container.id = "toast-container";
    container.className = "position-fixed bottom-0 end-0 p-3"; container.style.zIndex = "11";
    document.body.appendChild(container);
  }
  
  const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-danger" : "alert-info";
  const element = document.createElement("div");
  element.className = `alert ${alertClass} alert-dismissible fade show mb-2`;
  element.style.minWidth = "300px";
  element.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  container.appendChild(element);
  
  setTimeout(() => { element.remove(); }, 3000);
}

window.addEventListener('load', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
