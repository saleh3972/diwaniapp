/* ========================================
   👥 إدارة العملاء - نظام ديواني
   ======================================== */

// ===== متغيرات العملاء =====
if (typeof editingCustomerId === 'undefined') var editingCustomerId = null;

// ===== دوال توليد الأكواد =====

/**
 * توليد كود عميل جديد
 */
function generateCustomerCode() {
    const codeField = document.getElementById('customerCode');
    if (codeField) {
        codeField.value = 'CU' + (customers.length + 1).toString().padStart(3, '0');
    }
}

// ===== دوال إضافة العملاء =====

/**
 * إضافة عميل جديد
 */
async function addCustomer() {
    const code = document.getElementById('customerCode')?.value;
    const name = document.getElementById('customerName')?.value.trim();
    const phone = document.getElementById('customerPhone')?.value.trim();
    const email = document.getElementById('customerEmail')?.value.trim();
    const address = document.getElementById('customerAddress')?.value.trim();

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم العميل', 'warning');
        return;
    }

    if (phone && !ValidationHelper.isValidSaudiPhone(phone)) {
        showNotification('⚠️ رقم غير صالح', 'رقم الجوال غير صحيح', 'warning');
        return;
    }

    if (email && !ValidationHelper.isValidEmail(email)) {
        showNotification('⚠️ بريد غير صالح', 'البريد الإلكتروني غير صحيح', 'warning');
        return;
    }

    // التحقق من عدم التكرار
    const exists = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم العميل موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري إضافة العميل...');

    try {
        const customer = {
            id: Date.now(),
            code: code || 'CU' + (customers.length + 1).toString().padStart(3, '0'),
            name: name,
            phone: phone || '',
            email: email || '',
            address: address || ''
        };

        customers.push(customer);
        const success = await saveToFirebase('customers', customers);
        
        hideLoading();
        
        if (success) {
            if (typeof updateDashboard === 'function') updateDashboard();
            clearCustomerForm();
            renderCustomers();
            showNotification('✅ نجاح', 'تم إضافة العميل بنجاح!', 'success');
        } else {
            customers.pop();
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Add Customer', error);
    }
}

// ===== دوال عرض العملاء =====

/**
 * عرض قائمة العملاء
 */
