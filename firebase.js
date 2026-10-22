/* =========================================
   EDUREACH
   Firebase Configuration
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDGS4Axd4REInJRfynfqlMePDxYmEqaumA",
    authDomain: "edureach-7d68c.firebaseapp.com",
    projectId: "edureach-7d68c",
    storageBucket: "edureach-7d68c.firebasestorage.app",
    messagingSenderId: "80487566189",
    appId: "1:80487566189:web:d6e1f3d8c4d35fb032e864"
};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


/* =========================================
   AUTHENTICATION
========================================= */

window.eduReachAuth = firebase.auth();


/* =========================================
   FIRESTORE DATABASE
========================================= */

window.eduReachDB = firebase.firestore();

/*
   OFFLINE DATA CACHE
   Firestore keeps previously read documents available offline and queues
   supported writes until the connection returns. This does not cache video
   or PDF files; students must download those files separately.
*/
if (typeof window.eduReachDB.enablePersistence === "function") {
    window.eduReachDB.enablePersistence({ synchronizeTabs: true }).catch(function (error) {
        // Persistence can be unavailable in private browsing or when multiple
        // tabs are already using Firestore. The online app should still work.
        console.warn("EduReach: Firestore offline persistence unavailable:", error.code || error.message);
    });
}


/* =========================================
   CONFIRM INITIALIZATION
========================================= */

console.log("EduReach: Firebase initialized.");
console.log("EduReach: Authentication ready.");
console.log("EduReach: Firestore ready.");
