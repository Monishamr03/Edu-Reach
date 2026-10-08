/* =========================================
   EDUREACH
   Main Application JavaScript
========================================= */


/*
    -----------------------------------------
    ROLE SELECTION
    -----------------------------------------

    For now this only demonstrates that
    the correct role button is being selected.

    Firebase authentication will be connected
    later.

    IMPORTANT:
    We are NOT treating this as login.

    Later:

    Student
        ↓
    Student Login
        ↓
    Firebase Authentication
        ↓
    Firestore role check
        ↓
    Student Dashboard


    Teacher
        ↓
    Teacher Login
        ↓
    Firebase Authentication
        ↓
    Firestore role check
        ↓
    Teacher Dashboard


    Admin
        ↓
    Admin Login
        ↓
    Firebase Authentication
        ↓
    Firestore role check
        ↓
    Admin Dashboard
*/


function selectRole(role) {

    console.log("Selected role:", role);


    const roleNames = {
        student: "Student",
        teacher: "Teacher",
        admin: "Administrator"
    };


    const selectedRole = roleNames[role];


    if (!selectedRole) {

        console.error(
            "Invalid role selected."
        );

        return;
    }


    /*
        Temporary behavior.

        This will later become navigation
        to the correct login screen.
    */

    alert(
        selectedRole +
        " login will be connected in the next step."
    );
}


/*
    -----------------------------------------
    ROLE BUTTON INITIALIZATION
    -----------------------------------------
*/

function initializeRoleButtons() {

    const roleButtons =
        document.querySelectorAll(
            ".role-option"
        );


    roleButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const role =
                    button.dataset.role;


                selectRole(role);

            }
        );

    });

}


/*
    -----------------------------------------
    APPLICATION INITIALIZATION
    -----------------------------------------
*/

function initializeApp() {

    console.log(
        "EduReach application initialized."
    );


    initializeRoleButtons();

}


/*
    -----------------------------------------
    START APPLICATION
    -----------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
