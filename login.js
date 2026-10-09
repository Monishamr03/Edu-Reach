// EduReach - Login Logic

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const authMessage = document.getElementById("authMessage");

    // Get the selected role from the URL.
    const urlParams = new URLSearchParams(window.location.search);

    const requestedRole = (
        urlParams.get("role") || "student"
    ).toLowerCase();

    const validRoles = ["student", "teacher", "admin"];

    const selectedRole = validRoles.includes(requestedRole)
        ? requestedRole
        : "student";

    console.log("EduReach login page loaded.");
    console.log("Selected role:", selectedRole);

    // --------------------------------------------------
    // Show a message
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
    // Hide a message
    // --------------------------------------------------

    function hideMessage() {
        if (!authMessage) return;

        authMessage.textContent = "";
        authMessage.style.display = "none";
        authMessage.className = "auth-message";
    }

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    function setLoading(isLoading) {
        if (!loginButton) return;

        loginButton.disabled = isLoading;

        loginButton.textContent = isLoading
            ? "Signing in..."
            : "Sign In";

        loginButton.style.opacity = isLoading ? "0.7" : "1";

        loginButton.style.cursor = isLoading
            ? "not-allowed"
            : "pointer";
    }

    // --------------------------------------------------
    // Check Firebase configuration
    // --------------------------------------------------

    if (typeof firebase === "undefined") {
        console.error("Firebase SDK is not loaded.");

        showMessage(
            "Firebase could not be loaded. Please refresh the page.",
            "error"
        );

        return;
    }

    if (
        typeof eduReachAuth === "undefined" ||
        typeof eduReachDB === "undefined"
    ) {
        console.error("EduReach Firebase services are unavailable.");

        showMessage(
            "Authentication or database configuration is unavailable.",
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

        if (!email) {
            showMessage(
                "Please enter your email address.",
                "error"
            );

            if (emailInput) {
                emailInput.focus();
            }

            return;
        }

        if (!password) {
            showMessage(
                "Please enter your password.",
                "error"
            );

            if (passwordInput) {
                passwordInput.focus();
            }

            return;
        }

        setLoading(true);

        let authenticatedUser = null;

        try {
            // Authenticate with Firebase.
            const userCredential =
                await eduReachAuth.signInWithEmailAndPassword(
                    email,
                    password
                );

            authenticatedUser = userCredential.user;

            console.log("Firebase sign-in successful.");
            console.log("Authenticated UID:", authenticatedUser.uid);

            // Retrieve the EduReach profile.
            const userDoc = await eduReachDB
                .collection("users")
                .doc(authenticatedUser.uid)
                .get();

            if (!userDoc.exists) {
                console.error("Firestore profile not found.");

                await eduReachAuth.signOut();

                showMessage(
                    "Your account exists, but your EduReach profile is missing. Please contact the administrator.",
                    "error"
                );

                setLoading(false);
                return;
            }

            const profile = userDoc.data();
            const actualRole = profile.role;

            console.log("Account role:", actualRole);

            // --------------------------------------------------
            // Validate the stored role
            // --------------------------------------------------

            if (!validRoles.includes(actualRole)) {
                await eduReachAuth.signOut();

                showMessage(
                    "Your account has an invalid EduReach role. Please contact the administrator.",
                    "error"
                );

                setLoading(false);
                return;
            }

            // --------------------------------------------------
            // Check that the selected role matches the profile
            // --------------------------------------------------

            if (actualRole !== selectedRole) {
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
            // TEACHER APPROVAL CHECK
            // --------------------------------------------------

            if (actualRole === "teacher") {
                const status = String(
                    profile.status || ""
                ).toLowerCase();

                const approvalStatus = String(
                    profile.approvalStatus || ""
                ).toLowerCase();

                // Both fields must explicitly say approved.
                if (
                    status !== "approved" ||
                    approvalStatus !== "approved"
                ) {
                    await eduReachAuth.signOut();

                    showMessage(
                        "Your teacher account is awaiting administrator approval. You can sign in after your account has been approved.",
                        "error"
                    );

                    setLoading(false);
                    return;
                }
            }

            // --------------------------------------------------
            // Remember email
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
                return;
            }

            if (actualRole === "teacher") {
                window.location.href = "teacher-dashboard.html";
                return;
            }

            if (actualRole === "admin") {
                window.location.href = "admin-dashboard.html";
                return;
            }

        } catch (error) {
            console.error("Firebase login error:", error);
            console.error("Error code:", error.code);

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
                        "The email or password is incorrect.";
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
                        "Network error. Check your internet connection and try again.";
                    break;

                case "permission-denied":
                case "firestore/permission-denied":
                    message =
                        "EduReach could not read your profile. Please check your database permissions.";
                    break;

                default:
                    message =
                        "Unable to sign in. Please check your details and try again.";
            }

            // Sign out if authentication succeeded but a later
            // step failed, such as reading the profile.
            if (authenticatedUser) {
                try {
                    await eduReachAuth.signOut();
                } catch (signOutError) {
                    console.error(
                        "Could not sign out after login failure:",
                        signOutError
                    );
                }
            }

            showMessage(message, "error");
            setLoading(false);
        }
    }

    // --------------------------------------------------
    // Form submission
    // --------------------------------------------------

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    // Fallback for pages without a login form.
    if (loginButton && !loginForm) {
        loginButton.addEventListener("click", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    // --------------------------------------------------
    // Remembered email
    // --------------------------------------------------

    try {
        const rememberedEmail = localStorage.getItem(
            "eduReachRememberEmail"
        );

        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;

            if (rememberMe) {
                rememberMe.checked = true;
            }
        }
    } catch (error) {
        console.warn(
            "Remembered email could not be loaded.",
            error
        );
    }
});
