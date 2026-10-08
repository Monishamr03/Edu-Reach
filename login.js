// EduReach - Login Logic

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const authMessage = document.getElementById("authMessage");

    // Get selected role from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedRole = urlParams.get("role") || "student";

    console.log("EduReach login page loaded.");
    console.log("Selected role:", selectedRole);

    // --------------------------------------------------
    // Helper: show message
    // --------------------------------------------------
    function showMessage(message, type) {
        if (!authMessage) return;

        authMessage.textContent = message;
        authMessage.className = "auth-message";

        if (type) {
            authMessage.classList.add(type);
        }

        authMessage.style.display = "block";
    }

    // --------------------------------------------------
    // Helper: hide message
    // --------------------------------------------------
    function hideMessage() {
        if (!authMessage) return;

        authMessage.textContent = "";
        authMessage.style.display = "none";
        authMessage.className = "auth-message";
    }

    // --------------------------------------------------
    // Helper: loading state
    // --------------------------------------------------
    function setLoading(isLoading) {
        if (!loginButton) return;

        if (isLoading) {
            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";
            loginButton.style.opacity = "0.7";
            loginButton.style.cursor = "not-allowed";
        } else {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
            loginButton.style.opacity = "1";
            loginButton.style.cursor = "pointer";
        }
    }

    // --------------------------------------------------
    // Check Firebase
    // --------------------------------------------------
    if (typeof firebase === "undefined") {
        console.error("Firebase SDK is not loaded.");
        showMessage(
            "Firebase could not be loaded. Please refresh the page.",
            "error"
        );
        return;
    }

    if (typeof eduReachAuth === "undefined") {
        console.error("eduReachAuth is not available.");
        showMessage(
            "Authentication is not configured correctly.",
            "error"
        );
        return;
    }

    if (typeof eduReachDB === "undefined") {
        console.error("eduReachDB is not available.");
        showMessage(
            "Database is not configured correctly.",
            "error"
        );
        return;
    }

    // --------------------------------------------------
    // Login
    // --------------------------------------------------
    async function loginUser() {
        hideMessage();

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        // Basic validation
        if (!email) {
            showMessage("Please enter your email address.", "error");

            if (emailInput) {
                emailInput.focus();
            }

            return;
        }

        if (!password) {
            showMessage("Please enter your password.", "error");

            if (passwordInput) {
                passwordInput.focus();
            }

            return;
        }

        setLoading(true);

        try {
            console.log("Attempting Firebase sign-in...");

            // Firebase Authentication
            const userCredential =
                await eduReachAuth.signInWithEmailAndPassword(
                    email,
                    password
                );

            const user = userCredential.user;

            console.log("Firebase sign-in successful.");
            console.log("User UID:", user.uid);
            console.log("User email:", user.email);

            // --------------------------------------------------
            // Get user's Firestore profile
            // --------------------------------------------------
            const userDoc = await eduReachDB
                .collection("users")
                .doc(user.uid)
                .get();

            if (!userDoc.exists) {
                console.error(
                    "No Firestore profile found for:",
                    user.uid
                );

                await eduReachAuth.signOut();

                showMessage(
                    "Your account exists, but your EduReach profile could not be found. Please contact the administrator.",
                    "error"
                );

                setLoading(false);
                return;
            }

            const profile = userDoc.data();

            console.log("User profile:", profile);

            const actualRole = profile.role;

            // --------------------------------------------------
            // Verify role
            // --------------------------------------------------
            if (!actualRole) {
                console.error("User profile has no role.");

                await eduReachAuth.signOut();

                showMessage(
                    "Your account does not have a valid EduReach role. Please contact the administrator.",
                    "error"
                );

                setLoading(false);
                return;
            }

            // Do not allow someone to enter through the wrong role page.
            if (actualRole !== selectedRole) {
                console.warn(
                    "Role mismatch.",
                    "Selected:",
                    selectedRole,
                    "Actual:",
                    actualRole
                );

                await eduReachAuth.signOut();

                showMessage(
                    "This account is registered as " +
                        actualRole +
                        ". Please use the correct login option.",
                    "error"
                );

                setLoading(false);
                return;
            }

            // --------------------------------------------------
            // Save remember-me preference
            // --------------------------------------------------
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem(
                    "eduReachRememberEmail",
                    email
                );
            } else {
                localStorage.removeItem(
                    "eduReachRememberEmail"
                );
            }

            // --------------------------------------------------
            // Redirect according to role
            // --------------------------------------------------
            if (actualRole === "student") {
                window.location.href = "student-dashboard.html";
            } else if (actualRole === "teacher") {
                window.location.href = "teacher-dashboard.html";
            } else if (actualRole === "admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                console.error(
                    "Unknown role:",
                    actualRole
                );

                await eduReachAuth.signOut();

                showMessage(
                    "Your account has an unsupported role. Please contact the administrator.",
                    "error"
                );

                setLoading(false);
            }

        } catch (error) {
            console.error("Firebase login error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);

            let message =
                "Unable to sign in. Please try again.";

            switch (error.code) {
                case "auth/invalid-email":
                    message =
                        "Please enter a valid email address.";
                    break;

                case "auth/user-not-found":
                    message =
                        "No account was found with this email address.";
                    break;

                case "auth/wrong-password":
                    message =
                        "Incorrect password. Please try again.";
                    break;

                case "auth/invalid-credential":
                    message =
                        "The email or password is incorrect.";
                    break;

                case "auth/user-disabled":
                    message =
                        "This account has been disabled. Please contact the administrator.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many login attempts. Please wait a moment and try again.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection and try again.";
                    break;

                case "permission-denied":
                case "firestore/permission-denied":
                    message =
                        "Your account was authenticated, but EduReach could not read your profile. Please check your Firestore permissions.";
                    break;

                default:
                    message =
                        error.message ||
                        "Unable to sign in. Please try again.";
            }

            showMessage(message, "error");
            setLoading(false);
        }
    }

    // --------------------------------------------------
    // Form submit
    // --------------------------------------------------
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    // --------------------------------------------------
    // Button click fallback
    // --------------------------------------------------
    if (loginButton && !loginForm) {
        loginButton.addEventListener("click", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    // --------------------------------------------------
    // Remembered email
    // --------------------------------------------------
    const rememberedEmail =
        localStorage.getItem("eduReachRememberEmail");

    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;

        if (rememberMe) {
            rememberMe.checked = true;
        }
    }
});
