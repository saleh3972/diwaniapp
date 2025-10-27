/* ========================================
   💸 إدارة المصروفات - نظام ديواني
   ======================================== */

// ===== متغيرات المصروفات =====
if (typeof editingExpenseId === 'undefined') var editingExpenseId = null;

// ===== دوال إضافة المصروفات =====

/**
 * إضافة مصروف جديد
 */
async function addExpense() {
    const date = document.getElementById('expenseDate')?.value;
    const description = document.getElementById('expenseDescription')?.value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount')?.value);
    const category = document.getElementById('expenseCategory')?.value;
    const notes = document.getElementById('expenseNotes')?.value.trim();

    // التحقق من المدخلات
    if (!date || !description || !amount || amount <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة', 'warning');
        return;
    }

    showLoading('جاري إضافة المصروف...');

    try {
        const expense = {
            id: Date.now(),
            date: date,
            description: description,
            amount: amount,
            category: category || 'أخرى',
            notes: notes || ''
        };

        expenses.push(expense);
        const success = await saveToFirebase('expenses', expenses);
        
        hideLoading();
        
        if (success) {
            clearExpenseForm();
            renderExpenses();
            if (typeof updateExpenseStats === 'function') updateExpenseStats();
            if (typeof updateDashboard === 'function') updateDashboard();
            showNotification('✅ نجاح', 'تم إضافة المصروف بنجاح!', 'success');
        } else {
            expenses.pop();
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Add Expense', error);
    }
}

// ===== دوال عرض المصروفات =====

/**
 * عرض قائمة المصروفات
 */
function renderExpenses() {
    const tbody = document.getElementById('expensesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredExpenses = [...expenses];
    const searchText = document.getElementById('searchExpenses')?.value || '';
    
    if (searchText) {
        filteredExpenses = filteredExpenses.filter(expense => 
            expense.description.toLowerCase().includes(searchText.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
            expense.date.includes(searchText)
        );
    }
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }
    
    filteredExpenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-warning" onclick="editExpense(${expense.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteExpense(${expense.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال التعديل =====

/**
 * تعديل مصروف
 * @param {number} id - معرف المصروف
 */
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseNotes').value = expense.notes || '';
    
    const addButton = document.querySelector('#expenses .btn-primary');
    if (addButton) {
        addButton.textContent = '💾 تحديث المصروف';
        addButton.onclick = () => updateExpense(id);
    }
    
    editingExpenseId = id;
}

/**
 * تحديث مصروف
 * @param {number} id - معرف المصروف
 */
async function updateExpense(id) {
    const date = document.getElementById('expenseDate')?.value;
    const description = document.getElementById('expenseDescription')?.value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount')?.value);
    const category = document.getElementById('expenseCategory')?.value;
    const notes = document.getElementById('expenseNotes')?.value.trim();

    // التحقق من المدخلات
    if (!date || !description || !amount || amount <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة', 'warning');
        return;
    }

    showLoading('جاري تحديث المصروف...');

    try {
        const expenseIndex = expenses.findIndex(e => e.id === id);
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = {
                id: id,
                date: date,
                description: description,
                amount: amount,
                category: category || 'أخرى',
                notes: notes || ''
            };
            
            const success = await saveToFirebase('expenses', expenses);
            
            hideLoading();
            
            if (success) {
                clearExpenseForm();
                renderExpenses();
                if (typeof updateExpenseStats === 'function') updateExpenseStats();
                if (typeof updateDashboard === 'function') updateDashboard();
                showNotification('✅ نجاح', 'تم تحديث المصروف بنجاح!', 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في تحديث البيانات', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        logError('Update Expense', error);
    }
}

// ===== دوال الحذف =====

/**
 * حذف مصروف
 * @param {number} id - معرف المصروف
 */
async function deleteExpense(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ حذف مصروف',
        message: 'هل تريد حذف هذا المصروف؟',
        type: 'danger',
        confirmText: 'نعم، احذف',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري حذف المصروف...');
        
        try {
            const expensesCopy = [...expenses];
            expenses = expenses.filter(e => e.id !== id);
            const success = await saveToFirebase('expenses', expenses);
            
            hideLoading();
            
            if (success) {
                renderExpenses();
                if (typeof updateExpenseStats === 'function') updateExpenseStats();
                if (typeof updateDashboard === 'function') updateDashboard();
                showNotification('✅ نجح', 'تم حذف المصروف بنجاح', 'success');
            } else {
                expenses = expensesCopy;
                showNotification('❌ خطأ', 'حدث خطأ في حذف المصروف', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Expense', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تفريغ نموذج المصروف
 */
function clearExpenseForm() {
    const dateField = document.getElementById('expenseDate');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    
    const fields = ['expenseDescription', 'expenseAmount', 'expenseNotes'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const categoryField = document.getElementById('expenseCategory');
    if (categoryField) categoryField.value = '';
    
    const addButton = document.querySelector('#expenses .btn-primary');
    if (addButton) {
        addButton.textContent = '➕ إضافة مصروف';
        addButton.onclick = addExpense;
    }
    
    editingExpenseId = null;
}

/**
 * تحديث إحصائيات المصروفات
 */
function updateExpenseStats() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalEl = document.getElementById('totalExpenses');
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

debugLog('✅ تم تحميل وحدة المصروفات');
