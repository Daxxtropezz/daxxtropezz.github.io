(function () {
    const powerOverlay = document.getElementById('powerOverlay');
    const powerBtn = document.getElementById('powerBtn');

    // Ensure default power state is OFF on first launch
    if (localStorage.getItem('power-on') === null) {
        try { localStorage.setItem('power-on', '0'); } catch (e) { /* ignore storage errors */ }
    }

    function updateDesktopVisibility() {
        const desktopEl = document.querySelector('.desktop');
        const overlay = document.getElementById('powerOverlay');
        if (!desktopEl || !overlay) return;
        if (overlay.getAttribute('aria-hidden') === 'false') {
            desktopEl.style.display = 'none';
        } else {
            desktopEl.style.display = '';
        }
    }

    function setPowerState(on) {
        try { localStorage.setItem('power-on', on ? '1' : '0'); } catch (e) { }
        if (!powerOverlay) return;
        if (on) {
            powerOverlay.setAttribute('aria-hidden', 'true');
        } else {
            powerOverlay.setAttribute('aria-hidden', 'false');
        }
        updateDesktopVisibility();
    }
    function getPowerState() {
        try { return localStorage.getItem('power-on') === '1'; } catch (e) { return false; }
    }
    function showPowerOverlay() {
        setPowerState(false);
    }
    function hidePowerOverlay() {
        setPowerState(true);
    }

    // Attempt to enter fullscreen on load; if blocked, add a one-time click fallback
    function tryEnterFullscreen() {
        const el = document.documentElement;
        if (document.fullscreenElement) return;
        if (!el.requestFullscreen) return;
        el.requestFullscreen().catch(() => {
            const onClick = () => {
                el.requestFullscreen().catch(() => { /* ignore */ });
            };
            document.addEventListener('click', onClick, { once: true });
        });
    }

    // Hook up the power button if present
    powerBtn?.addEventListener('click', () => {
        hidePowerOverlay();
        tryEnterFullscreen();
    });

    // Initialize overlay state on DOMContentLoaded (if element present)
    window.addEventListener('DOMContentLoaded', () => {
        if (!powerOverlay) return;
        if (!getPowerState()) {
            powerOverlay.setAttribute('aria-hidden', 'false');
        } else {
            powerOverlay.setAttribute('aria-hidden', 'true');
        }
        updateDesktopVisibility();
        // Attempt fullscreen once on load
        tryEnterFullscreen();
    });

    // --- NEW: immediate init so first-launch shows overlay even if DOM already parsed ---
    (function initPowerOverlay() {
        // If the element exists now, apply visibility immediately.
        if (powerOverlay) {
            if (!getPowerState()) powerOverlay.setAttribute('aria-hidden', 'false');
            else powerOverlay.setAttribute('aria-hidden', 'true');
            updateDesktopVisibility();
            // try fullscreen attempt now as well
            tryEnterFullscreen();
            return;
        }
        // If element not present yet, leave the DOMContentLoaded handler to handle it.
    })();
    // -------------------------------------------------------------------------------

    // Observe overlay attribute changes to update desktop visibility
    if (window.MutationObserver && powerOverlay) {
        const observer = new MutationObserver(updateDesktopVisibility);
        observer.observe(powerOverlay, { attributes: true });
    }

    // Export to global so existing calls work
    window.showPowerOverlay = showPowerOverlay;
    window.hidePowerOverlay = hidePowerOverlay;
    window.setPowerState = setPowerState;
    window.getPowerState = getPowerState;
    window.tryEnterFullscreen = tryEnterFullscreen;
})();
