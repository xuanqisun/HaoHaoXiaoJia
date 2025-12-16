// auth.js - 全局安全守卫
const SECRET_PASSWORD = 'loveu'; // 你的暗号

function checkAccess() {
    const isAuth = sessionStorage.getItem('isLoggedIn');
    const path = window.location.pathname;
    
    // 如果未登录且不在首页，强制跳转回首页
    if (!isAuth && !path.endsWith('index.html') && path !== '/') {
        window.location.href = 'index.html';
    }
}

// 登录函数
function login(inputPass) {
    if (inputPass === SECRET_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        return true;
    }
    return false;
}

// 退出登录
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.reload();
}

checkAccess();