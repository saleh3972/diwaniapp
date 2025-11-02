/* ========================================
   📊 لوحة التحكم - نظام ديواني
   ======================================== */

// ===== دوال تحديث لوحة التحكم =====

/**
 * تحديث لوحة التحكم الرئيسية
 */
function updateDashboard() {
    updateDataStats();
    updateFinancialStats();
    updateRecentActivity();
}

/**
 * تحديث إحصائيات البيانات
 */
function updateDataStats() {
    // عدد الأصناف
    const itemsCountEl = document.getElementById('itemsCount');
    if (itemsCountEl && typeof items !== 'undefined') {
        itemsCountEl.textContent = items.length;
    }
    
    // عدد العملاء
    const customersCountEl = document.getElementById('customersCount');
    if (customersCountEl && typeof customers !== 'undefined') {
        customersCountEl.textContent = customers.length;
    }
    
    // عدد الموردين
    const suppliersCountEl = document.getElementById('suppliersCount');
    if (suppliersCountEl && typeof suppliers !== 'undefined') {
        suppliersCountEl.textContent = suppliers.length;
    }
    
    // عدد فواتير المبيعات
    const salesCountEl = document.getElementById('salesCount');
    if (salesCountEl && typeof sales !== 'undefined') {
        salesCountEl.textContent = sales.length;
    }
    
    // عدد فواتير المشتريات
    const purchasesCountEl = document.getElementById('purchasesCount');
    if (purchasesCountEl && typeof purchases !== 'undefined') {
        purchasesCountEl.textContent = purchases.length;
    }
}

/**
 * تحديث الإحصائيات المالية
 */
function updateFinancialStats() {
    // إجمالي المبيعات
    if (typeof sales !== 'undefined') {
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalSalesEl = document.getElementById('totalSales');
        if (totalSalesEl) totalSalesEl.textContent = formatCurrency(totalSales);
    }
    
    // إجمالي المشتريات
    if (typeof purchases !== 'undefined') {
        const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
        const totalPurchasesEl = document.getElementById('totalPurchases');
        if (totalPurchasesEl) totalPurchasesEl.textContent = formatCurrency(totalPurchases);
    }
    
    // إجمالي المصروفات
    if (typeof expenses !== 'undefined') {
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const totalExpensesEl = document.getElementById('totalExpenses');
        if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
    }
    
    // إجمالي الإيرادات
    if (typeof revenues !== 'undefined') {
        const totalRevenues = revenues.reduce((sum, revenue) => sum + (revenue.amount || 0), 0);
        const totalRevenuesEl = document.getElementById('totalRevenues');
        if (totalRevenuesEl) totalRevenuesEl.textContent = formatCurrency(totalRevenues);
    }
    
    // صافي الربح
    if (typeof sales !== 'undefined' && typeof purchases !== 'undefined' && typeof expenses !== 'undefined') {
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalSales - totalPurchases - totalExpenses;
        
        const netProfitEl = document.getElementById('netProfit');
        if (netProfitEl) {
            netProfitEl.textContent = formatCurrency(netProfit);
            netProfitEl.className = netProfit >= 0 ? 'profit-positive' : 'profit-negative';
        }
    }
}

/**
 * تحديث النشاط الأخير
 */
function updateRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    // جمع آخر الأنشطة
    const activities = [];
    
    // آخر المبيعات
    if (typeof sales !== 'undefined' && sales.length > 0) {
        const recentSales = sales.slice(-5).reverse();
        recentSales.forEach(sale => {
            activities.push({
                type: 'sale',
                date: sale.date,
                description: 'فاتورة مبيعات رقم SAL' + (sale.number || '').toString().padStart(3, '0'),
                amount: sale.total,
                icon: '💰'
            });
        });
    }
    
    // آخر المشتريات
    if (typeof purchases !== 'undefined' && purchases.length > 0) {
        const recentPurchases = purchases.slice(-5).reverse();
        recentPurchases.forEach(purchase => {
            activities.push({
                type: 'purchase',
                date: purchase.date,
                description: 'فاتورة مشتريات رقم PUR' + (purchase.number || '').toString().padStart(3, '0'),
                amount: purchase.total,
                icon: '🛒'
            });
        });
    }
    
    // ترتيب حسب التاريخ
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // عرض آخر 10 أنشطة
    const recentActivities = activities.slice(0, 10);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<li>لا توجد أنشطة حديثة</li>';
        return;
    }
    
    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="activity-icon">${activity.icon}</span>
            <span class="activity-description">${activity.description}</span>
            <span class="activity-date">${formatDate(activity.date)}</span>
            <span class="activity-amount">${formatCurrency(activity.amount)}</span>
        `;
        activityList.appendChild(li);
    });
}

/**
 * تحديث إحصائيات المخزون
 */
function updateStockStats() {
    if (typeof items === 'undefined') return;
    
    // الأصناف المنخفضة
    const lowStockItems = items.filter(item => item.stock > 0 && item.stock <= 5);
    const lowStockEl = document.getElementById('lowStockCount');
    if (lowStockEl) lowStockEl.textContent = lowStockItems.length;
    
    // الأصناف النافذة
    const outOfStockItems = items.filter(item => item.stock <= 0);
    const outOfStockEl = document.getElementById('outOfStockCount');
    if (outOfStockEl) outOfStockEl.textContent = outOfStockItems.length;
    
    // إجمالي قيمة المخزون
    const totalStockValue = items.reduce((sum, item) => sum + (item.stock * item.cost), 0);
    const stockValueEl = document.getElementById('totalStockValue');
    if (stockValueEl) stockValueEl.textContent = formatCurrency(totalStockValue);
}

/**
 * تحديث إحصائيات الديون
 */
function updateDebtStats() {
    if (typeof sales === 'undefined') return;
    
    // الديون غير المدفوعة
    const unpaidSales = sales.filter(sale => sale.remainingAmount > 0);
    const unpaidCountEl = document.getElementById('unpaidSalesCount');
    if (unpaidCountEl) unpaidCountEl.textContent = unpaidSales.length;
    
    // إجمالي الديون
    const totalDebt = unpaidSales.reduce((sum, sale) => sum + sale.remainingAmount, 0);
    const totalDebtEl = document.getElementById('totalDebt');
    if (totalDebtEl) totalDebtEl.textContent = formatCurrency(totalDebt);
}

/**
 * تهيئة لوحة التحكم المتقدمة
 */
function initAdvancedDashboard() {
    updateDashboard();
    updateStockStats();
    updateDebtStats();
    
    // تحديث الرسوم البيانية إذا كانت موجودة
    if (typeof renderCharts === 'function') {
        renderCharts();
    }
}

debugLog('✅ تم تحميل وحدة لوحة التحكم');
