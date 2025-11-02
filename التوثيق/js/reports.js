/* ========================================
   📈 التقارير - نظام ديواني
   ======================================== */

// ===== دوال التقارير =====

/**
 * تغيير نوع التقرير
 */
function changeReportType() {
    const reportType = document.getElementById('reportType')?.value;
    
    // إخفاء/إظهار الفلاتر حسب نوع التقرير
    const itemFilterDiv = document.getElementById('reportItemFilter');
    if (itemFilterDiv) {
        itemFilterDiv.style.display = (reportType === 'itemSales' || reportType === 'itemPurchases') ? 'block' : 'none';
    }
}

/**
 * تحديث فلتر الأصناف في التقارير
 */
function updateReportItemFilter() {
    const itemSelect = document.getElementById('reportItemId');
    if (itemSelect && typeof items !== 'undefined') {
        itemSelect.innerHTML = '<option value="">-- جميع الأصناف --</option>';
        items.forEach(item => {
            itemSelect.innerHTML += '<option value="' + item.id + '">' + item.name + '</option>';
        });
    }
}

/**
 * إنشاء تقرير
 */
function generateReport() {
    const reportType = document.getElementById('reportType')?.value;
    const dateFrom = document.getElementById('reportFrom')?.value;
    const dateTo = document.getElementById('reportTo')?.value;
    
    if (!reportType || !dateFrom || !dateTo) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى اختيار نوع التقرير والفترة الزمنية', 'warning');
        return;
    }
    
    showLoading('جاري إنشاء التقرير...');
    
    try {
        let reportData = null;
        
        switch (reportType) {
            case 'sales':
                reportData = generateSalesReport(dateFrom, dateTo);
                break;
            case 'purchases':
                reportData = generatePurchasesReport(dateFrom, dateTo);
                break;
            case 'expenses':
                reportData = generateExpensesReport(dateFrom, dateTo);
                break;
            case 'revenues':
                reportData = generateRevenuesReport(dateFrom, dateTo);
                break;
            case 'profit':
                reportData = generateProfitReport(dateFrom, dateTo);
                break;
            case 'itemSales':
                const itemId = parseInt(document.getElementById('reportItemId')?.value);
                reportData = generateItemSalesReport(dateFrom, dateTo, itemId);
                break;
            case 'itemPurchases':
                const purchaseItemId = parseInt(document.getElementById('reportItemId')?.value);
                reportData = generateItemPurchasesReport(dateFrom, dateTo, purchaseItemId);
                break;
            default:
                hideLoading();
                showNotification('❌ خطأ', 'نوع التقرير غير صحيح', 'error');
                return;
        }
        
        hideLoading();
        displayReport(reportData);
    } catch (error) {
        hideLoading();
        logError('Generate Report', error);
    }
}

/**
 * تقرير المبيعات
 */
function generateSalesReport(dateFrom, dateTo) {
    const filteredSales = sales.filter(sale => 
        sale.date >= dateFrom && sale.date <= dateTo
    );
    
    const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const paid = filteredSales.reduce((sum, sale) => sum + sale.paidAmount, 0);
    const remaining = filteredSales.reduce((sum, sale) => sum + sale.remainingAmount, 0);
    
    return {
        title: 'تقرير المبيعات',
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد الفواتير': filteredSales.length,
            'إجمالي المبيعات': formatCurrency(total),
            'المبلغ المدفوع': formatCurrency(paid),
            'المبلغ المتبقي': formatCurrency(remaining)
        },
        data: filteredSales
    };
}

/**
 * تقرير المشتريات
 */
function generatePurchasesReport(dateFrom, dateTo) {
    const filteredPurchases = purchases.filter(purchase => 
        purchase.date >= dateFrom && purchase.date <= dateTo
    );
    
    const total = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const paid = filteredPurchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0);
    const remaining = filteredPurchases.reduce((sum, purchase) => sum + purchase.remainingAmount, 0);
    
    return {
        title: 'تقرير المشتريات',
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد الفواتير': filteredPurchases.length,
            'إجمالي المشتريات': formatCurrency(total),
            'المبلغ المدفوع': formatCurrency(paid),
            'المبلغ المتبقي': formatCurrency(remaining)
        },
        data: filteredPurchases
    };
}

/**
 * تقرير المصروفات
 */
function generateExpensesReport(dateFrom, dateTo) {
    const filteredExpenses = expenses.filter(expense => 
        expense.date >= dateFrom && expense.date <= dateTo
    );
    
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
        title: 'تقرير المصروفات',
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد المصروفات': filteredExpenses.length,
            'إجمالي المصروفات': formatCurrency(total)
        },
        data: filteredExpenses
    };
}

/**
 * تقرير الإيرادات
 */
