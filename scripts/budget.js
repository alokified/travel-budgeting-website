// Initialize charts
let expenseChart;

// Budget data store
const budgetData = {
    expenses: {},
    total: 0,
    duration: 0,
    travelers: 1
};



// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupEventListeners();
    populateChecklist();
    generateTips();
});

function initializeCharts() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // Expense Distribution Chart
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Distribution',
                    color: '#fff'
                },
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });
}

function setupEventListeners() {
    // Trip details changes
    document.getElementById('duration')?.addEventListener('input', handleInputChange);
    document.getElementById('travelers')?.addEventListener('input', handleInputChange);
    document.getElementById('budgetType')?.addEventListener('change', handleInputChange);
    document.getElementById('addCustomCategory')?.addEventListener('click', addCustomCategory);

    // Auto-calculate category totals
    document.querySelectorAll('.subcategories input').forEach(input => {
        input.addEventListener('input', handleInputChange);
    });

    // Listen for all input changes
    document.getElementById('budgetForm')?.addEventListener('input', handleInputChange);
}

function handleInputChange() {
    calculateBudget();
    updateCharts();
    generateTips();
}

function calculateBudget() {
    const duration = parseInt(document.getElementById('duration')?.value) || 0;
    const travelers = parseInt(document.getElementById('travelers')?.value) || 1;

    budgetData.duration = duration;
    budgetData.travelers = travelers;

    const categories = ['transport', 'accommodation', 'food', 'activities', 'misc'];
    budgetData.expenses = {};
    budgetData.total = 0;

    categories.forEach(category => {
        const inputs = document.querySelectorAll(`[data-category="${category}"]`);
        let categoryTotal = 0;
        inputs.forEach(input => {
            categoryTotal += Number(input.value) || 0;
        });
        budgetData.expenses[category] = categoryTotal;
        budgetData.total += categoryTotal;
    });

    updateBudgetTable();
}

function updateBudgetTable() {
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    Object.entries(budgetData.expenses).forEach(([category, amount]) => {
        const percentage = ((amount / budgetData.total) * 100).toFixed(1) || 0;
        const perDay = budgetData.duration ? (amount / budgetData.duration).toFixed(2) : '0.00';
        const perPerson = budgetData.travelers ? (amount / budgetData.travelers).toFixed(2) : '0.00';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
            <td>₹${amount.toFixed(2)}</td>
            <td>₹${perDay}</td>
            <td>₹${perPerson}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('totalAmount').textContent = `₹${budgetData.total.toFixed(2)}`;
    document.getElementById('perDayAmount').textContent = 
        budgetData.duration ? `₹${(budgetData.total / budgetData.duration).toFixed(2)}` : '₹0.00';
    document.getElementById('perPersonAmount').textContent = 
        budgetData.travelers ? `₹${(budgetData.total / budgetData.travelers).toFixed(2)}` : '₹0.00';
}

function updateCharts() {
    if (!expenseChart) return;
    
    // Update expense chart
    expenseChart.data.labels = Object.keys(budgetData.expenses).map(
        cat => cat.charAt(0).toUpperCase() + cat.slice(1)
    );
    expenseChart.data.datasets[0].data = Object.values(budgetData.expenses);
    expenseChart.update();
}

function addCustomCategory() {
    const categoriesContainer = document.querySelector('.expense-categories');
    if (!categoriesContainer) return;

    const newCategory = document.createElement('div');
    const categoryId = `custom-${Date.now()}`;
    newCategory.className = 'expense-item';
    newCategory.innerHTML = `
        <label>
            <input type="text" placeholder="Category Name" class="category-name">
        </label>
        <input type="number" id="${categoryId}" placeholder="Enter amount" readonly>
        <div class="subcategories">
            <input type="number" placeholder="Item 1" data-category="${categoryId}">
            <input type="number" placeholder="Item 2" data-category="${categoryId}">
            <input type="number" placeholder="Item 3" data-category="${categoryId}">
        </div>
    `;
    categoriesContainer.appendChild(newCategory);
    
    // Add event listeners to new inputs
    newCategory.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', handleInputChange);
    });
}

function generateTips() {
    const tipsList = document.getElementById('tipsList');
    if (!tipsList) return;

    const budgetType = document.getElementById('budgetType')?.value || 'standard';
    const destination = document.getElementById('destination')?.value || 'your destination';
    const duration = budgetData.duration;

    const tips = [
        `For a ${duration}-day trip to ${destination}, consider researching local transportation options`,
        `Book accommodation in advance to secure better rates for your ${budgetType} budget`,
        `Look for local restaurants away from tourist areas for authentic and cheaper meals`,
        `Check if there are any free walking tours or museum days during your stay`,
        `Calculate approximately $${((budgetData.total / duration) || 0).toFixed(2)} per day for your expenses`
    ];

    tipsList.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
}

function populateChecklist() {
    const checklist = document.getElementById('checklistItems');
    if (!checklist) return;

    const items = [
        'Passport and travel documents',
        'Travel insurance',
        'Local currency',
        'Phone and charger',
        'Weather-appropriate clothing',
        'Toiletries',
        'First-aid kit',
        'Travel adapter'
    ];

    checklist.innerHTML = items.map(item => `
        <div class="checklist-item">
            <input type="checkbox" id="${item.replace(/\s+/g, '-')}">
            <label for="${item.replace(/\s+/g, '-')}">${item}</label>
        </div>
    `).join('');
}