/* ========================================
   📦 إدارة الأصناف - نظام ديواني
   ======================================== */

// ===== متغيرات الأصناف =====
if (typeof editingItemId === 'undefined') var editingItemId = null;

// ===== دوال توليد الأكواد =====

/**
 * توليد كود صنف جديد
 */
function generateItemCode() {
    const codeField = document.getElementById('itemCode');
    if (codeField) {
        codeField.value = 'IT' + (items.length + 1).toString().padStart(3, '0');
    }
}

// ===== دوال إضافة الأصناف =====

/**
 * إضافة صنف جديد
 */
async function addItem() {
    const code = document.getElementById('itemCode')?.value;
    const name = document.getElementById('itemName')?.value.trim();
    const cost = document.getElementById('itemCost')?.value;
    const price = document.getElementById('itemPrice')?.value;
    const stock = document.getElementById('itemStock')?.value;

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم الصنف', 'warning');
        return;
    }

    if (!validateNumberField('itemCost', 'سعر الشراء', true)) return;
    if (!validateNumberField('itemPrice', 'سعر البيع', false)) return;
    if (!validateNumberField('itemStock', 'الكمية', true)) return;

    // التحقق من عدم التكرار
    const exists = items.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم الصنف موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري إضافة الصنف...');

    try {
        const item = {
            id: Date.now(),
            code: code || 'IT' + (items.length + 1).toString().padStart(3, '0'),
            name: name,
            cost: parseFloat(cost) || 0,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0
        };

        items.push(item);
        const success = await saveToFirebase('items', items);
        
        hideLoading();
        
        if (success) {
            if (typeof updateDashboard === 'function') updateDashboard();
            clearItemForm();
            renderItems();
            showNotification('✅ نجاح', 'تم إضافة الصنف بنجاح!', 'success');
        } else {
            items.pop();
            showNotification('❌ خطأ', 'حدث خطأ في حفظ البيانات', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Add Item', error);
    }
}

// ===== دوال عرض الأصناف =====

/**
 * عرض قائمة الأصناف
 */
function renderItems() {
    const tbody = document.getElementById('itemsList');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // تطبيق الفلترة
    let filteredItems = [...items];
    const searchText = document.getElementById('searchItems')?.value || '';
    
    if (searchText) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.code.toLowerCase().includes(searchText.toLowerCase())
        );
    }
    
    // فلترة حسب سعر الشراء
    const costFrom = document.getElementById('itemCostFrom')?.value;
    const costTo = document.getElementById('itemCostTo')?.value;
    if (costFrom) {
        filteredItems = filteredItems.filter(item => parseFloat(item.cost) >= parseFloat(costFrom));
    }
    if (costTo) {
        filteredItems = filteredItems.filter(item => parseFloat(item.cost) <= parseFloat(costTo));
    }
    
    // فلترة حسب سعر البيع
    const priceFrom = document.getElementById('itemPriceFrom')?.value;
    const priceTo = document.getElementById('itemPriceTo')?.value;
    if (priceFrom) {
        filteredItems = filteredItems.filter(item => parseFloat(item.price) >= parseFloat(priceFrom));
    }
    if (priceTo) {
        filteredItems = filteredItems.filter(item => parseFloat(item.price) <= parseFloat(priceTo));
    }
    
    // فلترة حسب المخزون
    const stockFrom = document.getElementById('itemStockFrom')?.value;
    const stockTo = document.getElementById('itemStockTo')?.value;
    if (stockFrom) {
        filteredItems = filteredItems.filter(item => parseInt(item.stock) >= parseInt(stockFrom));
    }
    if (stockTo) {
        filteredItems = filteredItems.filter(item => parseInt(item.stock) <= parseInt(stockTo));
    }
    
    if (filteredItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد نتائج</td></tr>';
        return;
    }
    
    filteredItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${formatNumber(item.cost)}</td>
            <td>${formatNumber(item.price)}</td>
            <td>${item.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-warning edit-btn" onclick="editItem(${item.id})">✏️ تعديل</button>
                    <button class="btn-danger" onclick="deleteItem(${item.id})">🗑️ حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== دوال الفلترة =====

/**
 * تطبيق فلاتر الأصناف
 */
function applyItemsFilters() {
    renderItems();
}

/**
 * إعادة تعيين فلاتر الأصناف
 */
function resetItemsFilters() {
    const fields = ['itemCostFrom', 'itemCostTo', 'itemPriceFrom', 'itemPriceTo', 'itemStockFrom', 'itemStockTo'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    renderItems();
}

// ===== دوال التعديل =====

/**
 * تعديل صنف
 * @param {number} id - معرف الصنف
 */
function editItem(id) {
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    document.getElementById('itemCode').value = item.code;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCost').value = item.cost;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemStock').value = item.stock;
    
    const addButton = document.querySelector('#items .btn-primary');
    if (addButton) {
        addButton.textContent = '💾 تحديث الصنف';
        addButton.onclick = function() { updateItem(id); };
    }
    
    editingItemId = id;
}

/**
 * تحديث صنف
 * @param {number} id - معرف الصنف
 */
async function updateItem(id) {
    const name = document.getElementById('itemName')?.value.trim();
    const cost = document.getElementById('itemCost')?.value;
    const price = document.getElementById('itemPrice')?.value;
    const stock = document.getElementById('itemStock')?.value;

    // التحقق من المدخلات
    if (!name) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال اسم الصنف', 'warning');
        return;
    }

    if (!validateNumberField('itemCost', 'سعر الشراء', true)) return;
    if (!validateNumberField('itemPrice', 'سعر البيع', false)) return;
    if (!validateNumberField('itemStock', 'الكمية', true)) return;

    // التحقق من عدم التكرار (مع استثناء العنصر الحالي)
    const exists = items.find(item => item.id !== id && item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        showNotification('⚠️ تكرار', 'اسم الصنف موجود مسبقاً', 'warning');
        return;
    }

    showLoading('جاري تحديث الصنف...');

    try {
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const oldName = items[itemIndex].name;
            
            items[itemIndex] = {
                id: id,
                code: document.getElementById('itemCode').value,
                name: name,
                cost: parseFloat(cost) || 0,
                price: parseFloat(price) || 0,
                stock: parseInt(stock) || 0
            };
            
            // تحديث اسم الصنف في فواتير المبيعات
            let salesCount = 0;
            if (typeof sales !== 'undefined') {
                sales.forEach(sale => {
                    if (sale.items) {
                        sale.items.forEach(item => {
                            if (item.id === id || item.name === oldName) {
                                item.name = name;
                                salesCount++;
                            }
                        });
                    }
                });
            }
            
            // تحديث اسم الصنف في فواتير المشتريات
            let purchasesCount = 0;
            if (typeof purchases !== 'undefined') {
                purchases.forEach(purchase => {
                    if (purchase.items) {
                        purchase.items.forEach(item => {
                            if (item.id === id || item.name === oldName) {
                                item.name = name;
                                purchasesCount++;
                            }
                        });
                    }
                });
            }
            
            const success = await saveToFirebase('items', items);
            const salesSuccess = salesCount > 0 ? await saveToFirebase('sales', sales) : true;
            const purchasesSuccess = purchasesCount > 0 ? await saveToFirebase('purchases', purchases) : true;
            
            hideLoading();
            
            if (success && salesSuccess && purchasesSuccess) {
                if (typeof updateDashboard === 'function') updateDashboard();
                clearItemForm();
                renderItems();
                
                let message = 'تم تحديث الصنف بنجاح!';
                if (salesCount > 0) message += `\n- تم تحديث ${salesCount} صنف في فواتير المبيعات`;
                if (purchasesCount > 0) message += `\n- تم تحديث ${purchasesCount} صنف في فواتير المشتريات`;
                
                showNotification('✅ نجاح', message, 'success');
            } else {
                showNotification('❌ خطأ', 'حدث خطأ في تحديث البيانات', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        logError('Update Item', error);
    }
}

// ===== دوال الحذف =====

/**
 * حذف صنف (نقل إلى سلة المحذوفات)
 * @param {number} id - معرف الصنف
 */
async function deleteItem(id) {
    const confirmed = await showConfirmDialog({
        title: '🗑️ نقل إلى سلة المحذوفات',
        message: 'هل تريد نقل هذا الصنف إلى سلة المحذوفات؟\nيمكنك استعادته خلال 30 يوماً.',
        type: 'warning',
        confirmText: 'نعم، انقله',
        cancelText: 'إلغاء'
    });
    
    if (confirmed) {
        showLoading('جاري نقل الصنف...');
        
        try {
            const item = items.find(i => i.id === id);
            if (!item) {
                hideLoading();
                showNotification('❌ خطأ', 'الصنف غير موجود', 'error');
                return;
            }
            
            // نقل إلى سلة المحذوفات
            if (typeof moveToTrash === 'function') {
                moveToTrash('items', item);
            }
            
            // حذف من المصفوفة
            const itemsCopy = [...items];
            items = items.filter(item => item.id !== id);
            const success = await saveToFirebase('items', items);
            
            hideLoading();
            
            if (success) {
                renderItems();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof updateTrashBadge === 'function') updateTrashBadge();
                showNotification('✅ نجاح', 'تم نقل الصنف إلى سلة المحذوفات', 'success');
            } else {
                items = itemsCopy;
                showNotification('❌ خطأ', 'حدث خطأ في حذف البيانات', 'error');
            }
        } catch (error) {
            hideLoading();
            logError('Delete Item', error);
        }
    }
}

// ===== دوال مساعدة =====

/**
 * تفريغ نموذج الصنف
 */
function clearItemForm() {
    const fields = ['itemName', 'itemCost', 'itemPrice', 'itemStock'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const addButton = document.querySelector('#items .btn-primary');
    if (addButton) {
        addButton.textContent = '➕ إضافة صنف';
        addButton.onclick = addItem;
    }
    
    generateItemCode();
    editingItemId = null;
}

/**
 * الحصول على صنف بالمعرف
 * @param {number} id - معرف الصنف
 * @returns {Object|null}
 */
function getItemById(id) {
    return items.find(item => item.id === id) || null;
}

/**
 * الحصول على صنف بالاسم
 * @param {string} name - اسم الصنف
 * @returns {Object|null}
 */
function getItemByName(name) {
    return items.find(item => item.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * تحديث مخزون صنف
 * @param {number} id - معرف الصنف
 * @param {number} quantity - الكمية (موجبة للإضافة، سالبة للخصم)
 * @returns {boolean}
 */
function updateItemStock(id, quantity) {
    const item = items.find(i => i.id === id);
    if (!item) return false;
    
    item.stock += quantity;
    if (item.stock < 0) item.stock = 0;
    
    return true;
}

debugLog('✅ تم تحميل وحدة الأصناف');
