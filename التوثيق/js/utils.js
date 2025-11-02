/* ========================================
   🛠️ الدوال المساعدة - نظام ديواني
   ======================================== */

// ===== دوال التاريخ والوقت =====

/**
 * الحصول على آخر 7 أيام
 * @returns {Array<string>} مصفوفة التواريخ
 */
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

/**
 * تنسيق التاريخ
 * @param {string} dateString - التاريخ بصيغة ISO
 * @returns {string} التاريخ المنسق
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * الحصول على الشهر الحالي
 * @returns {string} الشهر بصيغة YYYY-MM
 */
function getCurrentMonth() {
    return new Date().toISOString().substring(0, 7);
}

/**
 * الحصول على اليوم الحالي
 * @returns {string} اليوم بصيغة YYYY-MM-DD
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// ===== دوال الأرقام والعملات =====

/**
 * تنسيق الأرقام بفواصل
 * @param {number} num - الرقم
 * @returns {string} الرقم المنسق
 */
function formatNumber(num) {
    return num.toLocaleString('ar-SA', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    });
}

/**
 * تنسيق العملة
 * @param {number} amount - المبلغ
 * @returns {string} المبلغ مع العملة
 */
function formatCurrency(amount) {
    return `${formatNumber(amount)} ${APP_CONFIG.reports.currency}`;
}

// ===== دوال النصوص =====

/**
 * تنظيف النص
 * @param {string} text - النص
 * @returns {string} النص المنظف
 */
function cleanText(text) {
    return text ? text.trim() : '';
}

/**
 * اختصار النص
 * @param {string} text - النص
 * @param {number} maxLength - الطول الأقصى
 * @returns {string} النص المختصر
 */
function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ===== دوال الهاتف =====

/**
 * تنسيق رقم الهاتف للواتساب
 * @param {string} phone - رقم الهاتف
 * @returns {string|null} الرقم المنسق أو null
 */
function formatPhoneNumberForWhatsApp(phone) {
    if (!phone) return null;

    // إزالة أي مسافات أو شرطات أو علامة +
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // إذا كان الرقم يبدأ بـ 05 (الشكل السعودي المحلي)
    if (cleaned.startsWith('05')) {
        return '966' + cleaned.substring(1);
    }

    // إذا كان الرقم يبدأ بـ 5 مباشرة
    if (cleaned.length === 9 && cleaned.startsWith('5')) {
        return '966' + cleaned;
    }

    // إذا كان الرقم مكتوباً بالشكل الدولي الصحيح بالفعل
    if (cleaned.startsWith('966')) {
        return cleaned;
    }

    // إذا لم يتعرف على الصيغة، أرجع الرقم كما هو
    return cleaned;
}

// ===== دوال المصفوفات =====

/**
 * البحث في مصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} searchTerm - نص البحث
 * @param {Array<string>} fields - الحقول المراد البحث فيها
 * @returns {Array} النتائج
 */
function searchArray(array, searchTerm, fields) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(term);
        });
    });
}

/**
 * ترتيب مصفوفة
 * @param {Array} array - المصفوفة
 * @param {string} field - الحقل
 * @param {string} order - الترتيب (asc/desc)
 * @returns {Array} المصفوفة المرتبة
 */
function sortArray(array, field, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// ===== دوال التحقق =====

/**
 * التحقق من وجود قيمة
 * @param {*} value - القيمة
 * @returns {boolean}
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * التحقق من صحة رقم الجوال السعودي
 * @param {string} phone - رقم الجوال
 * @returns {boolean}
 */
function isValidSaudiPhone(phone) {
    const cleaned = phone.replace(/[\s\-+]/g, '');
    const regex = /^(05|5|\+9665|9665)[0-9]{8}$/;
    return regex.test(cleaned);
}

// ===== دوال التخزين =====

/**
 * حفظ في localStorage
 * @param {string} key - المفتاح
 * @param {*} value - القيمة
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('خطأ في الحفظ:', e);
        return false;
    }
}

/**
 * قراءة من localStorage
 * @param {string} key - المفتاح
 * @param {*} defaultValue - القيمة الافتراضية
 * @returns {*} القيمة
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('خطأ في القراءة:', e);
        return defaultValue;
    }
}

// ===== دوال الحسابات =====

/**
 * حساب النسبة المئوية
 * @param {number} value - القيمة
 * @param {number} total - الإجمالي
 * @returns {number} النسبة
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * حساب المتوسط
 * @param {Array<number>} numbers - الأرقام
 * @returns {number} المتوسط
 */
function calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum / numbers.length;
}

// ===== دوال التصدير =====

/**
 * تصدير إلى CSV
 * @param {Array} data - البيانات
 * @param {string} filename - اسم الملف
 */
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }
    
    // تحويل البيانات إلى CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');
    
    // تنزيل الملف
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${getCurrentDate()}.csv`;
    link.click();
}

// ===== دوال الطباعة =====

/**
 * طباعة عنصر HTML
 * @param {string} elementId - معرف العنصر
 */
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('العنصر غير موجود');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html dir="rtl"><head><title>طباعة</title>');
    printWindow.document.write('<style>body{font-family:Tajawal,Arial;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ===== دوال متنوعة =====

/**
 * توليد معرف فريد
 * @returns {number} المعرف
 */
function generateId() {
    return Date.now();
}

/**
 * نسخ نص إلى الحافظة
 * @param {string} text - النص
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('✅ تم النسخ', 'تم نسخ النص إلى الحافظة', 'success');
    } catch (e) {
        console.error('خطأ في النسخ:', e);
    }
}

/**
 * تأخير التنفيذ
 * @param {number} ms - المدة بالميلي ثانية
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

debugLog('✅ تم تحميل الدوال المساعدة');
