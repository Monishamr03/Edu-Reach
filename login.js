// EduReach - Login Logic

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const authMessage = document.getElementById("authMessage");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedRole = urlParams.get("role") || "student";

    console.log("EduReach login page loaded.");
    console.log("Selected role:", selectedRole);

    function showMessage(message, type) {
        if (!authMessage) return;

        authMessage.textContent = message;
        authMessage.className = "auth-message";

        if (type) {
            authMessage.classList.add(type);
        }

        authMessage.style.display = "block";
    }

    function hideMessage() {
        if (!authMessage) return;

        authMessage.textContent = "";
        authMessage.style.display = "none";
        authMessage.className = "auth-message";
    }

    function setLoading(isLoading) {
        if (!loginButton) return;

        loginButton.disabled = isLoading;
        loginButton.textContent = isLoading ? "Signing in..." : "Sign In";
        loginButton.style.opacity = isLoading ? "0.7" : "1";
        loginButton.style.cursor = isLoading ? "not-allowed" : "pointer";
    }

    if (typeof firebase === "undefined") {
        showMessage("Firebase could not be loaded. Please refresh the page.", "error");
        return;
    }

    if (typeof eduReachAuth === "undefined" || typeof eduReachDB === "undefined") {
        showMessage("EduReach authentication is not configured correctly.", "error");
        return;
    }

    async function loginUser() {
        hideMessage();

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!email) {
            showMessage("Please enter your email address.", "error");
            if (emailInput) emailInput.focus();
            return;
        }

        if (!password) {
            showMessage("Please enter your password.", "error");
            if (passwordInput) passwordInput.focus();
            return;
        }

        setLoading(true);

        try {
            const userCredential =
                await eduReachAuth.signInWithEmailAndPassword(email, password);

            const user = userCredential.user;

            const userDoc = await eduReachDB
                .collection("users")
                .doc(user.uid)
                .get();

            if (!userDoc.exists) {
                await eduReachAuth.signOut();
                showMessage(
                    "Your account exists, but your EduReach profile could not be found. Please contact the administrator.",
                    "error"
                );
                setLoading(false);
                return;
            }

            const profile = userDoc.data();
            const actualRole = profile.role;

            if (!actualRole) {
                await eduReachAuth.signOut();
                showMessage(
                    "Your account does not have a valid role. Please contact the administrator.",
                    "error"
                );
                setLoading(false);
                return;
            }

            if (actualRole !== selectedRole) {
                await eduReachAuth.signOut();
                showMessage(
                    "This account is registered as " + actualRole +
                    ". Please use the correct login option.",
                    "error"
                );
                setLoading(false);
                return;
            }

            // IMPORTANT: Teachers must be approved before entering the dashboard.
            if (actualRole === "teacher") {
                const approvalStatus = profile.approvalStatus;
                const status = profile.status;

                if (approvalStatus !== "approved" || status !== "approved") {
                    await eduReachAuth.signOut();

                    showMessage(
                        "Your teacher account is awaiting administrator approval. You can log in after your registration has been approved.",
                        "error"
                    );

                    setLoading(false);
                    return;
                }
            }

            // Remember email only after the account passes its checks.
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem("eduReachRememberEmail", email);
            } else {
                localStorage.removeItem("eduReachRememberEmail");
            }

            if (actualRole === "student") {
                window.location.href = "student-dashboard.html";
            } else if (actualRole === "teacher") {
                window.location.href = "teacher-dashboard.html";
            } else if (actualRole === "admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                await eduReachAuth.signOut();
                showMessage("Your account has an unsupported role.", "error");
                setLoading(false);
            }

        } catch (error) {
            console.error("EduReach login error:", error);

            let message = "Unable to sign in. Please try again.";

            switch (error.code) {
                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/user-not-found":
                    message = "No account was found with this email address.";
                    break;

                case "auth/wrong-password":
                case "auth/invalid-credential":
                    message = "The email or password is incorrect.";
                    break;

                case "auth/user-disabled":
                    message = "This account has been disabled. Please contact the administrator.";
                    break;

                case "auth/too-many-requests":
                    message = "Too many login attempts. Please wait and try again.";
                    break;

                case "auth/network-request-failed":
                    message = "Network error. Please check your internet connection.";
                    break;

                case "permission-denied":
                case "firestore/permission-denied":
                    message = "EduReach could not read your profile. Please check your Firestore permissions.";
                    break;

                default:
                    message = error.message || message;
            }

            showMessage(message, "error");
            setLoading(false);
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    if (loginButton && !loginForm) {
        loginButton.addEventListener("click", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    const rememberedEmail = localStorage.getItem("eduReachRememberEmail");

    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;

        if (rememberMe) rememberMe.checked = true;
    }
});