function generateRevenuesReport(dateFrom, dateTo) {
    const filteredRevenues = revenues.filter(revenue => 
        revenue.date >= dateFrom && revenue.date <= dateTo
    );
    
    const total = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    
    return {
        title: 'تقرير الإيرادات',
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد الإيرادات': filteredRevenues.length,
            'إجمالي الإيرادات': formatCurrency(total)
        },
        data: filteredRevenues
    };
}

/**
 * تقرير الأرباح
 */
function generateProfitReport(dateFrom, dateTo) {
    const filteredSales = sales.filter(sale => sale.date >= dateFrom && sale.date <= dateTo);
    const filteredPurchases = purchases.filter(purchase => purchase.date >= dateFrom && purchase.date <= dateTo);
    const filteredExpenses = expenses.filter(expense => expense.date >= dateFrom && expense.date <= dateTo);
    const filteredRevenues = revenues.filter(revenue => revenue.date >= dateFrom && revenue.date <= dateTo);
    
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalRevenues = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    
    const netProfit = totalSales - totalPurchases - totalExpenses + totalRevenues;
    
    return {
        title: 'تقرير الأرباح والخسائر',
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'إجمالي المبيعات': formatCurrency(totalSales),
            'إجمالي المشتريات': formatCurrency(totalPurchases),
            'إجمالي المصروفات': formatCurrency(totalExpenses),
            'إجمالي الإيرادات': formatCurrency(totalRevenues),
            'صافي الربح': formatCurrency(netProfit)
        },
        data: null
    };
}

/**
 * تقرير مبيعات صنف
 */
function generateItemSalesReport(dateFrom, dateTo, itemId) {
    let filteredSales = sales.filter(sale => sale.date >= dateFrom && sale.date <= dateTo);
    
    if (itemId) {
        filteredSales = filteredSales.filter(sale => 
            sale.items.some(item => item.id === itemId)
        );
    }
    
    const itemName = itemId ? (items.find(i => i.id === itemId)?.name || 'غير معروف') : 'جميع الأصناف';
    
    return {
        title: 'تقرير مبيعات الصنف: ' + itemName,
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد الفواتير': filteredSales.length
        },
        data: filteredSales
    };
}

/**
 * تقرير مشتريات صنف
 */
function generateItemPurchasesReport(dateFrom, dateTo, itemId) {
    let filteredPurchases = purchases.filter(purchase => purchase.date >= dateFrom && purchase.date <= dateTo);
    
    if (itemId) {
        filteredPurchases = filteredPurchases.filter(purchase => 
            purchase.items.some(item => item.id === itemId)
        );
    }
    
    const itemName = itemId ? (items.find(i => i.id === itemId)?.name || 'غير معروف') : 'جميع الأصناف';
    
    return {
        title: 'تقرير مشتريات الصنف: ' + itemName,
        period: 'من ' + formatDate(dateFrom) + ' إلى ' + formatDate(dateTo),
        summary: {
            'عدد الفواتير': filteredPurchases.length
        },
        data: filteredPurchases
    };
}

/**
 * عرض التقرير
 */
function displayReport(reportData) {
    const summaryDiv = document.getElementById('reportSummary');
    const resultsDiv = document.getElementById('reportResults');
    
    if (!summaryDiv || !resultsDiv) return;
    
    // عرض الملخص
    let summaryHTML = '<h3>' + reportData.title + '</h3>';
    summaryHTML += '<p class="report-period">' + reportData.period + '</p>';
    summaryHTML += '<div class="report-summary-grid">';
    
    for (const key in reportData.summary) {
        summaryHTML += '<div class="summary-item">';
        summaryHTML += '<div class="summary-label">' + key + '</div>';
        summaryHTML += '<div class="summary-value">' + reportData.summary[key] + '</div>';
        summaryHTML += '</div>';
    }
    
    summaryHTML += '</div>';
    summaryDiv.innerHTML = summaryHTML;
    
    // عرض البيانات
    if (reportData.data && reportData.data.length > 0) {
        resultsDiv.innerHTML = '<p>تم إنشاء التقرير بنجاح. يحتوي على ' + reportData.data.length + ' سجل.</p>';
    } else {
        resultsDiv.innerHTML = '<p>لا توجد بيانات للفترة المحددة.</p>';
    }
    
    showNotification('✅ نجح', 'تم إنشاء التقرير بنجاح', 'success');
}

/**
 * تصدير التقرير إلى Excel
 */
function exportReportToExcel() {
    showNotification('ℹ️ قريباً', 'ميزة التصدير قيد التطوير', 'info');
}

/**
 * طباعة التقرير
 */
function printReport() {
    window.print();
}

debugLog('✅ تم تحميل وحدة التقارير');
