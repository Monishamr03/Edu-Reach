/* =========================================
   EDUREACH
   Student Registration
========================================= */


/*
    ========================================
    SHOW MESSAGE
    ========================================
*/

function showRegistrationMessage(
    type,
    message
) {

    const messageBox =
        document.getElementById(
            "registrationMessage"
        );


    messageBox.hidden = false;

    messageBox.className =
        "form-message " + type;

    messageBox.textContent =
        message;
}


/*
    ========================================
    HIDE MESSAGE
    ========================================
*/

function hideRegistrationMessage() {

    const messageBox =
        document.getElementById(
            "registrationMessage"
        );


    messageBox.hidden = true;

    messageBox.textContent = "";

}


/*
    ========================================
    PASSWORD TOGGLE
    ========================================
*/

function initializePasswordToggle(
    inputId,
    buttonId
) {

    const passwordInput =
        document.getElementById(
            inputId
        );


    const toggleButton =
        document.getElementById(
            buttonId
        );


    if (
        !passwordInput ||
        !toggleButton
    ) {
        return;
    }


    toggleButton.addEventListener(
        "click",
        function() {

            const showingPassword =
                passwordInput.type ===
                "text";


            if (showingPassword) {

                passwordInput.type =
                    "password";

                toggleButton.textContent =
                    "👁";

            } else {

                passwordInput.type =
                    "text";

                toggleButton.textContent =
                    "🙈";

            }

        }
    );

}


/*
    ========================================
    PASSWORD VALIDATION
    ========================================
*/

function validatePassword(password) {

    if (password.length < 6) {

        return {
            valid: false,
            message:
                "Password must contain at least 6 characters."
        };

    }


    return {
        valid: true,
        message: ""
    };

}


/*
    ========================================
    EMAIL VALIDATION
    ========================================
*/

function validateEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(email);

}


/*
    ========================================
    REGISTRATION FORM
    ========================================
*/

function initializeRegistrationForm() {

    const form =
        document.getElementById(
            "registrationForm"
        );


    const registerButton =
        document.getElementById(
            "registerButton"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            /*
                Prevent the browser from
                refreshing the page.
            */

            event.preventDefault();


            hideRegistrationMessage();


            /*
                --------------------------------
                GET FORM VALUES
                --------------------------------
            */

            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const terms =
                document.getElementById(
                    "terms"
                ).checked;


            /*
                --------------------------------
                NAME VALIDATION
                --------------------------------
            */

            if (fullName.length < 2) {

                showRegistrationMessage(
                    "error",
                    "Please enter your full name."
                );

                return;
            }


            /*
                --------------------------------
                EMAIL VALIDATION
                --------------------------------
            */

            if (!validateEmail(email)) {

                showRegistrationMessage(
                    "error",
                    "Please enter a valid email address."
                );

                return;
            }


            /*
                --------------------------------
                PASSWORD VALIDATION
                --------------------------------
            */

            const passwordResult =
                validatePassword(
                    password
                );


            if (!passwordResult.valid) {

                showRegistrationMessage(
                    "error",
                    passwordResult.message
                );

                return;
            }


            /*
                --------------------------------
                PASSWORD MATCH
                --------------------------------
            */

            if (
                password !==
                confirmPassword
            ) {

                showRegistrationMessage(
                    "error",
                    "Passwords do not match."
                );

                return;
            }


            /*
                --------------------------------
                TERMS
                --------------------------------
            */

            if (!terms) {

                showRegistrationMessage(
                    "error",
                    "Please accept the educational use agreement to continue."
                );

                return;
            }


            /*
                --------------------------------
                TEMPORARY TEST STATE
                --------------------------------

                Firebase will replace this
                section in the next stage.

                We do NOT create a fake account
                or pretend registration succeeded.
            */

            registerButton.disabled = true;

            registerButton.style.opacity =
                "0.7";

            registerButton.style.cursor =
                "wait";


            registerButton.innerHTML = `
                <span>
                    Checking details...
                </span>
                <span>
                    ...
                </span>
            `;


            setTimeout(
                function() {

                    registerButton.disabled =
                        false;

                    registerButton.style.opacity =
                        "";

                    registerButton.style.cursor =
                        "";

                    registerButton.innerHTML = `
                        <span>
                            Create student account
                        </span>
                        <span>
                            →
                        </span>
                    `;


                    showRegistrationMessage(
                        "info",
                        "Your details are valid. Firebase account creation will be connected next."
                    );


                    console.log(
                        "Registration form validated:",
                        {
                            fullName:
                                fullName,
                            email:
                                email,
                            passwordProvided:
                                password.length > 0,
                            termsAccepted:
                                terms
                        }
                    );

                },
                500
            );

        }
    );

}


/*
    ========================================
    INITIALIZE PAGE
    ========================================
*/

function initializeRegistrationPage() {

    initializePasswordToggle(
        "registerPassword",
        "toggleRegisterPassword"
    );


    initializePasswordToggle(
        "confirmPassword",
        "toggleConfirmPassword"
    );


    initializeRegistrationForm();

}


/*
    ========================================
    START
    ========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeRegistrationPage
);
