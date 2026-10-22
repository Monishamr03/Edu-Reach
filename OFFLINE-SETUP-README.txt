EDUREACH OFFLINE SUPPORT PATCH

This patch adds a PWA shell cache and Firestore offline persistence. It preserves existing pages and Firebase config.

FILES TO UPLOAD TO THE ROOT OF https://github.com/Monishamr03/Edu-Reach
- Replace existing HTML files with the versions in this patch (all existing HTML pages have only the manifest link and offline.js registration added).
- Replace firebase.js with the version in this patch (adds Firestore persistence).
- Add new files: service-worker.js, offline.js, manifest.webmanifest, icon.svg.
- Do not upload this README if you do not want it in the website.

IMPORTANT LIMITATIONS
1. Open the website while online at least once after deployment so the service worker can install and cache pages. Visit the pages you want to use offline while online too.
2. Firestore persistence only helps with data the student has already read while online. Sign-in and new server data cannot be guaranteed offline if they were never cached.
3. Videos/PDFs are not copied into the website cache. Students must download the actual file to their device while online. For Google Drive, open the file and use its Download option if permitted. A Drive preview URL alone is not an offline file.
4. Quizzes and offline-saved quiz results are not implemented by this patch; that is the next development step.
5. If the browser says service worker update is pending, refresh twice or close and reopen the tab. Test in a normal browser window (not a private window).
