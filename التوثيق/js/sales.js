/* ========================================
   💰 إدارة المبيعات - نظام ديواني
   ======================================== */

// ===== متغيرات المبيعات =====
if (typeof currentSaleItems === 'undefined') var currentSaleItems = [];
if (typeof editingSaleId === 'undefined') var editingSaleId = null;
if (typeof currentSaleNumber === 'undefined') var currentSaleNumber = 1;

// ===== دوال توليد الأكواد =====

/**
 * توليد كود فاتورة مبيعات جديدة
 */
function generateSaleCode() {
    const codeField = document.getElementById('saleCode');
    if (codeField) {
        codeField.value = 'SAL' + currentSaleNumber.toString().padStart(3, '0');
    }
}

// ===== دوال إدارة أصناف الفاتورة =====

/**
 * إضافة صنف إلى فاتورة المبيعات
 */
function addItemToSale() {
    const itemId = parseInt(document.getElementById('saleItem')?.value);
    const quantity = parseInt(document.getElementById('saleItemQuantity')?.value) || 1;
    const price = parseFloat(document.getElementById('saleItemPrice')?.value) || 0;

    if (!itemId || quantity <= 0 || price <= 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى اختيار الصنف وإدخال الكمية والسعر', 'warning');
        return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) {
        showNotification('❌ خطأ', 'الصنف غير موجود', 'error');
        return;
    }

    if (item.stock < quantity) {
        showNotification('⚠️ مخزون غير كافٍ', `المخزون المتاح: ${item.stock}`, 'warning');
        return;
    }

    // التحقق من عدم التكرار
    const existingItem = currentSaleItems.find(si => si.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        currentSaleItems.push({
            id: itemId,
            name: item.name,
            quantity: quantity,
            price: price,
            total: quantity * price
        });
    }

    renderSaleItems();
    updateSaleTotals();
    
    // تفريغ الحقول
    document.getElementById('saleItemQuantity').value = '1';
    document.getElementById('saleItemPrice').value = '';
}

/**
 * عرض أصناف فاتورة المبيعات
 */
function renderSaleItems() {
    const tbody = document.getElementById('saleItemsList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (currentSaleItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد أصناف</td></tr>';
        return;
    }
    
    currentSaleItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatNumber(item.price)}</td>
            <td>${formatNumber(item.total)}</td>
            <td>
                <button class="btn-danger" onclick="removeItemFromSale(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * حذف صنف من فاتورة المبيعات
 * @param {number} index - رقم الصنف
 */
function removeItemFromSale(index) {
    currentSaleItems.splice(index, 1);
    renderSaleItems();
    updateSaleTotals();
}

/**
 * تحديث مجاميع فاتورة المبيعات
 */
