/* =========================================
   EDUREACH
   STUDENT REGISTRATION
   Firebase Authentication + Firestore
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET HTML ELEMENTS
    ========================================= */

    const registerForm =
        document.getElementById("registerForm");

    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const educationalUse =
        document.getElementById("educationalUse");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const confirmPasswordToggle =
        document.getElementById("confirmPasswordToggle");

    const registerMessage =
        document.getElementById("registerMessage");

    const registerButton =
        document.getElementById("registerButton");


    /* =========================================
       CHECK HTML
    ========================================= */

    if (!registerForm) {

        console.error(
            "EduReach: registerForm was not found."
        );

        return;
    }


    /* =========================================
       CHECK FIREBASE
    ========================================= */

    if (
        typeof firebase === "undefined" ||
        typeof eduReachAuth === "undefined" ||
        typeof eduReachDB === "undefined"
    ) {

        showMessage(
            "Firebase could not be loaded. Please refresh the page and try again.",
            "error"
        );

        console.error(
            "EduReach: Firebase initialization failed."
        );

        return;
    }


    /* =========================================
       SHOW MESSAGE
    ========================================= */

    function showMessage(message, type = "error") {

        if (!registerMessage) {
            return;
        }

        registerMessage.textContent = message;

        registerMessage.className =
            "auth-message " + type;
    }


    /* =========================================
       CLEAR MESSAGE
    ========================================= */

    function clearMessage() {

        if (!registerMessage) {
            return;
        }

        registerMessage.textContent = "";

        registerMessage.className =
            "auth-message";
    }


    /* =========================================
       BUTTON LOADING STATE
    ========================================= */

    function setLoading(isLoading) {

        if (!registerButton) {
            return;
        }

        registerButton.disabled = isLoading;

        if (isLoading) {

            registerButton.textContent =
                "Creating account...";

        } else {

            registerButton.textContent =
                "Create Student Account";

        }
    }


    /* =========================================
       PASSWORD TOGGLE
    ========================================= */

    if (passwordToggle && passwordInput) {

        passwordToggle.addEventListener(
            "click",
            function () {

                const showingPassword =
                    passwordInput.type === "text";

                if (showingPassword) {

                    passwordInput.type = "password";

                    passwordToggle.textContent = "👁";

                    passwordToggle.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                } else {

                    passwordInput.type = "text";

                    passwordToggle.textContent = "🙈";

                    passwordToggle.setAttribute(
                        "aria-label",
                        "Hide password"
                    );
                }
            }
        );
    }


    /* =========================================
       CONFIRM PASSWORD TOGGLE
    ========================================= */

    if (
        confirmPasswordToggle &&
        confirmPasswordInput
    ) {

        confirmPasswordToggle.addEventListener(
            "click",
            function () {

                const showingPassword =
                    confirmPasswordInput.type === "text";

                if (showingPassword) {

                    confirmPasswordInput.type =
                        "password";

                    confirmPasswordToggle.textContent =
                        "👁";

                    confirmPasswordToggle.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                } else {

                    confirmPasswordInput.type =
                        "text";

                    confirmPasswordToggle.textContent =
                        "🙈";

                    confirmPasswordToggle.setAttribute(
                        "aria-label",
                        "Hide password"
                    );
                }
            }
        );
    }


    /* =========================================
       FORM SUBMISSION
    ========================================= */

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            /* =================================
               READ VALUES
            ================================= */

            const fullName =
                fullNameInput.value.trim();

            const email =
                emailInput.value.trim().toLowerCase();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            /* =================================
               VALIDATE FULL NAME
            ================================= */

            if (fullName.length < 2) {

                showMessage(
                    "Please enter your full name.",
                    "error"
                );

                fullNameInput.focus();

                return;
            }


            /* =================================
               VALIDATE EMAIL
            ================================= */

            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            /* =================================
               VALIDATE PASSWORD
            ================================= */

            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );

                passwordInput.focus();

                return;
            }


            /* =================================
               VALIDATE PASSWORD MATCH
            ================================= */

            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                confirmPasswordInput.focus();

                return;
            }


            /* =================================
               VALIDATE EDUCATIONAL USE
            ================================= */

            if (
                !educationalUse ||
                !educationalUse.checked
            ) {

                showMessage(
                    "Please confirm that this account is for educational use.",
                    "error"
                );

                if (educationalUse) {
                    educationalUse.focus();
                }

                return;
            }


            /* =================================
               START LOADING
            ================================= */

            setLoading(true);


            try {

                console.log(
                    "EduReach: Creating student Firebase account..."
                );


                /* =================================
                   CREATE FIREBASE AUTH ACCOUNT
                ================================= */

                const userCredential =
                    await eduReachAuth
                        .createUserWithEmailAndPassword(
                            email,
                            password
                        );


                const user =
                    userCredential.user;


                console.log(
                    "EduReach: Firebase Auth account created:",
                    user.uid
                );


                /* =================================
                   UPDATE FIREBASE DISPLAY NAME
                ================================= */

                await user.updateProfile({

                    displayName: fullName

                });


                console.log(
                    "EduReach: Display name updated."
                );


                /* =================================
                   CREATE FIRESTORE USER PROFILE
                ================================= */

                await eduReachDB
                    .collection("users")
                    .doc(user.uid)
                    .set({

                        name: fullName,

                        email: email,

                        role: "student",

                        photo: "",

                        xp: 0,

                        level: 1,

                        streak: 0,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                console.log(
                    "EduReach: Student Firestore profile created."
                );


                /* =================================
                   SUCCESS MESSAGE
                ================================= */

                showMessage(
                    "Your student account has been created successfully! Redirecting to login...",
                    "success"
                );


                registerButton.disabled = true;

                registerButton.textContent =
                    "Account Created ✓";


                /* =================================
                   SIGN OUT
                   Firebase automatically signs the
                   newly created user in.
                ================================= */

                await eduReachAuth.signOut();


                /* =================================
                   REDIRECT TO STUDENT LOGIN
                ================================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?role=student";

                    },
                    1500
                );

            }


            /* =================================
               ERROR HANDLING
            ================================= */

            catch (error) {

                console.error(
                    "EduReach registration error:",
                    error
                );

                console.error(
                    "Firebase error code:",
                    error.code
                );

                console.error(
                    "Firebase error message:",
                    error.message
                );


                let message =
                    "Unable to create your account. Please try again.";


                switch (error.code) {


                    /* =========================
                       EMAIL ALREADY EXISTS
                    ========================= */

                    case "auth/email-already-in-use":

                        message =
                            "This email address already has an EduReach account. Please sign in instead.";

                        break;


                    /* =========================
                       INVALID EMAIL
                    ========================= */

                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    /* =========================
                       WEAK PASSWORD
                    ========================= */

                    case "auth/weak-password":

                        message =
                            "Your password is too weak. Please use at least 6 characters.";

                        break;


                    /* =========================
                       AUTH NOT ENABLED
                    ========================= */

                    case "auth/operation-not-allowed":

                        message =
                            "Email/password authentication is not enabled in Firebase.";

                        break;


                    /* =========================
                       NETWORK ERROR
                    ========================= */

                    case "auth/network-request-failed":

                        message =
                            "Network connection failed. Please check your internet connection and try again.";

                        break;


                    /* =========================
                       TOO MANY REQUESTS
                    ========================= */

                    case "auth/too-many-requests":

                        message =
                            "Too many attempts were made. Please wait a little while and try again.";

                        break;


                    /* =========================
                       FIRESTORE PERMISSION
                    ========================= */

                    case "permission-denied":

                        message =
                            "Your authentication account was created, but EduReach could not save your student profile. Please check the Firestore security rules.";

                        break;


                    /* =========================
                       FIRESTORE PRECONDITION
                    ========================= */

                    case "failed-precondition":

                        message =
                            "Firebase Firestore is not ready yet. Please make sure Firestore Database is enabled.";

                        break;


                    /* =========================
                       FIRESTORE UNAVAILABLE
                    ========================= */

                    case "unavailable":

                        message =
                            "Firebase is temporarily unavailable. Please try again.";

                        break;


                    /* =========================
                       DEFAULT
                    ========================= */

                    default:

                        if (error.message) {

                            message =
                                "Firebase error: " +
                                error.message;

                        }

                        break;
                }


                showMessage(
                    message,
                    "error"
                );


                setLoading(false);
            }

        }
    );


    /* =========================================
       EMAIL VALIDATION
    ========================================= */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =========================================
       INITIALIZATION COMPLETE
    ========================================= */

    console.log(
        "EduReach: Student registration page initialized."
    );

});
