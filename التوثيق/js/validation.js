/* ========================================
   ✅ نظام التحقق من المدخلات - نظام ديواني
   ======================================== */

// ===== ValidationHelper Class =====

class ValidationHelper {
    /**
     * التحقق من أن القيمة ليست فارغة
     * @param {*} value - القيمة
     * @returns {boolean}
     */
    static isNotEmpty(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !isNaN(value);
        return true;
    }

    /**
     * التحقق من صحة البريد الإلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {boolean}
     */
    static isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * التحقق من رقم الجوال السعودي
     * @param {string} phone - رقم الجوال
     * @returns {boolean}
     */
    static isValidSaudiPhone(phone) {
        if (!phone) return false;
        const cleanPhone = phone.replace(/\s+/g, '');
        const saudiPhoneRegex = /^(05|5)[0-9]{8}$/;
        return saudiPhoneRegex.test(cleanPhone);
    }

    /**
     * التحقق من أن الرقم موجب
     * @param {number} value - الرقم
     * @returns {boolean}
     */
    static isPositiveNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    }

    /**
     * التحقق من أن الرقم صفر أو موجب
     * @param {number} value - الرقم
     * @returns {boolean}
     */
    static isNonNegativeNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
    }

    /**
     * التحقق من طول النص
     * @param {string} text - النص
     * @param {number} minLength - الحد الأدنى
     * @param {number} maxLength - الحد الأقصى
     * @returns {boolean}
     */
    static isValidLength(text, minLength = 0, maxLength = Infinity) {
        if (!text) return minLength === 0;
        const length = text.trim().length;
        return length >= minLength && length <= maxLength;
    }

    /**
     * التحقق من صحة التاريخ
     * @param {string} dateString - التاريخ
     * @returns {boolean}
     */
    static isValidDate(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * التحقق من أن التاريخ ليس في المستقبل
     * @param {string} dateString - التاريخ
     * @returns {boolean}
     */
    static isNotFutureDate(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
    }

    /**
     * التحقق من صحة الرقم الضريبي السعودي
     * @param {string} taxNumber - الرقم الضريبي
     * @returns {boolean}
     */
    static isValidSaudiTaxNumber(taxNumber) {
        if (!taxNumber) return false;
        const cleanNumber = taxNumber.replace(/\s+/g, '');
        return /^3\d{14}$/.test(cleanNumber);
    }

    /**
     * التحقق من صحة IBAN السعودي
     * @param {string} iban - رقم IBAN
     * @returns {boolean}
     */
    static isValidSaudiIBAN(iban) {
        if (!iban) return false;
        const cleanIBAN = iban.replace(/\s+/g, '').toUpperCase();
        return /^SA\d{22}$/.test(cleanIBAN);
    }

    /**
     * تنظيف النص من المسافات الزائدة
     * @param {string} text - النص
     * @returns {string}
     */
    static sanitizeText(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    }

    /**
     * التحقق من تطابق قيمتين
     * @param {*} value1 - القيمة الأولى
     * @param {*} value2 - القيمة الثانية
     * @returns {boolean}
     */
    static areEqual(value1, value2) {
        return value1 === value2;
    }

    /**
     * التحقق من أن القيمة ضمن نطاق
     * @param {number} value - القيمة
     * @param {number} min - الحد الأدنى
     * @param {number} max - الحد الأقصى
     * @returns {boolean}
     */
    static isInRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * التحقق من صحة كلمة المرور
     * @param {string} password - كلمة المرور
     * @param {number} minLength - الحد الأدنى للطول
     * @returns {Object} - {valid: boolean, message: string}
     */
    static validatePassword(password, minLength = 6) {
        if (!password) {
            return { valid: false, message: 'كلمة المرور مطلوبة' };
        }
        
        if (password.length < minLength) {
            return { valid: false, message: `كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل` };
        }
        
        return { valid: true, message: 'كلمة المرور صالحة' };
    }

    /**
     * التحقق من صحة نموذج
     * @param {Object} formData - بيانات النموذج
     * @param {Object} rules - قواعد التحقق
     * @returns {Object} - {valid: boolean, errors: Object}
     */
    static validateForm(formData, rules) {
        const errors = {};
        let valid = true;

        for (const field in rules) {
            const value = formData[field];
            const fieldRules = rules[field];

            if (fieldRules.required && !this.isNotEmpty(value)) {
                errors[field] = fieldRules.requiredMessage || `${field} مطلوب`;
                valid = false;
                continue;
            }

            if (fieldRules.email && value && !this.isValidEmail(value)) {
                errors[field] = 'البريد الإلكتروني غير صالح';
                valid = false;
            }

            if (fieldRules.phone && value && !this.isValidSaudiPhone(value)) {
                errors[field] = 'رقم الجوال غير صالح';
                valid = false;
            }

            if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
                errors[field] = `يجب أن يكون ${fieldRules.minLength} أحرف على الأقل`;
                valid = false;
            }

            if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
                errors[field] = `يجب أن لا يتجاوز ${fieldRules.maxLength} حرف`;
                valid = false;
            }

            if (fieldRules.positive && value && !this.isPositiveNumber(value)) {
                errors[field] = 'يجب أن يكون رقم موجب';
                valid = false;
            }

            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customResult = fieldRules.custom(value);
                if (!customResult.valid) {
                    errors[field] = customResult.message;
                    valid = false;
                }
            }
        }

        return { valid, errors };
    }
}

