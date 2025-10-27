/* ========================================
   ⚙️ الإعدادات العامة - نظام ديواني
   ======================================== */

// ملاحظة: إعدادات Firebase موجودة في firebase.js

// إعدادات EmailJS
let emailJsConfig = {
    serviceID: '',
    templateID: '',
    resetTemplateID: '',
    publicKey: ''
};

// إعدادات النظام
const APP_CONFIG = {
    name: 'ديواني',
    version: '20.0',
    debug: false, // تفعيل وضع التطوير
    
    // إعدادات سلة المحذوفات
    trash: {
        retentionDays: 30, // عدد أيام الاحتفاظ بالعناصر المحذوفة
        autoCleanup: true  // تنظيف تلقائي
    },
    
    // إعدادات الإشعارات
    notifications: {
        duration: 3000,     // مدة عرض الإشعار (ميلي ثانية)
        position: 'top-right',
        lowStockThreshold: 10 // حد تنبيه المخزون المنخفض
    },
    
    // إعدادات الجداول
    tables: {
        itemsPerPage: 50,   // عدد العناصر في الصفحة
        enablePagination: false // تفعيل التقسيم إلى صفحات (مستقبلاً)
    },
    
    // إعدادات التقارير
    reports: {
        dateFormat: 'YYYY-MM-DD',
        currency: 'ر.س'
    }
};

// المتغيرات العامة للنظام (فقط إذا لم تكن معرّفة)
if (typeof currentActivityId === 'undefined') var currentActivityId = null;
if (typeof activities === 'undefined') var activities = [];
if (typeof users === 'undefined') var users = [];
if (typeof items === 'undefined') var items = [];
if (typeof customers === 'undefined') var customers = [];
if (typeof suppliers === 'undefined') var suppliers = [];
if (typeof purchases === 'undefined') var purchases = [];
if (typeof sales === 'undefined') var sales = [];
if (typeof expenses === 'undefined') var expenses = [];
if (typeof revenues === 'undefined') var revenues = [];
if (typeof salaries === 'undefined') var salaries = [];
if (typeof salesReturns === 'undefined') var salesReturns = [];
if (typeof purchaseReturns === 'undefined') var purchaseReturns = [];
if (typeof notifications === 'undefined') var notifications = [];

// متغيرات التحرير (فقط إذا لم تكن معرّفة)
if (typeof editingItemId === 'undefined') var editingItemId = null;
if (typeof editingCustomerId === 'undefined') var editingCustomerId = null;
if (typeof editingSupplierId === 'undefined') var editingSupplierId = null;
if (typeof editingPurchaseId === 'undefined') var editingPurchaseId = null;
if (typeof editingSaleId === 'undefined') var editingSaleId = null;
if (typeof editingExpenseId === 'undefined') var editingExpenseId = null;
if (typeof editingRevenueId === 'undefined') var editingRevenueId = null;
if (typeof editingSalaryId === 'undefined') var editingSalaryId = null;

// دالة تحميل الإعدادات من localStorage
function loadEmailJsSettings() {
    const saved = localStorage.getItem('emailJsConfig');
    if (saved) {
        try {
            emailJsConfig = JSON.parse(saved);
            debugLog('✅ تم تحميل إعدادات EmailJS');
        } catch (e) {
            debugLog('❌ خطأ في تحميل إعدادات EmailJS:', e);
        }
    }
}

// دالة حفظ الإعدادات
function saveEmailJsSettings() {
    localStorage.setItem('emailJsConfig', JSON.stringify(emailJsConfig));
    debugLog('✅ تم حفظ إعدادات EmailJS');
}

// دالة طباعة رسائل التطوير
function debugLog(...args) {
    if (APP_CONFIG.debug) {
        console.log('[DEBUG]', ...args);
    }
}

// تحميل الإعدادات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadEmailJsSettings();
    debugLog('⚙️ تم تحميل الإعدادات العامة');
});
