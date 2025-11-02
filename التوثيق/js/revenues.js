/* ========================================
   💰 إدارة الإيرادات - نظام ديواني
   ======================================== */

// ===== متغيرات الإيرادات =====
if (typeof editingRevenueId === 'undefined') var editingRevenueId = null;

// ===== دوال إضافة الإيرادات =====

/**
 * إضافة إيراد جديد
 */
async function addRevenue() {
    const date = document.getElementById('revenueDate')?.value;
    const description = document.getElementById('revenueDescription')?.value.trim();
    const amount = parseFloat(document.getElementById('revenueAmount')?.value);
    const category = document.getElementById('revenueCategory')?.value;
    const notes = document.getElementById('revenueNotes')?.value.trim();

    // التحقق من المدخلات
    if (!date || !description || !amount || amount <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة', 'warning');
        return;
    }

    showLoading('جاري إضافة الإيراد...');

    try {
        const revenue = {
            id: Date.now(),
            date: date,
            description: description,
            amount: amount,
            category: category || 'أخرى',
            notes: notes || ''
        };

        revenues.push(revenue);
        const success = await saveToFirebase('revenues', revenues);
        
        hideLoading();
        
        if (success) {
            clearRevenueForm();
            renderRevenues();
            if (typeof updateRevenueStats === 'function') updateRevenueStats();
            if (typeof updateDashboard === 'function') updateDashboard();
            showNotification('✅ نجاح', 'تم إضافة الإيراد بنجاح!', 'success');
        } else {
            revenues.pop();
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Add Revenue', error);
    }
}

// ===== دوال عرض الإيرادات =====

/**
 * عرض قائمة الإيرادات
 */
function renderRevenues() {
    const tbody = document.getElementById('revenuesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredRevenues = [...revenues];
    const searchText = document.getElementById('searchRevenues')?.value || '';
    
    if (searchText) {
        filteredRevenues = filteredRevenues.filter(revenue => 
            revenue.description.toLowerCase().includes(searchText.toLowerCase()) ||
            revenue.category.toLowerCase().includes(searchText.toLowerCase()) ||
            revenue.date.includes(searchText)
        );
    }
    
    if (filteredRevenues.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }
    
    filteredRevenues.forEach(revenue => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${revenue.date}</td>
            <td>${revenue.description}</td>
            <td>${revenue.category}</td>
            <td>${formatCurrency(revenue.amount)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-warning" onclick="editRevenue(${revenue.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteRevenue(${revenue.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال التعديل =====

/**
 * تعديل إيراد
 * @param {number} id - معرف الإيراد
 */
function editRevenue(id) {
    const revenue = revenues.find(r => r.id === id);
    if (!revenue) return;
    
    document.getElementById('revenueDate').value = revenue.date;
    document.getElementById('revenueDescription').value = revenue.description;
    document.getElementById('revenueAmount').value = revenue.amount;
    document.getElementById('revenueCategory').value = revenue.category;
    document.getElementById('revenueNotes').value = revenue.notes || '';
    
    const addButton = document.querySelector('#revenues .btn-primary');
    if (addButton) {
        addButton.textContent = '💾 تحديث الإيراد';
        addButton.onclick = () => updateRevenue(id);
    }
    
    editingRevenueId = id;
}

/**
 * تحديث إيراد
 * @param {number} id - معرف الإيراد
 */
async function updateRevenue(id) {
    const date = document.getElementById('revenueDate')?.value;
    const description = document.getElementById('revenueDescription')?.value.trim();
    const amount = parseFloat(document.getElementById('revenueAmount')?.value);
    const category = document.getElementById('revenueCategory')?.value;
    const notes = document.getElementById('revenueNotes')?.value.trim();

    // التحقق من المدخلات
    if (!date || !description || !amount || amount <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة', 'warning');
        return;
    }

    showLoading('جاري تحديث الإيراد...');

    try {
        const revenueIndex = revenues.findIndex(r => r.id === id);
        if (revenueIndex !== -1) {
            revenues[revenueIndex] = {
                id: id,
                date: date,
                description: description,
                amount: amount,
                category: category || 'أخرى',
                notes: notes || ''
            };
            
            const success = await saveToFirebase('revenues', revenues);
            
            hideLoading();
            
            if (success) {
                clearRevenueForm();
                renderRevenues();
                if (typeof updateRevenueStats === 'function') updateRevenueStats();
                if (typeof updateDashboard === 'function') updateDashboard();
                showNotification('✅ نجاح', 'تم تحديث الإيراد بنجاح!', 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في تحديث البيانات', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        logError('Update Revenue', error);
    }
}

// ===== دوال الحذف =====

/**
 * حذف إيراد
 * @param {number} id - معرف الإيراد
 */
async function deleteRevenue(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ حذف إيراد',
        message: 'هل تريد حذف هذا الإيراد؟',
        type: 'danger',
        confirmText: 'نعم، احذف',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري حذف الإيراد...');
        
        try {
            const revenuesCopy = [...revenues];
            revenues = revenues.filter(r => r.id !== id);
            const success = await saveToFirebase('revenues', revenues);
            
            hideLoading();
            
            if (success) {
                renderRevenues();
                if (typeof updateRevenueStats === 'function') updateRevenueStats();
                if (typeof updateDashboard === 'function') updateDashboard();
                showNotification('✅ نجح', 'تم حذف الإيراد بنجاح', 'success');
            } else {
                revenues = revenuesCopy;
                showNotification('❌ خطأ', 'حدث خطأ في حذف الإيراد', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Revenue', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تفريغ نموذج الإيراد
 */
function clearRevenueForm() {
    const dateField = document.getElementById('revenueDate');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    
    const fields = ['revenueDescription', 'revenueAmount', 'revenueNotes'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const categoryField = document.getElementById('revenueCategory');
    if (categoryField) categoryField.value = '';
    
    const addButton = document.querySelector('#revenues .btn-primary');
    if (addButton) {
        addButton.textContent = '➕ إضافة إيراد';
        addButton.onclick = addRevenue;
    }
    
    editingRevenueId = null;
}

/**
 * تحديث إحصائيات الإيرادات
 */
function updateRevenueStats() {
    const total = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalEl = document.getElementById('totalRevenues');
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

debugLog('✅ تم تحميل وحدة الإيرادات');