// ===== دوال التحقق السريعة =====

/**
 * التحقق من حقل إدخال
 * @param {string} fieldId - معرف الحقل
 * @param {string} fieldName - اسم الحقل
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {boolean}
 */
function validateField(fieldId, fieldName, required = true) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const value = field.value.trim();

    if (required && !value) {
        showNotification('⚠️ حقل مطلوب', `يرجى إدخال ${fieldName}`, 'warning');
        field.focus();
        return false;
    }

    return true;
}

/**
 * التحقق من حقل رقمي
 * @param {string} fieldId - معرف الحقل
 * @param {string} fieldName - اسم الحقل
 * @param {boolean} allowZero - السماح بالصفر
 * @returns {boolean}
 */
function validateNumberField(fieldId, fieldName, allowZero = false) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const value = parseFloat(field.value);

    if (isNaN(value)) {
        showNotification('⚠️ قيمة غير صالحة', `${fieldName} يجب أن يكون رقماً`, 'warning');
        field.focus();
        return false;
    }

    if (!allowZero && value <= 0) {
        showNotification('⚠️ قيمة غير صالحة', `${fieldName} يجب أن يكون أكبر من صفر`, 'warning');
        field.focus();
        return false;
    }

    if (allowZero && value < 0) {
        showNotification('⚠️ قيمة غير صالحة', `${fieldName} لا يمكن أن يكون سالباً`, 'warning');
        field.focus();
        return false;
    }

    return true;
}

/**
 * التحقق من حقل بريد إلكتروني
 * @param {string} fieldId - معرف الحقل
 * @returns {boolean}
 */
function validateEmailField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const email = field.value.trim();

    if (!email) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال البريد الإلكتروني', 'warning');
        field.focus();
        return false;
    }

    if (!ValidationHelper.isValidEmail(email)) {
        showNotification('⚠️ بريد غير صالح', 'البريد الإلكتروني غير صحيح', 'warning');
        field.focus();
        return false;
    }

    return true;
}

/**
 * التحقق من حقل رقم جوال
 * @param {string} fieldId - معرف الحقل
 * @param {boolean} required - هل الحقل مطلوب
 * @returns {boolean}
 */
function validatePhoneField(fieldId, required = true) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const phone = field.value.trim();

    if (!phone && !required) return true;

    if (!phone && required) {
        showNotification('⚠️ حقل مطلوب', 'يرجى إدخال رقم الجوال', 'warning');
        field.focus();
        return false;
    }

    if (!ValidationHelper.isValidSaudiPhone(phone)) {
        showNotification('⚠️ رقم غير صالح', 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)', 'warning');
        field.focus();
        return false;
    }

    return true;
}

/**
 * إضافة تنسيق خطأ لحقل
 * @param {string} fieldId - معرف الحقل
 */
function markFieldAsInvalid(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#ff4757';
        field.style.backgroundColor = '#fff5f5';
    }
}

/**
 * إزالة تنسيق الخطأ من حقل
 * @param {string} fieldId - معرف الحقل
 */
function markFieldAsValid(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
    }
}

/**
 * مسح جميع أخطاء النموذج
 * @param {string[]} fieldIds - معرفات الحقول
 */
function clearFormErrors(fieldIds) {
    fieldIds.forEach(fieldId => markFieldAsValid(fieldId));
}

debugLog('✅ تم تحميل نظام التحقق من المدخلات');
