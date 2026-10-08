/* =========================================
   EDUREACH
   Main Application JavaScript
========================================= */


/*
    ========================================
    ROLE ROUTES
    ========================================
*/

const roleRoutes = {
    student: "login.html?role=student",
    teacher: "login.html?role=teacher",
    admin: "login.html?role=admin"
};


/*
    ========================================
    SELECT ROLE
    ========================================
*/

function selectRole(role) {

    // Check whether the selected role exists
    if (!roleRoutes[role]) {

        console.error(
            "EduReach: Invalid role selected:",
            role
        );

        return;
    }


    console.log(
        "EduReach: Selected role:",
        role
    );


    // Go to the login page for that role
    window.location.href = roleRoutes[role];
}


/*
    ========================================
    INITIALIZE ROLE BUTTONS
    ========================================
*/

function initializeRoleButtons() {

    const roleButtons =
        document.querySelectorAll(".role-option");


    // If there are no role buttons,
    // simply stop.
    if (roleButtons.length === 0) {

        return;
    }


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
    ========================================
    APPLICATION INITIALIZATION
    ========================================
*/

function initializeApp() {

    console.log(
        "EduReach application initialized."
    );


    initializeRoleButtons();

}


/*
    ========================================
    START APPLICATION
    ========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
