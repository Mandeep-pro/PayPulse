/* ==================== Configuration ==================== */

const API_BASE_URL = "http://localhost:5000/api";
const USD_TO_INR = 83; // Exchange rate: 1 USD = 83 INR
const CURRENCY_SYMBOL = "₹";
const CURRENCY_NAME = "INR";

let allTransactions = [];
let allCategories = [];
let currentEditId = null;

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
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  
  requestAnimationFrame(step);
}

// Observe elements and trigger animations when visible
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
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Add ripple effect to buttons
function addRippleEffect() {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      // Add ripple styles
      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
          }
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.focus();
    }
    
    // Ctrl/Cmd + D for dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      const dashboardBtn = document.querySelector('[data-section="dashboard"]');
      if (dashboardBtn) dashboardBtn.click();
    }
  });
}

// Scroll reveal animation
function setupScrollReveal() {
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.stat-card, .chart-wrapper').forEach(el => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - 50;
      if (isVisible && !el.classList.contains('revealed')) {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  });
}

/* ==================== Loading Spinner ==================== */

function showLoadingSpinner(container) {
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.id = "loading-spinner";
  container.innerHTML = "";
  container.appendChild(spinner);
}

function hideLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.remove();
}

/* ==================== Utility Functions ==================== */

function convertToINR(amount) {
  return amount;
}

function formatCurrency(amount) {
  const inr = convertToINR(amount);
  return `${CURRENCY_SYMBOL}${inr.toFixed(2)}`;
}


document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  
  // Initialize visual effects
  setTimeout(() => {
    addRippleEffect();
    observeElements();
    setupScrollReveal();
    setupKeyboardShortcuts();
  }, 100);
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

/* ==================== Event Listeners ==================== */

function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", handleNavigation);
  });

  // Form submission
  document
    .getElementById("transactionForm")
    .addEventListener("submit", handleAddTransaction);
  document
    .getElementById("editForm")
    .addEventListener("submit", handleUpdateTransaction);

  // Delete button
  document
    .getElementById("deleteBtn")
    .addEventListener("click", handleDeleteTransaction);

  // Filters
  document
    .getElementById("searchInput")
    .addEventListener("input", filterTransactions);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", filterTransactions);

  // Export
  document
    .getElementById("exportBtn")
    .addEventListener("click", handleExportData);

  // Modal close button handled by Bootstrap
}

/* ==================== Navigation ==================== */

function handleNavigation(e) {
  const section = e.target.dataset.section;
  
  // Update active button
  document.querySelectorAll(".nav-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  e.target.classList.add("active");

  // Update active section
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(section).classList.add("active");

  // Refresh charts if switching to analytics or dashboard
  if (section === "dashboard" || section === "analytics") {
    setTimeout(() => {
      renderPieChart();
      renderExpenseChart();
    }, 100);
  }
}

/*  API Calls  */

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const result = await response.json();

    if (result.success) {
      allCategories = result.data;
      populateCategorySelects();
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    const result = await response.json();

    if (result.success) {
      allTransactions = result.data;
      renderTransactionsTable(allTransactions);
      renderRecentTransactions(allTransactions);
      renderPieChart();
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
    showNotification("Error loading transactions", "error");
  }
}

async function loadStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const result = await response.json();

    if (result.success) {
      const stats = result.data;
      updateStatistics(stats);
      updateCategorySummary(stats.by_category);
    }
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

async function addTransaction(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showNotification("Transaction added successfully!", "success");
      await loadTransactions();
      await loadStatistics();
      document.getElementById("transactionForm").reset();
      document.getElementById("transactionDate").valueAsDate = new Date();
      return true;
    } else {
      showNotification(result.error, "error");
      return false;
    }
  } catch (error) {
    console.error("Error adding transaction:", error);
    showNotification("Error adding transaction", "error");
    return false;
  }
}

async function updateTransaction(id, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showNotification("Transaction updated successfully!", "success");
      await loadTransactions();
      await loadStatistics();
      closeModal();
      return true;
    } else {
      showNotification(result.error, "error");
      return false;
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    showNotification("Error updating transaction", "error");
    return false;
  }
}

async function deleteTransaction(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showNotification("Transaction deleted successfully!", "success");
      await loadTransactions();
      await loadStatistics();
      closeModal();
      return true;
    } else {
      showNotification(result.error, "error");
      return false;
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    showNotification("Error deleting transaction", "error");
    return false;
  }
}

/*  Form Handlers */

function handleAddTransaction(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("transactionDate").value;
  const type = document.getElementById("transactionType").value;

  if (!amount || !category || !description || !date) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  const transaction = {
    amount: amount,
    category: category,
    description: description,
    date: new Date(date).toISOString(),
    type: type,
  };

  addTransaction(transaction);
}

