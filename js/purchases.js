/* ========================================
   🛒 إدارة المشتريات - نظام ديواني
   ======================================== */

// ===== متغيرات المشتريات =====
if (typeof currentPurchaseItems === 'undefined') var currentPurchaseItems = [];
if (typeof editingPurchaseId === 'undefined') var editingPurchaseId = null;
if (typeof currentPurchaseNumber === 'undefined') var currentPurchaseNumber = 1;

// ===== دوال توليد الأكواد =====

/**
 * توليد كود فاتورة مشتريات جديدة
 */
function generatePurchaseCode() {
    const codeField = document.getElementById('purchaseCode');
    if (codeField) {
        codeField.value = 'PUR' + currentPurchaseNumber.toString().padStart(3, '0');
    }
}

// ===== دوال إدارة أصناف الفاتورة =====

/**
 * إضافة صنف إلى فاتورة المشتريات
 */
function addItemToPurchase() {
    const itemId = parseInt(document.getElementById('purchaseItem')?.value);
    const quantity = parseInt(document.getElementById('purchaseItemQuantity')?.value) || 1;
    const cost = parseFloat(document.getElementById('purchaseItemCost')?.value) || 0;

    if (!itemId || quantity <= 0 || cost <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى اختيار الصنف وإدخال الكمية والتكلفة', 'warning');
        return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) {
        showNotification('❌ خطأ', 'الصنف غير موجود', 'error');
        return;
    }

    // التحقق من عدم التكرار
    const existingItem = currentPurchaseItems.find(pi => pi.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.cost;
    } else {
        currentPurchaseItems.push({
            id: itemId,
            name: item.name,
            quantity: quantity,
            cost: cost,
            total: quantity * cost
        });
    }

    renderPurchaseItems();
    updatePurchaseTotals();
    
    // تفريغ الحقول
    document.getElementById('purchaseItemQuantity').value = '1';
    document.getElementById('purchaseItemCost').value = '';
}

/**
 * عرض أصناف فاتورة المشتريات
 */
function renderPurchaseItems() {
    const tbody = document.getElementById('purchaseItemsList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (currentPurchaseItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد أصناف</td></tr>';
        return;
    }
    
    currentPurchaseItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatNumber(item.cost)}</td>
            <td>${formatNumber(item.total)}</td>
            <td>
                <button class="btn-danger" onclick="removeItemFromPurchase(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * حذف صنف من فاتورة المشتريات
 * @param {number} index - رقم الصنف
 */
function removeItemFromPurchase(index) {
    currentPurchaseItems.splice(index, 1);
    renderPurchaseItems();
    updatePurchaseTotals();
}

/**
 * تحديث مجاميع فاتورة المشتريات
 */
function updatePurchaseTotals() {
    const subtotal = currentPurchaseItems.reduce((sum, item) => sum + item.total, 0);
    const taxApplied = document.getElementById('applyPurchaseTax')?.checked || false;
    const tax = taxApplied ? subtotal * 0.15 : 0;
    const total = subtotal + tax;
    const paidAmount = parseFloat(document.getElementById('purchasePaidAmount')?.value) || 0;
    const remaining = total - paidAmount;
    
    const subtotalEl = document.getElementById('purchaseSubtotal');
    const taxEl = document.getElementById('purchaseTax');
    const totalEl = document.getElementById('purchaseTotal');
    const remainingEl = document.getElementById('purchaseRemaining');
    
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (taxEl) taxEl.textContent = formatCurrency(tax);
    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (remainingEl) {
        remainingEl.textContent = formatCurrency(remaining);
        remainingEl.className = remaining <= 0 ? 'remaining-paid' : 'remaining-unpaid';
    }
}

// ===== دوال حفظ الفاتورة =====

/**
 * فاتورة مشتريات جديدة
 */
