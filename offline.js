/* EduReach offline bootstrap. Works under GitHub Pages project paths. */
(function () {
  "use strict";
  function showNetworkStatus() {
    var old = document.getElementById("edureach-network-status");
    if (!old) {
      old = document.createElement("div");
      old.id = "edureach-network-status";
      old.setAttribute("role", "status");
      old.setAttribute("aria-live", "polite");
      old.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;padding:10px 14px;border-radius:10px;font:14px/1.4 Arial,sans-serif;text-align:center;box-shadow:0 2px 12px #0002;display:none";
      document.body.appendChild(old);
    }
    if (!navigator.onLine) {
      old.textContent = "You're offline. Cached pages and previously downloaded files may still be available. Data that hasn't synced yet stays on this device.";
      old.style.background = "#fff3cd";
      old.style.color = "#664d03";
      old.style.display = "block";
    } else {
      old.textContent = "Back online. Pending data can sync when the page reconnects.";
      old.style.background = "#d1e7dd";
      old.style.color = "#0f5132";
      old.style.display = "block";
      window.setTimeout(function () { if (navigator.onLine) old.style.display = "none"; }, 4500);
    }
  }
  window.addEventListener("online", showNetworkStatus);
  window.addEventListener("offline", showNetworkStatus);
  window.addEventListener("DOMContentLoaded", showNetworkStatus);

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .then(function (registration) {
          console.info("EduReach offline support registered.", registration.scope);
        })
        .catch(function (error) {
          console.warn("EduReach offline support could not be registered:", error);
        });
    });
  }
})();
