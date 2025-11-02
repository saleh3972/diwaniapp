/* ========================================
   🔥 Firebase - نظام ديواني
   ======================================== */

// === إعداد Firebase ===
if (typeof firebaseConfig === 'undefined') {
    var firebaseConfig = {
        apiKey: "AIzaSyDtm443qVDGFOH7NIFgaxVWPhhW5Ezrfrw",
        authDomain: "diwani-bc43f.firebaseapp.com",
        databaseURL: "https://diwani-bc43f-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "diwani-bc43f",
        storageBucket: "diwani-bc43f.firebasestorage.app",
        messagingSenderId: "796547946795",
        appId: "1:796547946795:web:fe9d572923625463dc0d6e",
        measurementId: "G-VEZFJDN2LB"
    };
}

// تهيئة Firebase (فقط إذا لم يتم تهيئته)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

const FIREBASE_SHARED_ROOT = 'shared_activities';

// متغيرات مطلوبة (إذا لم تكن موجودة)
if (typeof currentActivityId === 'undefined') var currentActivityId = null;
if (typeof users === 'undefined') var users = [];
if (typeof activities === 'undefined') var activities = [];

// ===== دوال Firebase الأساسية =====

/**
 * حفظ بيانات إلى Firebase
 * @param {string} path - المسار
 * @param {*} data - البيانات
 * @returns {Promise<boolean>}
 */
async function firebaseSet(path, data) {
    try {
        showLoading('جاري الحفظ...');
        await database.ref(path).set(data);
        hideLoading();
        debugLog('✅ تم الحفظ في Firebase:', path);
        return true;
    } catch (error) {
        hideLoading();
        logError('Firebase Set', error);
        return false;
    }
}

/**
 * قراءة بيانات من Firebase
 * @param {string} path - المسار
 * @returns {Promise<any>}
 */
async function firebaseGet(path) {
    try {
        const snapshot = await database.ref(path).once('value');
        const data = snapshot.val();
        debugLog('✅ تم القراءة من Firebase:', path, data);
        return data;
    } catch (error) {
        logError('Firebase Get', error);
        return null;
    }
}

/**
 * حذف بيانات من Firebase
 * @param {string} path - المسار
 * @returns {Promise<boolean>}
 */
async function firebaseRemove(path) {
    try {
        await database.ref(path).remove();
        debugLog('✅ تم الحذف من Firebase:', path);
        return true;
    } catch (error) {
        logError('Firebase Remove', error);
        return false;
    }
}

/**
 * تحديث بيانات في Firebase
 * @param {string} path - المسار
 * @param {Object} updates - التحديثات
 * @returns {Promise<boolean>}
 */
async function firebaseUpdate(path, updates) {
    try {
        await database.ref(path).update(updates);
        debugLog('✅ تم التحديث في Firebase:', path);
        return true;
    } catch (error) {
        logError('Firebase Update', error);
        return false;
    }
}

// ===== دوال خاصة بالنشاط =====

/**
 * الحصول على مسار البيانات للنشاط الحالي
 * @param {string} dataType - نوع البيانات
 * @returns {string}
 */
function getActivityPath(dataType) {
    if (!currentActivityId) {
        console.error('❌ لا يوجد نشاط محدد');
        return null;
    }
    return `${FIREBASE_SHARED_ROOT}/${currentActivityId}/${dataType}`;
}

/**
 * حفظ بيانات للنشاط الحالي
 * @param {string} dataType - نوع البيانات
 * @param {*} data - البيانات
 * @returns {Promise<boolean>}
 */
async function saveToFirebase(dataType, data) {
    const path = getActivityPath(dataType);
    if (!path) return false;
    return await firebaseSet(path, data);
}

/**
 * قراءة بيانات من النشاط الحالي
 * @param {string} dataType - نوع البيانات
 * @returns {Promise<any>}
 */
async function loadFromFirebase(dataType) {
    const path = getActivityPath(dataType);
    if (!path) return null;
    return await firebaseGet(path);
}

// ===== دوال المستخدمين =====

/**
 * حفظ المستخدمين
 * @returns {Promise<boolean>}
 */
async function saveUsers() {
    return await firebaseSet('diwan_users', users);
}

/**
 * تحميل المستخدمين
 * @returns {Promise<void>}
 */
async function loadUsers() {
    const data = await firebaseGet('diwan_users');
    users = data || [];
    debugLog('👥 تم تحميل المستخدمين:', users.length);
}

// ===== دوال الأنشطة =====

/**
 * حفظ الأنشطة
 * @returns {Promise<boolean>}
 */
async function saveActivities() {
    const success = await firebaseSet('diwan_activities', activities);
    if (success) {
        await loadActivities();
    }
    return success;
}

/**
 * تحميل الأنشطة
 * @returns {Promise<void>}
 */
async function loadActivities() {
    activities = (await firebaseGet('diwan_activities')) || [];
    const activitySelect = document.getElementById('userActivitySelect');
    if (activitySelect) {
        activitySelect.innerHTML = '<option value="">-- اختر النشاط التجاري أولاً --</option>';
        activities.forEach(act => {
            activitySelect.innerHTML += `<option value="${act.id}">${act.name}</option>`;
        });
    }
    debugLog('🏢 تم تحميل الأنشطة:', activities.length);
}

// ===== دوال التهيئة =====

/**
 * تهيئة Firebase عند بدء التطبيق
 */
async function initializeFirebase() {
    try {
        debugLog('🔥 جاري تهيئة Firebase...');
        await loadUsers();
        await loadActivities();
        debugLog('✅ تم تهيئة Firebase بنجاح');
        return true;
    } catch (error) {
        logError('Firebase Initialization', error);
        return false;
    }
}

debugLog('✅ تم تحميل وحدة Firebase');
