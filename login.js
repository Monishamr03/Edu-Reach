/* =========================================
   EDUREACH
   Login Page
========================================= */


/*
    -----------------------------------------
    ROLE CONFIGURATION
    -----------------------------------------
*/

const roleConfiguration = {

    student: {
        name: "Student",
        icon: "🎓",
        description:
            "Sign in to continue your learning journey."
    },

    teacher: {
        name: "Teacher",
        icon: "👨‍🏫",
        description:
            "Sign in to manage your courses and learners."
    },

    admin: {
        name: "Administrator",
        icon: "⚙️",
        description:
            "Sign in to manage the EduReach platform."
    }

};



/*
    -----------------------------------------
    GET SELECTED ROLE
    -----------------------------------------
*/

function getSelectedRole() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const role =
        parameters.get("role");

    if (
        role &&
        roleConfiguration[role]
    ) {
        return role;
    }

    return "student";
}



/*
    -----------------------------------------
    UPDATE LOGIN UI
    -----------------------------------------
*/

function updateLoginUI(role) {

    const configuration =
        roleConfiguration[role];


    const selectedRole =
        document.getElementById(
            "selectedRole"
        );

    const roleIcon =
        document.querySelector(
            ".selected-role-icon"
        );

    const loginSubtitle =
        document.getElementById(
            "loginSubtitle"
        );

    const studentPrompt =
        document.getElementById(
            "studentRegisterPrompt"
        );


    selectedRole.textContent =
        configuration.name;


    roleIcon.textContent =
        configuration.icon;


    loginSubtitle.textContent =
        configuration.description;


    /*
        Only students can publicly
        create an account.

        Teacher and Administrator
        registration is NOT displayed.
    */

    if (role === "student") {

        studentPrompt.style.display =
            "flex";

    } else {

        studentPrompt.style.display =
            "none";

    }

}



/*
    -----------------------------------------
    PASSWORD VISIBILITY
    -----------------------------------------
*/

function initializePasswordToggle() {

    const passwordInput =
        document.getElementById(
            "password"
        );

    const toggleButton =
        document.getElementById(
            "togglePassword"
        );


    toggleButton.addEventListener(
        "click",
        function() {

            const isPassword =
                passwordInput.type ===
                "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            toggleButton.textContent =
                isPassword
                    ? "🙈"
                    : "👁";

        }
    );

}



/*
    -----------------------------------------
    CHANGE ROLE
    -----------------------------------------
*/

function initializeChangeRole(role) {

    const changeButton =
        document.getElementById(
            "changeRoleButton"
        );


    changeButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "index.html";

        }
    );

}



/*
    -----------------------------------------
    LOGIN FORM
    -----------------------------------------
*/

function initializeLoginForm(role) {

    const form =
        document.getElementById(
            "loginForm"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            /*
                Firebase Authentication
                will be connected here later.

                We deliberately do NOT
                fake a successful login.
            */

            message.hidden = false;

            message.className =
                "form-message info";


            message.textContent =
                "Firebase authentication will be connected in the next step.";


            console.log(
                "Login attempt:",
                {
                    role: role,
                    email: email,
                    passwordProvided:
                        password.length > 0
                }
            );

        }
    );

}



/*
    -----------------------------------------
    FORGOT PASSWORD
    -----------------------------------------
*/

function initializeForgotPassword() {

    const forgotPassword =
        document.getElementById(
            "forgotPassword"
        );


    forgotPassword.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "loginMessage"
                );


            message.hidden = false;

            message.className =
                "form-message info";


            message.textContent =
                "Password reset will be connected with Firebase Authentication.";

        }
    );

}



/*
    -----------------------------------------
    INITIALIZE
    -----------------------------------------
*/

function initializeLoginPage() {

    const role =
        getSelectedRole();


    updateLoginUI(role);

    initializePasswordToggle();

    initializeChangeRole(role);

    initializeLoginForm(role);

    initializeForgotPassword();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeLoginPage
);