function handleUpdateTransaction(e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("editId").value);
  const amount = parseFloat(document.getElementById("editAmount").value);
  const category = document.getElementById("editCategory").value;
  const description = document.getElementById("editDescription").value;
  const date = document.getElementById("editDate").value;
  const type = document.getElementById("editType").value;

  const transaction = {
    amount: amount,
    category: category,
    description: description,
    date: new Date(date).toISOString(),
    type: type,
  };

  updateTransaction(id, transaction);
}

function handleDeleteTransaction() {
  if (confirm("Are you sure you want to delete this transaction?")) {
    deleteTransaction(currentEditId);
  }
}

/* Rendering Functions */

function populateCategorySelects() {
  const categorySelect = document.getElementById("category");
  const editCategorySelect = document.getElementById("editCategory");
  const categoryFilter = document.getElementById("categoryFilter");

  const options = allCategories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");

  categorySelect.innerHTML =
    '<option value="">Select a category</option>' + options;
  editCategorySelect.innerHTML =
    '<option value="">Select a category</option>' + options;

  const filterOptions = allCategories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  categoryFilter.innerHTML =
    '<option value="">All Categories</option>' + filterOptions;
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactionsBody");
  tbody.innerHTML = "";

  if (transactions.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No transactions found</td></tr>';
    return;
  }

  transactions.forEach((trans) => {
    const date = new Date(trans.date).toLocaleDateString();
    const amountClass =
      trans.type === "income" ? "text-success fw-bold" : "text-danger fw-bold";
    const badgeClass = trans.type === "income" ? "bg-success" : "bg-danger";
    const typeBadge = `<span class="badge ${badgeClass}">${trans.type.toUpperCase()}</span>`;
    const inrAmount = convertToINR(trans.amount);
    const amount =
      trans.type === "income"
        ? `+${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`
        : `-${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`;

    const row = `
            <tr>
                <td>${date}</td>
                <td>${trans.description}</td>
                <td>${trans.category}</td>
                <td>${typeBadge}</td>
                <td class="${amountClass}">${amount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openEditModal(${trans.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="openEditModal(${trans.id}, true)">Delete</button>
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

function renderRecentTransactions(transactions, limit = 5) {
  const container = document.getElementById("recentTransactions");
  container.innerHTML = "";

  const recent = transactions.slice(0, limit);

  if (recent.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted py-4">No transactions yet</p>';
    return;
  }

  recent.forEach((trans) => {
    const date = new Date(trans.date).toLocaleDateString();
    const amountClass = trans.type === "income" ? "text-success" : "text-danger";
    const inrAmount = convertToINR(trans.amount);
    const amount =
      trans.type === "income"
        ? `+${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`
        : `-${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`;

    const item = `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <div class="fw-bold">${trans.description}</div>
                    <div class="text-muted small">${trans.category} • ${date}</div>
                </div>
                <div class="fw-bold ${amountClass}">${amount}</div>
            </div>
        `;
    container.innerHTML += item;
  });
}

function updateStatistics(stats) {
  // Add animated counter effects
  const incomeElement = document.getElementById("stat-income");
  const expenseElement = document.getElementById("stat-expense");
  const balanceElement = document.getElementById("stat-balance");
  const countElement = document.getElementById("stat-count");
  
  // Animate each stat with delay for staggered effect
  setTimeout(() => {
    incomeElement.textContent = formatCurrency(stats.total_income);
    incomeElement.style.animation = 'scaleIn 0.6s ease-out';
  }, 50);
  
  setTimeout(() => {
    expenseElement.textContent = formatCurrency(stats.total_expense);
    expenseElement.style.animation = 'scaleIn 0.6s ease-out';
  }, 100);
  
  setTimeout(() => {
    balanceElement.textContent = formatCurrency(stats.balance);
    balanceElement.style.animation = 'scaleIn 0.6s ease-out';
  }, 150);
  
  setTimeout(() => {
    countElement.textContent = stats.transaction_count;
    countElement.style.animation = 'scaleIn 0.6s ease-out';
  }, 200);
}

function updateCategorySummary(byCategory) {
  const container = document.getElementById("categorySummary");
  container.innerHTML = "";

  if (Object.keys(byCategory).length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted">No expense data available</p>';
    return;
  }

  const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);

  Object.entries(byCategory).forEach(([category, amount]) => {
    const percentage = ((amount / total) * 100).toFixed(1);
    const inrAmount = convertToINR(amount);
    const item = `
            <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                <div>
                    <div class="fw-bold">${category}</div>
                    <div class="small text-muted">${percentage}% of expenses</div>
                </div>
                <div class="badge bg-primary">${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}</div>
            </div>
        `;
    container.innerHTML += item;
  });
}

function renderPieChart() {
  const expensesByCategory = {};
  allTransactions.forEach((trans) => {
    if (trans.type === "expense") {
      if (!expensesByCategory[trans.category]) {
        expensesByCategory[trans.category] = 0;
      }
      expensesByCategory[trans.category] += trans.amount;
    }
  });

  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory).map((amt) =>
    convertToINR(amt),
  );

  if (categories.length === 0) {
    document.getElementById("pieChart").innerHTML =
      '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No expense data to display</p>';
    return;
  }

  const data = [
    {
      labels: categories,
      values: amounts,
      type: "pie",
      marker: {
        line: {
          color: "#fff",
          width: 2,
        },
      },
      hovertemplate:
        "<b>%{label}</b><br>" +
        CURRENCY_SYMBOL +
        "%{value:,.2f}<extra></extra>",
      textposition: "inside",
      textinfo: "label+percent",
    },
  ];

  const layout = {
    title: "",
    height: 400,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      color: "#64748b",
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  Plotly.newPlot("pieChart", data, layout, config);
}

function renderExpenseChart() {
  const expensesByCategory = {};
  allTransactions.forEach((trans) => {
    if (trans.type === "expense") {
      if (!expensesByCategory[trans.category]) {
        expensesByCategory[trans.category] = 0;
      }
      expensesByCategory[trans.category] += trans.amount;
    }
  });

  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory).map((amt) =>
    convertToINR(amt),
  );

  if (categories.length === 0) {
    document.getElementById("expenseChart").innerHTML =
      '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No expense data to display</p>';
    return;
  }

  const data = [
    {
      x: categories,
      y: amounts,
      type: "bar",
      marker: {
        color: "#6366f1",
      },
      hovertemplate:
        "<b>%{x}</b><br>" + CURRENCY_SYMBOL + "%{y:,.2f}<extra></extra>",
    },
  ];

  const layout = {
    title: "",
    xaxis: { title: "Category" },
    yaxis: { title: `Amount (${CURRENCY_SYMBOL})` },
    height: 400,
    margin: { l: 50, r: 20, t: 20, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      color: "#64748b",
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  Plotly.newPlot("expenseChart", data, layout, config);
}

/* ==================== Filter Functions ==================== */

function filterTransactions() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  let filtered = allTransactions;

  if (searchTerm) {
    filtered = filtered.filter(
      (trans) =>
        trans.description.toLowerCase().includes(searchTerm) ||
        trans.category.toLowerCase().includes(searchTerm),
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter((trans) => trans.category === categoryFilter);
  }

  renderTransactionsTable(filtered);
}

/* ==================== Modal Functions ==================== */

function openEditModal(id, isDelete = false) {
  const transaction = allTransactions.find((t) => t.id === id);
  if (!transaction) return;

  currentEditId = id;

  document.getElementById("editId").value = transaction.id;
  document.getElementById("editAmount").value = transaction.amount;
  document.getElementById("editCategory").value = transaction.category;
  document.getElementById("editDescription").value = transaction.description;
  document.getElementById("editDate").value = transaction.date.split("T")[0];
  document.getElementById("editType").value = transaction.type;

  // Show Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

function closeModal() {
  const modalElement = document.getElementById("editModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) modal.hide();
  currentEditId = null;
}

/* ==================== Export Function ==================== */

async function handleExportData() {
  try {
    const response = await fetch(`${API_BASE_URL}/export`);
    const result = await response.json();

    if (result.success) {
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `paypulse_export_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showNotification("Data exported successfully!", "success");
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    showNotification("Error exporting data", "error");
  }
}

/*  Utility Functions */

function showNotification(message, type = "info") {
  // Use Bootstrap Toast for notifications
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.className = "position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "11";
    document.body.appendChild(container);
  }
  
  const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-danger" : "alert-info";
  const toastHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show mb-2" role="alert" style="min-width: 300px;">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  const container = document.getElementById("toast-container");
  container.insertAdjacentHTML("beforeend", toastHtml);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    const alerts = container.querySelectorAll(".alert");
    if (alerts.length > 0) {
      const lastAlert = alerts[alerts.length - 1];
      const alert = new bootstrap.Alert(lastAlert);
      alert.close();
    }
  }, 3000);
}

console.log("PayPulse frontend loaded successfully");

// ==================== Smooth Scroll ==================== 

// Smooth scroll to top on page load
window.addEventListener('load', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
