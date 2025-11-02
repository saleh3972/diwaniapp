/* ========================================
   🎨 واجهة المستخدم - نظام ديواني
   ======================================== */

// ===== نظام مؤشرات التحميل =====

/**
 * عرض مؤشر التحميل
 * @param {string} message - رسالة التحميل
 */
function showLoading(message = 'جاري التحميل...') {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-content">
                    <div class="spinner"></div>
                    <p class="loader-message">${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        loader.querySelector('.loader-message').textContent = message;
        loader.style.display = 'block';
    }
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * تحديث رسالة التحميل
 * @param {string} message - الرسالة الجديدة
 */
function updateLoadingMessage(message) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.querySelector('.loader-message').textContent = message;
    }
}

// ===== نظام الحوار الاحترافي =====

/**
 * عرض حوار تأكيد
 * @param {Object} options - خيارات الحوار
 * @returns {Promise<boolean>}
 */
function showConfirmDialog(options = {}) {
    const {
        title = 'تأكيد العملية',
        message = 'هل أنت متأكد من رغبتك في تنفيذ هذه العملية؟',
        confirmText = 'تأكيد',
        cancelText = 'إلغاء',
        type = 'warning', // warning, danger, info, success
        icon = '⚠️'
    } = options;

    return new Promise((resolve) => {
        const overlay = document.getElementById('confirm-overlay');
        const dialog = overlay.querySelector('.confirm-dialog');
        const iconEl = document.getElementById('confirm-icon');
        const titleEl = document.getElementById('confirm-title');
        const bodyEl = document.getElementById('confirm-body');
        const confirmBtn = document.getElementById('confirm-btn-confirm');
        const cancelBtn = document.getElementById('confirm-btn-cancel');

        // تعيين المحتوى
        iconEl.textContent = icon;
        titleEl.textContent = title;
        bodyEl.textContent = message;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        // تعيين الألوان حسب النوع
        dialog.className = 'confirm-dialog';
        dialog.classList.add(`confirm-${type}`);

        // عرض الحوار
        overlay.style.display = 'flex';

        // معالجة الأحداث
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                handleCancel();
            }
        };

        const cleanup = () => {
            overlay.style.display = 'none';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleEscape);
            overlay.removeEventListener('click', handleOverlayClick);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('keydown', handleEscape);
        overlay.addEventListener('click', handleOverlayClick);
    });
}

// ===== دوال الشريط الجانبي =====

/**
 * تبديل الشريط الجانبي
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

/**
 * إغلاق الشريط الجانبي على الجوال
 */
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
}

// ===== دوال عرض الأقسام =====

/**
 * عرض قسم معين
 * @param {string} sectionId - معرف القسم
 */
async function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // إزالة التحديد من جميع الأزرار
    document.querySelectorAll('.sidebar-nav button').forEach(button => {
        button.classList.remove('active');
    });

    // عرض القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // تحديد الزر المناسب
    const activeButton = Array.from(document.querySelectorAll('.sidebar-nav button')).find(
        btn => btn.getAttribute('onclick') === `showSection('${sectionId}')`
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // إغلاق الشريط الجانبي على الجوال
    closeSidebarOnMobile();

    // تنفيذ إجراءات خاصة بكل قسم
    await handleSectionSpecificActions(sectionId);
}

/**
 * معالجة الإجراءات الخاصة بكل قسم
 * @param {string} sectionId - معرف القسم
 */
async function handleSectionSpecificActions(sectionId) {
    switch (sectionId) {
        case 'items':
            if (typeof renderItems === 'function') renderItems();
            if (typeof generateItemCode === 'function') generateItemCode();
            break;
        case 'customers':
            if (typeof renderCustomers === 'function') renderCustomers();
            if (typeof generateCustomerCode === 'function') generateCustomerCode();
            break;
        case 'suppliers':
            if (typeof renderSuppliers === 'function') renderSuppliers();
            if (typeof generateSupplierCode === 'function') generateSupplierCode();
            break;
        case 'sales':
            if (typeof renderSales === 'function') renderSales();
            if (typeof updateSaleDropdowns === 'function') updateSaleDropdowns();
            if (typeof generateSaleCode === 'function') generateSaleCode();
            break;
        case 'purchases':
            if (typeof renderPurchases === 'function') renderPurchases();
            if (typeof updatePurchaseDropdowns === 'function') updatePurchaseDropdowns();
            if (typeof generatePurchaseCode === 'function') generatePurchaseCode();
            break;
        case 'advanced-dashboard':
            if (typeof initAdvancedDashboard === 'function') initAdvancedDashboard();
            break;
        case 'reports':
            if (typeof updateReportItemFilter === 'function') updateReportItemFilter();
            if (typeof changeReportType === 'function') changeReportType();
            break;
    }
}

// ===== دوال النوافذ المنبثقة =====

/**
 * فتح نافذة منبثقة
 * @param {string} overlayId - معرف النافذة
 */
function openModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} overlayId - معرف النافذة
 */
function closeModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===== دوال التمرير =====

/**
 * التمرير إلى عنصر
 * @param {string} elementId - معرف العنصر
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * التمرير إلى الأعلى
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== دوال التركيز =====

/**
 * التركيز على حقل
 * @param {string} fieldId - معرف الحقل
 */
function focusField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.focus();
        field.select();
    }
}

// ===== دوال التنسيق =====

/**
 * تطبيق تنسيق على حقل
 * @param {string} fieldId - معرف الحقل
 * @param {string} className - اسم الفئة
 */
function applyFieldStyle(fieldId, className) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.className = className;
    }
}

/**
 * إزالة تنسيق من حقل
 * @param {string} fieldId - معرف الحقل
 * @param {string} className - اسم الفئة
 */
function removeFieldStyle(fieldId, className) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove(className);
    }
}

// ===== دوال مساعدة =====

/**
 * تفعيل/تعطيل زر
 * @param {string} buttonId - معرف الزر
 * @param {boolean} enabled - مفعّل أم لا
 */
function setButtonEnabled(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = !enabled;
    }
}

/**
 * عرض/إخفاء عنصر
 * @param {string} elementId - معرف العنصر
 * @param {boolean} visible - مرئي أم لا
 */
function setElementVisible(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
}

debugLog('✅ تم تحميل وحدة واجهة المستخدم');