function updateSaleTotals() {
    const subtotal = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    const taxApplied = document.getElementById('applySaleTax')?.checked || false;
    const tax = taxApplied ? subtotal * 0.15 : 0;
    const total = subtotal + tax;
    const paidAmount = parseFloat(document.getElementById('salePaidAmount')?.value) || 0;
    const remaining = total - paidAmount;
    
    const subtotalEl = document.getElementById('saleSubtotal');
    const taxEl = document.getElementById('saleTax');
    const totalEl = document.getElementById('saleTotal');
    const remainingEl = document.getElementById('saleRemaining');
    
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
 * فاتورة مبيعات جديدة
 */
function newSale() {
    currentSaleItems = [];
    editingSaleId = null;
    
    const dateField = document.getElementById('saleDate');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    
    const fields = ['saleCustomer', 'saleCustomerName', 'saleCustomerCode', 'saleCustomerPhone', 'saleCustomerAddress', 'saleNotes', 'salePaidAmount'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const taxCheckbox = document.getElementById('applySaleTax');
    if (taxCheckbox) taxCheckbox.checked = false;
    
    generateSaleCode();
    
    const saveBtn = document.getElementById('saveSaleBtn');
    if (saveBtn) saveBtn.textContent = '💾 حفظ الفاتورة';
    
    renderSaleItems();
    updateSaleTotals();
    renderSalesList();
}

/**
 * حفظ فاتورة مبيعات
 */
async function saveSale() {
    const date = document.getElementById('saleDate')?.value;
    const customerId = parseInt(document.getElementById('saleCustomer')?.value);
    const notes = document.getElementById('saleNotes')?.value || '';
    const customerAddress = document.getElementById('saleCustomerAddress')?.value || '';
    const paidAmount = parseFloat(document.getElementById('salePaidAmount')?.value) || 0;
    const taxApplied = document.getElementById('applySaleTax')?.checked || false;

    // التحقق من المدخلات
    if (!date || !customerId || currentSaleItems.length === 0) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع البيانات المطلوبة وإضافة أصناف للفاتورة', 'warning');
        return;
    }
    
    const subtotal = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    const tax = taxApplied ? subtotal * 0.15 : 0;
    const total = subtotal + tax;
    const remainingAmount = total - paidAmount;

    showLoading('جاري حفظ الفاتورة...');

    try {
        if (editingSaleId) {
            // تحديث فاتورة موجودة
            const saleIndex = sales.findIndex(s => s.id === editingSaleId);
            if (saleIndex > -1) {
                const originalSale = sales[saleIndex];
                
                // إرجاع المخزون القديم
                originalSale.items.forEach(si => {
                    const item = items.find(i => i.id === si.id);
                    if (item) item.stock += si.quantity;
                });

                const updatedSale = {
                    ...originalSale,
                    date,
                    customerId,
                    customerName: customers.find(c => c.id === customerId)?.name || '',
                    notes,
                    customerAddress,
                    paidAmount,
                    items: [...currentSaleItems],
                    subtotal,
                    tax,
                    total,
                    remainingAmount,
                    taxApplied
                };
                
                sales[saleIndex] = updatedSale;
                
                showNotification('✅ تم التحديث', `تم تحديث الفاتورة رقم SAL${originalSale.number.toString().padStart(3, '0')} بنجاح!`, 'success');
            }
        } else {
            // إنشاء فاتورة جديدة
            const customer = customers.find(c => c.id === customerId);
            const newSaleData = {
                id: Date.now(),
                number: currentSaleNumber,
                date,
                customerId,
                customerName: customer?.name || '',
                notes,
                customerAddress,
                paidAmount,
                items: [...currentSaleItems],
                subtotal,
                tax,
                total,
                remainingAmount,
                taxApplied
            };
            
            sales.push(newSaleData);
            currentSaleNumber++;
            showNotification('✅ تم الحفظ', `تم حفظ الفاتورة رقم SAL${newSaleData.number.toString().padStart(3, '0')} بنجاح!`, 'success');
        }
        
        // حفظ في Firebase
        const success1 = await saveToFirebase('sales', sales);
        
        // خصم المخزون
        currentSaleItems.forEach(si => {
            const item = items.find(i => i.id === si.id);
            if (item) item.stock -= si.quantity;
        });
        const success2 = await saveToFirebase('items', items);
        
        hideLoading();
        
        if (success1 && success2) {
            newSale();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof renderItems === 'function') renderItems();
        } else {
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Save Sale', error);
    }
}

// ===== دوال عرض الفواتير =====

/**
 * عرض قائمة فواتير المبيعات
 */
function renderSalesList() {
    const tbody = document.getElementById('salesList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredSales = [...sales];
    const searchText = document.getElementById('searchSales')?.value || '';
    
    if (searchText) {
        filteredSales = filteredSales.filter(sale => {
            const saleCode = 'SAL' + sale.number.toString().padStart(3, '0');
            return saleCode.includes(searchText) ||
                   sale.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
                   sale.date.includes(searchText);
        });
    }
    
    if (filteredSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }
    
    filteredSales.forEach(sale => {
        const saleCode = 'SAL' + sale.number.toString().padStart(3, '0');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${saleCode}</td>
            <td>${sale.date}</td>
            <td>${sale.customerName || '-'}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>${formatCurrency(sale.paidAmount)}</td>
            <td class="${sale.remainingAmount <= 0 ? 'remaining-paid' : 'remaining-unpaid'}">
                ${formatCurrency(sale.remainingAmount)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-info" onclick="viewSale(${sale.id})">👁️ عرض</button>
                    <button class="btn-warning" onclick="editSale(${sale.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteSale(${sale.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال التعديل والحذف =====

/**
 * تعديل فاتورة مبيعات
 * @param {number} id - معرف الفاتورة
 */
function editSale(id) {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    
    editingSaleId = id;
    currentSaleItems = [...sale.items];
    
    document.getElementById('saleDate').value = sale.date;
    document.getElementById('saleCustomer').value = sale.customerId;
    document.getElementById('saleNotes').value = sale.notes || '';
    document.getElementById('saleCustomerAddress').value = sale.customerAddress || '';
    document.getElementById('salePaidAmount').value = sale.paidAmount;
    document.getElementById('applySaleTax').checked = sale.taxApplied || false;
    
    const saveBtn = document.getElementById('saveSaleBtn');
    if (saveBtn) saveBtn.textContent = '💾 تحديث الفاتورة';
    
    renderSaleItems();
    updateSaleTotals();
    
    // الانتقال إلى قسم المبيعات
    if (typeof showSection === 'function') showSection('sales');
}

/**
 * حذف فاتورة مبيعات
 * @param {number} id - معرف الفاتورة
 */
async function deleteSale(id) {
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
            const sale = sales.find(s => s.id === id);
            if (!sale) {
                hideLoading();
                showNotification('❌ خطأ', 'الفاتورة غير موجودة', 'error');
                return;
            }
            
            // إرجاع المخزون
            sale.items.forEach(si => {
                const item = items.find(i => i.id === si.id);
                if (item) item.stock += si.quantity;
            });
            
            // حذف الفاتورة
            sales = sales.filter(s => s.id !== id);
            
            const success1 = await saveToFirebase('sales', sales);
            const success2 = await saveToFirebase('items', items);
            
            hideLoading();
            
            if (success1 && success2) {
                renderSalesList();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderItems === 'function') renderItems();
                showNotification('✅ نجح', 'تم حذف الفاتورة بنجاح', 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في حذف الفاتورة', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Sale', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تحديث قوائم العملاء في فاتورة المبيعات
 */
function updateSaleDropdowns() {
    const customerSelect = document.getElementById('saleCustomer');
    if (customerSelect && typeof customers !== 'undefined') {
        customerSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
        });
    }
    
    const itemSelect = document.getElementById('saleItem');
    if (itemSelect && typeof items !== 'undefined') {
        itemSelect.innerHTML = '<option value="">-- اختر الصنف --</option>';
        items.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.id}">${item.name} (${item.stock})</option>`;
        });
    }
}

debugLog('✅ تم تحميل وحدة المبيعات');
