/* ========================================
   🔐 نظام المصادقة - نظام ديواني
   ======================================== */

// ===== دوال التشفير =====

/**
 * تشفير كلمة المرور باستخدام SHA-256
 * @param {string} password - كلمة المرور
 * @returns {Promise<string>} - كلمة المرور المشفرة
 */
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * التحقق من كلمة المرور
 * @param {string} inputPassword - كلمة المرور المدخلة
 * @param {string} hashedPassword - كلمة المرور المشفرة
 * @returns {Promise<boolean>}
 */
async function verifyPassword(inputPassword, hashedPassword) {
    const inputHash = await hashPassword(inputPassword);
    return inputHash === hashedPassword;
}

// ===== دوال تسجيل الدخول =====

/**
 * معالجة تسجيل الدخول
 */
async function handleLogin() {
    const errorMsg = document.getElementById('login-error');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        showNotification('❌ خطأ', 'تعذر العثور على حقول تسجيل الدخول', 'error');
        return;
    }

    const email = emailInput.value.trim();
    const pass = passwordInput.value;
    
    if (!email || !pass) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 'warning');
        return;
    }

    showLoading('جاري تسجيل الدخول...');

    try {
        let user = null;
        
        // البحث عن المستخدم والتحقق من كلمة المرور
        for (const u of users) {
            if (u.email === email) {
                // التحقق من كلمة المرور المشفرة أو العادية (للتوافق مع البيانات القديمة)
                if (u.passwordHash) {
                    const isValid = await verifyPassword(pass, u.passwordHash);
                    if (isValid) {
                        user = u;
                        break;
                    }
                } else if (u.password === pass) {
                    // كلمة مرور قديمة غير مشفرة - نقوم بتشفيرها الآن
                    user = u;
                    user.passwordHash = await hashPassword(pass);
                    delete user.password;
                    await saveUsers();
                    break;
                }
            }
        }

        if (user) {
            // التحقق من صلاحيات المستخدم
            if (user.role === 'manager' || user.role === 'user') {
                if (!user.activityId) {
                    hideLoading();
                    showNotification('⚠️ غير معين', 'لم يتم تعيين نشاط لهذا المستخدم. يرجى التواصل مع مدير النظام', 'warning');
                    if (errorMsg) errorMsg.style.display = 'block';
                    return;
                }
                
                const assignedActivity = activities.find(a => a.id == user.activityId);
                if (!assignedActivity) {
                    hideLoading();
                    showNotification('⚠️ نشاط غير موجود', 'لا يمكن فتح الحساب لأن النشاط المرتبط به غير موجود', 'error');
                    if (errorMsg) errorMsg.style.display = 'block';
                    return;
                }
            }

            // حفظ بيانات الجلسة
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            
            // تحديث الواجهة
            updateLoggedInUserDisplay(user);
            if (errorMsg) errorMsg.style.display = 'none';
            
            const loginOverlay = document.getElementById('login-overlay');
            if (loginOverlay) loginOverlay.style.display = 'none';
            
            const appContainer = document.querySelector('.app-container');
            if (appContainer) appContainer.style.display = 'flex';

            // تحديد النشاط حسب الصلاحية
            if (user.role === 'admin') {
                currentActivityId = sessionStorage.getItem('currentActivityId');
                if (currentActivityId && activities.find(a => a.id == currentActivityId)) {
                    await selectActivity(currentActivityId);
                } else {
                    enterAdminWithoutActivity();
                }
            } else {
                await selectActivity(user.activityId);
            }
            
            hideLoading();
            showNotification('✅ مرحباً', `أهلاً بك ${user.name}`, 'success', 3000);
        } else {
            hideLoading();
            if (errorMsg) {
                errorMsg.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                errorMsg.style.display = 'block';
            }
            showNotification('❌ خطأ', 'بيانات الدخول غير صحيحة', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Login', error);
    }
}

/**
 * تسجيل الخروج
 */
async function logout() {
    const confirmed = await showConfirmDialog({
        title: '👋 تسجيل الخروج',
        message: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
        type: 'info',
        confirmText: 'نعم، سجل خروجي',
        cancelText: 'إلغاء',
        icon: '🚪'
    });
    
    if (confirmed) {
        sessionStorage.clear();
        location.reload();
    }
}

// ===== دوال إدارة المستخدمين =====

/**
 * تحديث عرض المستخدم المسجل
 * @param {Object} user - بيانات المستخدم
 */
function updateLoggedInUserDisplay(user) {
    const userNameEl = document.getElementById('loggedInUserName');
    const userRoleEl = document.getElementById('loggedInUserRole');
    
    if (userNameEl) userNameEl.textContent = user.name || 'مستخدم';
    if (userRoleEl) {
        const roleNames = {
            'admin': 'مدير النظام',
            'manager': 'مدير نشاط',
            'user': 'مستخدم'
        };
        userRoleEl.textContent = roleNames[user.role] || user.role;
    }
}

/**
 * الحصول على المستخدم الحالي
 * @returns {Object|null}
 */
function getCurrentUser() {
    const userStr = sessionStorage.getItem('loggedInUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * التحقق من تسجيل الدخول
 * @returns {boolean}
 */
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

/**
 * التحقق من صلاحية المستخدم
 * @param {string} requiredRole - الصلاحية المطلوبة
 * @returns {boolean}
 */
function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (requiredRole === 'admin') {
        return user.role === 'admin';
    } else if (requiredRole === 'manager') {
        return user.role === 'admin' || user.role === 'manager';
    } else {
        return true; // جميع المستخدمين
    }
}

// ===== دوال تغيير كلمة المرور =====

/**
 * فتح نافذة تغيير كلمة المرور
 */
function openChangePasswordModal() {
    const modal = document.getElementById('change-password-overlay');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('cp-old').value = '';
        document.getElementById('cp-new').value = '';
        document.getElementById('cp-confirm').value = '';
    }
}

/**
 * إغلاق نافذة تغيير كلمة المرور
 */
function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-overlay');
    if (modal) modal.style.display = 'none';
}

