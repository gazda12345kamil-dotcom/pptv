// ===== PPTV SPLASH SCREEN CONTROLLER =====
(function () {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplash);
    } else {
        initSplash();
    }

    function initSplash() {
        const splash = document.getElementById('pptvSplash');
        if (!splash) return;

        // Minimum display time for splash (3 seconds for full animation)
        const minDisplayTime = 3000;
        const startTime = Date.now();

        // Show splash screen
        splash.style.display = 'flex';

        // Hide splash after animation completes
        function hideSplash() {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);

            setTimeout(() => {
                splash.classList.add('hiding');

                // Remove from DOM after fade out animation
                setTimeout(() => {
                    splash.style.display = 'none';
                    splash.remove();
                }, 800); // Match fade out animation duration
            }, remainingTime);
        }

        // Auto-hide after timer
        hideSplash();

        // Allow tap/click to skip
        splash.addEventListener('click', () => {
            if (!splash.classList.contains('hiding')) {
                splash.classList.add('hiding');
                setTimeout(() => {
                    splash.style.display = 'none';
                    splash.remove();
                }, 800);
            }
        });
    }
})();
