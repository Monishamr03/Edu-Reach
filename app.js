/* =========================================
   EDUREACH
   Main Application
========================================= */


/*
    -----------------------------------------
    ROLE CONFIGURATION
    -----------------------------------------
*/

const roleRoutes = {

    student: "login.html?role=student",

    teacher: "login.html?role=teacher",

    admin: "login.html?role=admin"

};



/*
    -----------------------------------------
    SELECT ROLE
    -----------------------------------------
*/

function selectRole(role) {

    if (!roleRoutes[role]) {

        console.error(
            "Invalid EduReach role:",
            role
        );

        return;
    }


    console.log(
        "Selected role:",
        role
    );


    /*
        Navigate to the reusable
        login page with the selected
        role in the URL.
    */

    window.location.href =
        roleRoutes[role];

}



/*
    -----------------------------------------
    ROLE BUTTONS
    -----------------------------------------
*/

function initializeRoleButtons() {

    const roleButtons =
        document.querySelectorAll(
            ".role-option"
        );


    roleButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const role =
                        button.dataset.role;


                    selectRole(role);

                }
            );

        }
    );

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
    START
    -----------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