function newPurchase() {
    currentPurchaseItems = [];
    editingPurchaseId = null;
    
    const dateField = document.getElementById('purchaseDate');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    
    const fields = ['purchaseSupplier', 'purchaseSupplierName', 'purchaseSupplierCode', 'purchaseSupplierPhone', 'purchaseSupplierAddress', 'purchaseNotes', 'purchasePaidAmount'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const taxCheckbox = document.getElementById('applyPurchaseTax');
    if (taxCheckbox) taxCheckbox.checked = false;
    
    generatePurchaseCode();
    
    const saveBtn = document.getElementById('savePurchaseBtn');
    if (saveBtn) saveBtn.textContent = '💾 حفظ الفاتورة';
    
    renderPurchaseItems();
    updatePurchaseTotals();
    renderPurchasesList();
}

/**
 * حفظ فاتورة مشتريات
 */
async function savePurchase() {
    const date = document.getElementById('purchaseDate')?.value;
    const supplierId = parseInt(document.getElementById('purchaseSupplier')?.value);
    const notes = document.getElementById('purchaseNotes')?.value || '';
    const supplierAddress = document.getElementById('purchaseSupplierAddress')?.value || '';
    const paidAmount = parseFloat(document.getElementById('purchasePaidAmount')?.value) || 0;
    const taxApplied = document.getElementById('applyPurchaseTax')?.checked || false;

    // التحقق من المدخلات
    if (!date || !supplierId || currentPurchaseItems.length === 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة وإضافة أصناف للفاتورة', 'warning');
        return;
    }
    
    const subtotal = currentPurchaseItems.reduce((sum, item) => sum + item.total, 0);
    const tax = taxApplied ? subtotal * 0.15 : 0;
    const total = subtotal + tax;
    const remainingAmount = total - paidAmount;

    showLoading('جاري حفظ الفاتورة...');

    try {
        if (editingPurchaseId) {
            // تحديث فاتورة موجودة
            const purchaseIndex = purchases.findIndex(p => p.id === editingPurchaseId);
            if (purchaseIndex > -1) {
                const originalPurchase = purchases[purchaseIndex];
                
                // إرجاع المخزون القديم
                originalPurchase.items.forEach(pi => {
                    const item = items.find(i => i.id === pi.id);
                    if (item) item.stock -= pi.quantity;
                });

                const updatedPurchase = {
                    ...originalPurchase,
                    date,
                    supplierId,
                    supplierName: suppliers.find(s => s.id === supplierId)?.name || '',
                    notes,
                    supplierAddress,
                    paidAmount,
                    items: [...currentPurchaseItems],
                    subtotal,
                    tax,
                    total,
                    remainingAmount,
                    taxApplied: true
                };
                
                purchases[purchaseIndex] = updatedPurchase;
                
                showNotification('✅ تم التحديث', 'تم تحديث الفاتورة رقم PUR' + originalPurchase.number.toString().padStart(3, '0') + ' بنجاح!', 'success');
            }
        } else {
            // إنشاء فاتورة جديدة
            const supplier = suppliers.find(s => s.id === supplierId);
            const newPurchaseData = {
                id: Date.now(),
                number: currentPurchaseNumber,
                date,
                supplierId,
                supplierName: supplier?.name || '',
                notes,
                supplierAddress,
                paidAmount,
                items: [...currentPurchaseItems],
                subtotal,
                tax,
                total,
                remainingAmount,
                taxApplied
            };
            
            purchases.push(newPurchaseData);
            currentPurchaseNumber++;
            showNotification('✅ تم الحفظ', 'تم حفظ الفاتورة رقم PUR' + newPurchaseData.number.toString().padStart(3, '0') + ' بنجاح!', 'success');
        }
        
        // حفظ في Firebase
        const success1 = await saveToFirebase('purchases', purchases);
        
        // إضافة للمخزون
        currentPurchaseItems.forEach(pi => {
            const item = items.find(i => i.id === pi.id);
            if (item) item.stock += pi.quantity;
        });
        const success2 = await saveToFirebase('items', items);
        
        hideLoading();
        
        if (success1 && success2) {
            newPurchase();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof renderItems === 'function') renderItems();
        } else {
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Save Purchase', error);
    }
}

// ===== دوال عرض الفواتير =====

/**
 * عرض قائمة فواتير المشتريات
 */
function renderPurchasesList() {
    const tbody = document.getElementById('purchasesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredPurchases = [...purchases];
    const searchText = document.getElementById('searchPurchases')?.value || '';
    
    if (searchText) {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const purchaseCode = 'PUR' + purchase.number.toString().padStart(3, '0');
            return purchaseCode.includes(searchText) ||
                   purchase.supplierName?.toLowerCase().includes(searchText.toLowerCase()) ||
                   purchase.date.includes(searchText);
        });
    }
    
    if (filteredPurchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }
    
    filteredPurchases.forEach(purchase => {
        const purchaseCode = 'PUR' + purchase.number.toString().padStart(3, '0');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${purchaseCode}</td>
            <td>${purchase.date}</td>
            <td>${purchase.supplierName || '-'}</td>
            <td>${formatCurrency(purchase.total)}</td>
            <td>${formatCurrency(purchase.paidAmount)}</td>
            <td class="${purchase.remainingAmount <= 0 ? 'remaining-paid' : 'remaining-unpaid'}">
                ${formatCurrency(purchase.remainingAmount)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-info" onclick="viewPurchase(${purchase.id})">👁️ عرض</button>
                    <button class="btn-warning" onclick="editPurchase(${purchase.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deletePurchase(${purchase.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال التعديل والحذف =====

/**
 * تعديل فاتورة مشتريات
 * @param {number} id - معرف الفاتورة
 */
function editPurchase(id) {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    
    editingPurchaseId = id;
    currentPurchaseItems = [...purchase.items];
    
    document.getElementById('purchaseDate').value = purchase.date;
    document.getElementById('purchaseSupplier').value = purchase.supplierId;
    document.getElementById('purchaseNotes').value = purchase.notes || '';
    document.getElementById('purchaseSupplierAddress').value = purchase.supplierAddress || '';
    document.getElementById('purchasePaidAmount').value = purchase.paidAmount;
    document.getElementById('applyPurchaseTax').checked = purchase.taxApplied || false;
    
    const saveBtn = document.getElementById('savePurchaseBtn');
    if (saveBtn) saveBtn.textContent = '💾 تحديث الفاتورة';
    
    renderPurchaseItems();
    updatePurchaseTotals();
    
    // الانتقال إلى قسم المشتريات
    if (typeof showSection === 'function') showSection('purchases');
}

/**
 * حذف فاتورة مشتريات
 * @param {number} id - معرف الفاتورة
 */
async function deletePurchase(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ حذف فاتورة',
        message: 'هل تريد حذف هذه الفاتورة؟',
        type: 'danger',
        confirmText: 'نعم، احذف',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري حذف الفاتورة...');
        
        try {
            const purchase = purchases.find(p => p.id === id);
            if (!purchase) {
                hideLoading();
                showNotification('❌ خطأ', 'الفاتورة غير موجودة', 'error');
                return;
            }
            
            // خصم من المخزون
            purchase.items.forEach(pi => {
                const item = items.find(i => i.id === pi.id);
                if (item) item.stock -= pi.quantity;
            });
            
            // حذف الفاتورة
            purchases = purchases.filter(p => p.id !== id);
            
            const success1 = await saveToFirebase('purchases', purchases);
            const success2 = await saveToFirebase('items', items);
            
            hideLoading();
            
            if (success1 && success2) {
                renderPurchasesList();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderItems === 'function') renderItems();
                showNotification('✅ نجح', 'تم حذف الفاتورة بنجاح', 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في حذف الفاتورة', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Purchase', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تحديث قوائم الموردين في فاتورة المشتريات
 */
function updatePurchaseDropdowns() {
    const supplierSelect = document.getElementById('purchaseSupplier');
    if (supplierSelect && typeof suppliers !== 'undefined') {
        supplierSelect.innerHTML = '<option value="">-- اختر المورد --</option>';
        suppliers.forEach(supplier => {
            supplierSelect.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
        });
    }
    
    const itemSelect = document.getElementById('purchaseItem');
    if (itemSelect && typeof items !== 'undefined') {
        itemSelect.innerHTML = '<option value="">-- اختر الصنف --</option>';
        items.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });
    }
}

debugLog('✅ تم تحميل وحدة المشتريات');
