/* ========================================
   🏭 إدارة الموردين - نظام ديواني
   ======================================== */

// ===== متغيرات الموردين =====
if (typeof editingSupplierId === 'undefined') var editingSupplierId = null;

// ===== دوال توليد الأكواد =====

/**
 * توليد كود مورد جديد
 */
function generateSupplierCode() {
    const codeField = document.getElementById('supplierCode');
    if (codeField) {
        codeField.value = 'SU' + (suppliers.length + 1).toString().padStart(3, '0');
    }
}

// ===== دوال إضافة الموردين =====

/**
 * إضافة مورد جديد
 */
async function addSupplier() {
    const code = document.getElementById('supplierCode')?.value;
    const name = document.getElementById('supplierName')?.value.trim();
    const phone = document.getElementById('supplierPhone')?.value.trim();
    const email = document.getElementById('supplierEmail')?.value.trim();
    const address = document.getElementById('supplierAddress')?.value.trim();

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم المورد', 'warning');
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
    const exists = suppliers.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم المورد موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري إضافة المورد...');

    try {
        const supplier = {
            id: Date.now(),
            code: code || 'SU' + (suppliers.length + 1).toString().padStart(3, '0'),
            name: name,
            phone: phone || '',
            email: email || '',
            address: address || ''
        };

        suppliers.push(supplier);
        const success = await saveToFirebase('suppliers', suppliers);
        
        hideLoading();
        
        if (success) {
            if (typeof updateDashboard === 'function') updateDashboard();
            clearSupplierForm();
            renderSuppliers();
            showNotification('✅ نجاح', 'تم إضافة المورد بنجاح!', 'success');
        } else {
            suppliers.pop();
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Add Supplier', error);
    }
}

// ===== دوال عرض الموردين =====

/**
 * عرض قائمة الموردين
 */
function renderSuppliers() {
    const tbody = document.getElementById('suppliersList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredSuppliers = [...suppliers];
    const searchText = document.getElementById('searchSuppliers')?.value || '';
    
    if (searchText) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
            supplier.code.toLowerCase().includes(searchText.toLowerCase()) ||
            (supplier.phone && supplier.phone.includes(searchText)) ||
            (supplier.email && supplier.email.toLowerCase().includes(searchText.toLowerCase())) ||
            (supplier.address && supplier.address.toLowerCase().includes(searchText.toLowerCase()))
        );
    }

    if (filteredSuppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }

    filteredSuppliers.forEach(supplier => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${supplier.code}</td>
            <td>${supplier.name}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.email || '-'}</td>
            <td>${supplier.address || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-warning edit-btn" onclick="editSupplier(${supplier.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteSupplier(${supplier.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال الفلترة =====

/**
 * إعادة تعيين فلاتر الموردين
 */
function resetSuppliersFilters() {
    const searchField = document.getElementById('searchSuppliers');
    if (searchField) searchField.value = '';
    renderSuppliers();
}

// ===== دوال التعديل =====

/**
 * تعديل مورد
 * @param {number} id - معرف المورد
 */
function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    
    document.getElementById('supplierCode').value = supplier.code;
    document.getElementById('supplierName').value = supplier.name;
    document.getElementById('supplierPhone').value = supplier.phone || '';
    document.getElementById('supplierEmail').value = supplier.email || '';
    document.getElementById('supplierAddress').value = supplier.address || '';
    
    const addButton = document.querySelector('#suppliers .btn-primary');
    if (addButton) {
        addButton.textContent = '💾 تحديث المورد';
        addButton.onclick = () => updateSupplier(id);
    }
    
    editingSupplierId = id;
}

/**
 * تحديث مورد
 * @param {number} id - معرف المورد
 */
async function updateSupplier(id) {
    const name = document.getElementById('supplierName')?.value.trim();
    const phone = document.getElementById('supplierPhone')?.value.trim();
    const email = document.getElementById('supplierEmail')?.value.trim();
    const address = document.getElementById('supplierAddress')?.value.trim();

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم المورد', 'warning');
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
    const exists = suppliers.find(s => s.id !== id && s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم المورد موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري تحديث المورد...');

    try {
        const supplierIndex = suppliers.findIndex(s => s.id === id);
        if (supplierIndex !== -1) {
            const oldName = suppliers[supplierIndex].name;
            
            suppliers[supplierIndex] = {
                id: id,
                code: document.getElementById('supplierCode').value,
                name: name,
                phone: phone || '',
                email: email || '',
                address: address || ''
            };
            
            // تحديث اسم المورد في فواتير المشتريات
            let purchasesCount = 0;
            if (typeof purchases !== 'undefined') {
                purchases.forEach(purchase => {
                    if (purchase.supplierId === id || purchase.supplierName === oldName) {
                        purchase.supplierName = name;
                        purchasesCount++;
                    }
                });
            }
            
            const success = await saveToFirebase('suppliers', suppliers);
            const purchasesSuccess = purchasesCount > 0 ? await saveToFirebase('purchases', purchases) : true;
            
            hideLoading();
            
            if (success && purchasesSuccess) {
                if (typeof updateDashboard === 'function') updateDashboard();
                clearSupplierForm();
                renderSuppliers();
                
                let message = 'تم تحديث المورد بنجاح!';
                if (purchasesCount > 0) message += `\n- تم تحديث ${purchasesCount} فاتورة مشتريات`;
                
                showNotification('✅ نجاح', message, 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في تحديث البيانات', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        logError('Update Supplier', error);
    }
}

// ===== دوال الحذف =====

/**
 * حذف مورد (نقل إلى سلة المحذوفات)
 * @param {number} id - معرف المورد
 */
async function deleteSupplier(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ نقل إلى سلة المحذوفات',
        message: 'هل تريد نقل هذا المورد إلى سلة المحذوفات؟\nيمكنك استعادته خلال 30 يوماً.',
        type: 'warning',
        confirmText: 'نعم، انقله',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري نقل المورد...');
        
        try {
            const supplier = suppliers.find(s => s.id === id);
            if (!supplier) {
                hideLoading();
                showNotification('❌ خطأ', 'المورد غير موجود', 'error');
                return;
            }
            
            // نقل إلى سلة المحذوفات
            if (typeof moveToTrash === 'function') {
                moveToTrash('suppliers', supplier);
            }
            
            // حذف من المصفوفة
            const suppliersCopy = [...suppliers];
            suppliers = suppliers.filter(s => s.id !== id);
            const success = await saveToFirebase('suppliers', suppliers);
            
            hideLoading();
            
            if (success) {
                renderSuppliers();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof updateTrashBadge === 'function') updateTrashBadge();
                showNotification('✅ نجاح', 'تم نقل المورد إلى سلة المحذوفات', 'success');
            } else {
                suppliers = suppliersCopy;
                showNotification('❌ خطأ', 'حدث خطأ في حذف البيانات', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Supplier', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تفريغ نموذج المورد
 */
function clearSupplierForm() {
    const fields = ['supplierName', 'supplierPhone', 'supplierEmail', 'supplierAddress'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const addButton = document.querySelector('#suppliers .btn-primary');
    if (addButton) {
        addButton.textContent = '➕ إضافة مورد';
        addButton.onclick = addSupplier;
    }
    
    generateSupplierCode();
    editingSupplierId = null;
}

/**
 * الحصول على مورد بالمعرف
 * @param {number} id - معرف المورد
 * @returns {Object|null}
 */
function getSupplierById(id) {
    return suppliers.find(s => s.id === id) || null;
}

/**
 * الحصول على مورد بالاسم
 * @param {string} name - اسم المورد
 * @returns {Object|null}
 */
function getSupplierByName(name) {
    return suppliers.find(s => s.name.toLowerCase() === name.toLowerCase()) || null;
}

debugLog('✅ تم تحميل وحدة الموردين');
