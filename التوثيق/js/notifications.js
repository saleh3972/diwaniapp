/* ========================================
   🔔 نظام الإشعارات - نظام ديواني
   ======================================== */

// ===== المتغيرات =====
if (typeof notifications === 'undefined') var notifications = [];
const LOW_STOCK_THRESHOLD = 5; // حد التنبيه لانخفاض المخزون

// متغيرات مطلوبة (إذا لم تكن موجودة)
if (typeof items === 'undefined') var items = [];
if (typeof sales === 'undefined') var sales = [];

// ===== الدوال الأساسية =====

/**
 * عرض إشعار
 * @param {string} title - العنوان
 * @param {string} message - الرسالة
 * @param {string} type - النوع (success, warning, error, info)
 * @param {number} duration - المدة بالميلي ثانية
 * @returns {HTMLElement}
 */
function showNotification(title, message, type = 'info', duration = 5000) {
    const container = document.getElementById('notifications-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close" onclick="closeNotification(this)">✖</div>
    `;
    
    container.appendChild(notification);
    
    // إزالة تلقائية بعد المدة المحددة
    setTimeout(() => {
        if (notification.parentElement) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, duration);
    
    // تسجيل الإشعار
    notifications.push({
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString()
    });
    
    return notification;
}

/**
 * إنشاء حاوية الإشعارات
 * @returns {HTMLElement}
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notifications-container';
    document.body.appendChild(container);
    return container;
}

/**
 * إغلاق إشعار
 * @param {HTMLElement} closeButton - زر الإغلاق
 */
function closeNotification(closeButton) {
    const notification = closeButton.closest('.notification');
    if (notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// ===== إشعارات المخزون =====

/**
 * فحص المخزون المنخفض
 */
function checkLowStock() {
    const lowStockItems = items.filter(item => item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0);
    const outOfStockItems = items.filter(item => item.stock <= 0);
    
    if (outOfStockItems.length > 0) {
        showNotification(
            '🚨 تنبيه: أصناف نفذت',
            `${outOfStockItems.length} صنف نفذ من المخزون. يرجى إعادة التزويد فوراً.`,
            'error',
            8000
        );
    }
    
    if (lowStockItems.length > 0) {
        showNotification(
            '⚠️ تحذير: مخزون منخفض',
            `${lowStockItems.length} صنف على وشك النفاد (أقل من ${LOW_STOCK_THRESHOLD} وحدات).`,
            'warning',
            7000
        );
    }
}

/**
 * فحص الديون غير المدفوعة
 */
function checkUnpaidDebts() {
    const unpaidSales = sales.filter(s => s.remainingAmount > 0);
    
    if (unpaidSales.length > 0) {
        const totalDebt = unpaidSales.reduce((sum, sale) => sum + sale.remainingAmount, 0);
        showNotification(
            '💰 تنبيه: ديون غير مدفوعة',
            `لديك ${unpaidSales.length} فاتورة بإجمالي ${totalDebt.toFixed(2)} ريال غير مدفوع.`,
            'warning',
            6000
        );
    }
}

/**
 * إشعار نجاح العملية
 * @param {string} operation - العملية
 */
function notifySuccess(operation) {
    showNotification(
        '✅ نجحت العملية',
        `تم ${operation} بنجاح`,
        'success',
        3000
    );
}

/**
 * إشعار خطأ
 * @param {string} operation - العملية
 * @param {string} details - التفاصيل
 */
function notifyError(operation, details = '') {
    showNotification(
        '❌ فشلت العملية',
        `حدث خطأ أثناء ${operation}. ${details}`,
        'error',
        5000
    );
}

/**
 * إشعار تحذير
 * @param {string} title - العنوان
 * @param {string} message - الرسالة
 */
function notifyWarning(title, message) {
    showNotification(title, message, 'warning', 5000);
}

/**
 * إشعار معلومات
 * @param {string} title - العنوان
 * @param {string} message - الرسالة
 */
function notifyInfo(title, message) {
    showNotification(title, message, 'info', 4000);
}

// ===== دوال مساعدة =====

/**
 * مسح جميع الإشعارات
 */
function clearAllNotifications() {
    const container = document.getElementById('notifications-container');
    if (container) {
        container.innerHTML = '';
    }
    notifications = [];
}

/**
 * الحصول على عدد الإشعارات
 * @returns {number}
 */
function getNotificationsCount() {
    return notifications.length;
}

/**
 * الحصول على آخر الإشعارات
 * @param {number} count - العدد
 * @returns {Array}
 */
function getRecentNotifications(count = 10) {
    return notifications.slice(-count).reverse();
}

debugLog('✅ تم تحميل نظام الإشعارات');
