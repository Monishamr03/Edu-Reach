/* =========================================
   EDUREACH
   Student Registration
   Step 4A - Firebase Authentication
========================================= */

document.addEventListener("DOMContentLoaded", function () {

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
       MESSAGE
    ========================================== */

    function showMessage(message, type = "error") {

        registerMessage.textContent = message;

        registerMessage.className =
            "auth-message " + type;
    }


    function clearMessage() {

        registerMessage.textContent = "";

        registerMessage.className =
            "auth-message";
    }


    /* =========================================
       LOADING STATE
    ========================================== */

    function setLoading(isLoading) {

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
       PASSWORD SHOW / HIDE
    ========================================== */

    passwordToggle.addEventListener(
        "click",
        function () {

            const isHidden =
                passwordInput.type === "password";

            passwordInput.type =
                isHidden
                    ? "text"
                    : "password";

            passwordToggle.textContent =
                isHidden
                    ? "🙈"
                    : "👁";

            passwordToggle.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );
        }
    );


    /* =========================================
       CONFIRM PASSWORD SHOW / HIDE
    ========================================== */

    confirmPasswordToggle.addEventListener(
        "click",
        function () {

            const isHidden =
                confirmPasswordInput.type === "password";

            confirmPasswordInput.type =
                isHidden
                    ? "text"
                    : "password";

            confirmPasswordToggle.textContent =
                isHidden
                    ? "🙈"
                    : "👁";

            confirmPasswordToggle.setAttribute(
                "aria-label",
                isHidden
                    ? "Hide password"
                    : "Show password"
            );
        }
    );


    /* =========================================
       FORM SUBMISSION
    ========================================== */

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            /* =====================================
               GET FORM VALUES
            ====================================== */

            const fullName =
                fullNameInput.value.trim();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            /* =====================================
               VALIDATION
            ====================================== */

            if (fullName.length < 2) {

                showMessage(
                    "Please enter your full name."
                );

                fullNameInput.focus();

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address."
                );

                emailInput.focus();

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                passwordInput.focus();

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match."
                );

                confirmPasswordInput.focus();

                return;
            }


            if (!educationalUse.checked) {

                showMessage(
                    "Please confirm that this account is for educational use."
                );

                educationalUse.focus();

                return;
            }


            /* =====================================
               START LOADING
            ====================================== */

            setLoading(true);


            try {

                /* =================================
                   CREATE FIREBASE AUTH ACCOUNT
                ================================== */

                const userCredential =
                    await eduReachAuth
                        .createUserWithEmailAndPassword(
                            email,
                            password
                        );


                const user =
                    userCredential.user;


                /* =================================
                   SAVE DISPLAY NAME
                ================================== */

                await user.updateProfile({

                    displayName: fullName

                });


                /* =================================
                   CREATE FIRESTORE USER PROFILE
                ================================== */

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


                /* =================================
                   SUCCESS
                ================================== */

                showMessage(
                    "Your student account has been created successfully!",
                    "success"
                );


                /* =================================
                   SIGN OUT
                   The user will log in normally
                   from the login page.
                ================================== */

                await eduReachAuth.signOut();


                /* =================================
                   REDIRECT TO STUDENT LOGIN
                ================================== */

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?role=student";

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "EduReach registration error:",
                    error
                );


                /* =================================
                   FIREBASE ERROR MESSAGES
                ================================== */

                let message =
                    "Unable to create your account. Please try again.";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        message =
                            "An account already exists with this email address.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/weak-password":

                        message =
                            "Your password is too weak. Please use at least 6 characters.";

                        break;


                    case "auth/operation-not-allowed":

                        message =
                            "Email/password authentication is not enabled in Firebase.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network connection failed. Please check your internet connection.";

                        break;

                }


                showMessage(message);

                setLoading(false);
            }

        }
    );


    /* =========================================
       EMAIL VALIDATION
    ========================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }

});
