document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("teacherRegisterForm");
    const nameInput = document.getElementById("teacherName");
    const emailInput = document.getElementById("teacherEmail");
    const schoolInput = document.getElementById("schoolName");
    const passwordInput = document.getElementById("teacherPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const submitButton = document.getElementById("teacherRegisterButton");
    const messageBox = document.getElementById("registerMessage");

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "auth-message " + type;
        messageBox.hidden = false;
    }

    if (!form) {
        console.error("EduReach: Teacher registration form not found.");
        return;
    }

    if (
        typeof eduReachAuth === "undefined" ||
        typeof eduReachDB === "undefined"
    ) {
        showMessage(
            "Unable to connect to EduReach services. Please refresh the page and try again.",
            "error"
        );
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const school = schoolInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!name || !email || !password) {
            showMessage("Please complete all required fields.", "error");
            return;
        }

        if (password.length < 8) {
            showMessage(
                "Your password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage("The passwords do not match.", "error");
            confirmPasswordInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";
        messageBox.hidden = true;

        let createdUser = null;

        try {
            const credential =
                await eduReachAuth.createUserWithEmailAndPassword(
                    email,
                    password
                );

            createdUser = credential.user;

            await createdUser.updateProfile({
                displayName: name
            });

            await eduReachDB.collection("users").doc(createdUser.uid).set({
                name: name,
                email: email,
                school: school,
                role: "teacher",
                status: "pending",
                approvalStatus: "pending",
                photo: "",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            form.reset();

            showMessage(
                "Registration successful! Your teacher account is pending administrator approval. You can log in after your account has been approved.",
                "success"
            );

        } catch (error) {
            console.error("EduReach teacher registration error:", error);

            if (createdUser) {
                showMessage(
                    "Your authentication account was created, but your teacher profile could not be saved. Please contact the administrator before trying to register again.",
                    "error"
                );
            } else {
                let message =
                    "We couldn't create your account. Please try again.";

                if (error.code === "auth/email-already-in-use") {
                    message =
                        "This email is already registered. Try logging in instead.";
                } else if (error.code === "auth/invalid-email") {
                    message =
                        "Please enter a valid email address.";
                } else if (error.code === "auth/weak-password") {
                    message =
                        "Please choose a stronger password.";
                } else if (
                    error.code === "auth/network-request-failed"
                ) {
                    message =
                        "Network error. Check your internet connection and try again.";
                } else if (
                    error.code === "permission-denied" ||
                    error.code === "firestore/permission-denied"
                ) {
                    message =
                        "Your profile could not be saved because database permissions need to be configured.";
                }

                showMessage(message, "error");
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Create Teacher Account";
        }
    });
});