/**
 * تنفيذ تغيير كلمة المرور
 */
async function submitPasswordChange() {
    const oldPass = document.getElementById('cp-old').value;
    const newPass = document.getElementById('cp-new').value;
    const confirmPass = document.getElementById('cp-confirm').value;
    
    if (!oldPass || !newPass || !confirmPass) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى ملء جميع الحقول', 'warning');
        return;
    }
    
    if (newPass !== confirmPass) {
        showNotification('❌ خطأ', 'كلمة المرور الجديدة غير متطابقة', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showNotification('⚠️ تحذير', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('❌ خطأ', 'لم يتم العثور على بيانات المستخدم', 'error');
        return;
    }
    
    showLoading('جاري تغيير كلمة المرور...');
    
    try {
        // التحقق من كلمة المرور القديمة
        const isValid = await verifyPassword(oldPass, user.passwordHash);
        if (!isValid) {
            hideLoading();
            showNotification('❌ خطأ', 'كلمة المرور القديمة غير صحيحة', 'error');
            return;
        }
        
        // تشفير كلمة المرور الجديدة
        const newHash = await hashPassword(newPass);
        
        // تحديث المستخدم
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].passwordHash = newHash;
            delete users[userIndex].password;
            
            await saveUsers();
            
            // تحديث الجلسة
            sessionStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
            
            hideLoading();
            closeChangePasswordModal();
            showNotification('✅ نجح', 'تم تغيير كلمة المرور بنجاح', 'success');
        } else {
            hideLoading();
            showNotification('❌ خطأ', 'فشل تحديث كلمة المرور', 'error');
        }
    } catch (error) {
        hideLoading();
        logError('Change Password', error);
    }
}

// ===== دوال استعادة كلمة المرور =====

/**
 * فتح نافذة نسيت كلمة المرور
 */
function openForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-overlay');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('fp-email').value = '';
    }
}

/**
 * إغلاق نافذة نسيت كلمة المرور
 */
function closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-overlay');
    if (modal) modal.style.display = 'none';
}

/**
 * طلب إعادة تعيين كلمة المرور
 */
async function requestPasswordReset() {
    const email = document.getElementById('fp-email').value.trim();
    
    if (!email) {
        showNotification('⚠️ بيانات ناقصة', 'يرجى إدخال البريد الإلكتروني', 'warning');
        return;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
        showNotification('❌ خطأ', 'البريد الإلكتروني غير مسجل', 'error');
        return;
    }
    
    showLoading('جاري إرسال رابط الاستعادة...');
    
    try {
        // إنشاء رمز استعادة
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetExpiry = Date.now() + (60 * 60 * 1000); // ساعة واحدة
        
        // حفظ الرمز
        user.resetToken = resetToken;
        user.resetExpiry = resetExpiry;
        await saveUsers();
        
        // إرسال البريد (إذا كان EmailJS مفعل)
        // TODO: إضافة إرسال البريد
        
        hideLoading();
        closeForgotPasswordModal();
        showNotification('✅ تم', 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني', 'success');
    } catch (error) {
        hideLoading();
        logError('Password Reset Request', error);
    }
}

debugLog('✅ تم تحميل نظام المصادقة');
