/* ===============================
   NAVIGATION
================================ */
document.getElementById("backBtn").onclick = () => {
    window.history.back();
};

/* ===============================
   LOGOUT
================================ */
document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "../../auth/login/index.html";
};

/* ===============================
   CAPTCHA SYSTEM
================================ */
let captcha = "";
let captchaPin = "";

function generateCaptcha() {
    captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("captchaText").innerText = captcha;
}

function generateCaptchaPin() {
    captchaPin = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("captchaTextPin").innerText = captchaPin;
}

document.getElementById("refreshCaptcha").onclick = generateCaptcha;
document.getElementById("refreshCaptchaPin").onclick = generateCaptchaPin;

/* ===============================
   VALIDATION
================================ */
function validatePasswordCaptcha() {
    const input = document.getElementById("captchaInputPassword").value.toUpperCase();
    return input === captcha;
}

function validatePinCaptcha() {
    const input = document.getElementById("captchaInputPin").value.toUpperCase();
    return input === captchaPin;
}

/* ===============================
   UPDATE PASSWORD
================================ */
document.getElementById("updatePasswordBtn").onclick = () => {

    const pass = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!pass || pass.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    if (pass !== confirm) {
        alert("Passwords do not match");
        return;
    }

    if (!validatePasswordCaptcha()) {
        alert("Invalid captcha");
        generateCaptcha();
        return;
    }

    // TODO: API CALL
    console.log("Password updated");

    alert("Password updated (demo)");
};

/* ===============================
   UPDATE PIN
================================ */
document.getElementById("updatePinBtn").onclick = () => {

    const pin = document.getElementById("newPin").value;

    if (!/^\d{4}$/.test(pin)) {
        alert("PIN must be 4 digits");
        return;
    }

    if (!validatePinCaptcha()) {
        alert("Invalid captcha");
        generateCaptchaPin();
        return;
    }

    // TODO: API CALL
    console.log("PIN updated");

    alert("PIN updated (demo)");
};

/* ===============================
   INIT
================================ */
window.onload = () => {
    generateCaptcha();
    generateCaptchaPin();
};