function renderCustomers() {
    const tbody = document.getElementById('customersList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredCustomers = [...customers];
    const searchText = document.getElementById('searchCustomers')?.value || '';
    
    if (searchText) {
        filteredCustomers = filteredCustomers.filter(customer => 
            customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
            customer.code.toLowerCase().includes(searchText.toLowerCase()) ||
            (customer.phone && customer.phone.includes(searchText)) ||
            (customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase())) ||
            (customer.address && customer.address.toLowerCase().includes(searchText.toLowerCase()))
        );
    }

    if (filteredCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }

    filteredCustomers.forEach(customer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-warning edit-btn" onclick="editCustomer(${customer.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteCustomer(${customer.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال الفلترة =====

/**
 * إعادة تعيين فلاتر العملاء
 */
function resetCustomersFilters() {
    const searchField = document.getElementById('searchCustomers');
    if (searchField) searchField.value = '';
    renderCustomers();
}

// ===== دوال التعديل =====

/**
 * تعديل عميل
 * @param {number} id - معرف العميل
 */
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    document.getElementById('customerCode').value = customer.code;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone || '';
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerAddress').value = customer.address || '';
    
    const addButton = document.querySelector('#customers .btn-primary');
    if (addButton) {
        addButton.textContent = '💾 تحديث العميل';
        addButton.onclick = () => updateCustomer(id);
    }
    
    editingCustomerId = id;
}

/**
 * تحديث عميل
 * @param {number} id - معرف العميل
 */
async function updateCustomer(id) {
    const name = document.getElementById('customerName')?.value.trim();
    const phone = document.getElementById('customerPhone')?.value.trim();
    const email = document.getElementById('customerEmail')?.value.trim();
    const address = document.getElementById('customerAddress')?.value.trim();

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم العميل', 'warning');
        return;
    }

    if (phone && !ValidationHelper.isValidSaudiPhone(phone)) {
        showNotification('⚠️ رقم غير صالح', 'رقم الجوال غير صحيح', 'warning');
        return;
    }

    if (email && !ValidationHelper.isValidEmail(email)) {
        showNotification('⚠️ بريد غير صالح', 'البريد الإلكتروني غير صحيح', 'warning');
        return;
    }

    // التحقق من عدم التكرار (مع استثناء العنصر الحالي)
    const exists = customers.find(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم العميل موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري تحديث العميل...');

    try {
        const customerIndex = customers.findIndex(c => c.id === id);
        if (customerIndex !== -1) {
            const oldName = customers[customerIndex].name;
            
            customers[customerIndex] = {
                id: id,
                code: document.getElementById('customerCode').value,
                name: name,
                phone: phone || '',
                email: email || '',
                address: address || ''
            };
            
            // تحديث اسم العميل في فواتير المبيعات
            let salesCount = 0;
            if (typeof sales !== 'undefined') {
                sales.forEach(sale => {
                    if (sale.customerId === id || sale.customerName === oldName) {
                        sale.customerName = name;
                        salesCount++;
                    }
                });
            }
            
            const success = await saveToFirebase('customers', customers);
            const salesSuccess = salesCount > 0 ? await saveToFirebase('sales', sales) : true;
            
            hideLoading();
            
            if (success && salesSuccess) {
                if (typeof updateDashboard === 'function') updateDashboard();
                clearCustomerForm();
                renderCustomers();
                
                let message = 'تم تحديث العميل بنجاح!';
                if (salesCount > 0) message += `\n- تم تحديث ${salesCount} فاتورة مبيعات`;
                
                showNotification('✅ نجاح', message, 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في تحديث البيانات', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        logError('Update Customer', error);
    }
}

// ===== دوال الحذف =====

/**
 * حذف عميل (نقل إلى سلة المحذوفات)
 * @param {number} id - معرف العميل
 */
async function deleteCustomer(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ نقل إلى سلة المحذوفات',
        message: 'هل تريد نقل هذا العميل إلى سلة المحذوفات؟\nيمكنك استعادته خلال 30 يوماً.',
        type: 'warning',
        confirmText: 'نعم، انقله',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري نقل العميل...');
        
        try {
            const customer = customers.find(c => c.id === id);
            if (!customer) {
                hideLoading();
                showNotification('❌ خطأ', 'العميل غير موجود', 'error');
                return;
            }
            
            // نقل إلى سلة المحذوفات
            if (typeof moveToTrash === 'function') {
                moveToTrash('customers', customer);
            }
            
            // حذف من المصفوفة
            const customersCopy = [...customers];
            customers = customers.filter(c => c.id !== id);
            const success = await saveToFirebase('customers', customers);
            
            hideLoading();
            
            if (success) {
                renderCustomers();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof updateTrashBadge === 'function') updateTrashBadge();
                showNotification('✅ نجاح', 'تم نقل العميل إلى سلة المحذوفات', 'success');
            } else {
                customers = customersCopy;
                showNotification('❌ خطأ', 'حدث خطأ في حذف البيانات', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Customer', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تفريغ نموذج العميل
 */
function clearCustomerForm() {
    const fields = ['customerName', 'customerPhone', 'customerEmail', 'customerAddress'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const addButton = document.querySelector('#customers .btn-primary');
    if (addButton) {
        addButton.textContent = '➕ إضافة عميل';
        addButton.onclick = addCustomer;
    }
    
    generateCustomerCode();
    editingCustomerId = null;
}

/**
 * الحصول على عميل بالمعرف
 * @param {number} id - معرف العميل
 * @returns {Object|null}
 */
function getCustomerById(id) {
    return customers.find(c => c.id === id) || null;
}

/**
 * الحصول على عميل بالاسم
 * @param {string} name - اسم العميل
 * @returns {Object|null}
 */
function getCustomerByName(name) {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
}

debugLog('✅ تم تحميل وحدة العملاء');
