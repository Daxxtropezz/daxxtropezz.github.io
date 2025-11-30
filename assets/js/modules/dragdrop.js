// Drag & Drop + ordering/persistence (moved from script.js)
(function () {
    // Inserted: clear localStorage when ?utm_source=clever-gang.github.io is present
    (function clearOnCleverGangUtm() {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('utm_source') === 'clever-gang.github.io') {
                // Clear localStorage (only as requested)
                localStorage.clear();
                // Remove the utm parameter from the URL to avoid repeated clears
                params.delete('utm_source');
                const newSearch = params.toString();
                const newUrl =
                    window.location.origin +
                    window.location.pathname +
                    (newSearch ? '?' + newSearch : '') +
                    window.location.hash;
                history.replaceState(null, '', newUrl);
            }
        } catch (e) {
            // Fail silently if URL parsing or storage access is blocked 
            console.info('INVALID PARAMETERS: LocalStorage failed to be cleared');
        }
    })();
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const desktop = document.querySelector('.desktop');
    const icons = () => Array.from(desktop ? desktop.querySelectorAll('.icon') : document.querySelectorAll('.icon'));

    // Grid-based drag and drop reordering with persistence
    function saveOrder() {
        const order = icons().map((i) => i.dataset.id);
        try { localStorage.setItem('icon-order', JSON.stringify(order)); } catch (e) { }
        // Also persist the current on-screen positions so free-layout restores correctly
        const posMap = normalizePosMap(snapshotPositionsFromCurrentLayout());
        savePosMap(posMap);
    }
    function loadOrder() {
        try {
            return JSON.parse(localStorage.getItem('icon-order')) || [];
        } catch {
            return [];
        }
    }
    function applyOrder() {
        const order = loadOrder();
        if (!order.length || !desktop) return;
        const map = new Map(icons().map((i) => [i.dataset.id, i]));
        order.forEach((id) => {
            const node = map.get(id);
            if (node) desktop.appendChild(node);
        });
    }
    applyOrder();

    // Free-layout support (when align-to-grid is OFF)
    function getPosMap() {
        try {
            return JSON.parse(localStorage.getItem('icon-pos') || '{}');
        } catch {
            return {};
        }
    }
    function savePosMap(m) {
        try { localStorage.setItem('icon-pos', JSON.stringify(m)); } catch (e) { }
    }
    // Ensure positions are within desktop bounds and rounded before saving
    function normalizePosMap(map) {
        if (!map) return {};
        const dRect = desktop.getBoundingClientRect();
        icons().forEach((el) => {
            const id = el.dataset.id;
            const p = map[id];
            if (!p) return;
            const w = el.offsetWidth || 0;
            const h = el.offsetHeight || 0;
            let left = Math.round(p.left || 0);
            let top = Math.round(p.top || 0);
            left = Math.max(
                0,
                Math.min(left, Math.max(0, Math.round(dRect.width - w)))
            );
            top = Math.max(
                0,
                Math.min(top, Math.max(0, Math.round(dRect.height - h)))
            );
            map[id] = { left, top };
        });
        return map;
    }
    // Snapshot current on-screen positions (relative to desktop) in current layout
    function snapshotPositionsFromCurrentLayout() {
        const dRect = desktop.getBoundingClientRect();
        const map = {};
        icons().forEach((el) => {
            const r = el.getBoundingClientRect();
            const left = Math.round(r.left - dRect.left);
            const top = Math.round(r.top - dRect.top);
            map[el.dataset.id] = { left, top };
        });
        return map;
    }
    function applyAbsolutePositions(map) {
        const dRect = desktop.getBoundingClientRect();
        icons().forEach((el) => {
            const id = el.dataset.id;
            const p = map[id];
            let left, top;
            if (p) {
                left = Math.round(p.left || 0);
                top = Math.round(p.top || 0);
            } else {
                const r = el.getBoundingClientRect();
                left = Math.round(r.left - dRect.left);
                top = Math.round(r.top - dRect.top);
            }
            const w = el.offsetWidth || 0;
            const h = el.offsetHeight || 0;
            left = Math.max(
                0,
                Math.min(left, Math.max(0, Math.round(dRect.width - w)))
            );
            top = Math.max(
                0,
                Math.min(top, Math.max(0, Math.round(dRect.height - h)))
            );
            el.style.position = 'absolute';
            el.style.left = left + 'px';
            el.style.top = top + 'px';
        });
    }
    function clearAbsoluteStyles() {
        icons().forEach((el) => {
            el.style.position = '';
            el.style.left = '';
            el.style.top = '';
        });
    }
    function autoArrangeIcons() {
        const list = icons()
            .slice()
            .sort((a, b) =>
                a
                    .querySelector('.label')
                    .textContent.localeCompare(b.querySelector('.label').textContent)
            );
        list.forEach((el) => desktop.appendChild(el));
        saveOrder();
    }
    function isEmpty(obj) {
        return !obj || Object.keys(obj).length === 0;
    }
    function applyLayoutState() {
        // read align-grid flag from storage to decide layout
        let alignGrid = true;
        try { alignGrid = localStorage.getItem('align-grid') !== '0'; } catch (e) { }
        let autoArrange = false;
        try { autoArrange = localStorage.getItem('auto-arrange') === '1'; } catch (e) { }

        if (!alignGrid) {
            // Switching to free layout. Capture current (grid) positions first if needed
            const hadFree = desktop.classList.contains('free-layout');
            let map = getPosMap();
            if (!hadFree && isEmpty(map)) {
                map = snapshotPositionsFromCurrentLayout();
                savePosMap(map);
            }
            if (isEmpty(map)) {
                // Fallback snapshot
                map = snapshotPositionsFromCurrentLayout();
                savePosMap(map);
            }
            // Apply absolute positions before toggling class to avoid default offsets
            applyAbsolutePositions(map);
            desktop.classList.add('free-layout');
            return;
        }
        // Back to grid: clear abs positioning and optional auto-arrange
        desktop.classList.remove('free-layout');
        try {
            localStorage.removeItem('icon-pos');
        } catch { }
        clearAbsoluteStyles();
        if (autoArrange) autoArrangeIcons();
    }
    // Expose key functions globally so the main script can call them as before
    window.saveOrder = saveOrder;
    window.loadOrder = loadOrder;
    window.applyOrder = applyOrder;
    window.getPosMap = getPosMap;
    window.savePosMap = savePosMap;
    window.normalizePosMap = normalizePosMap;
    window.snapshotPositionsFromCurrentLayout = snapshotPositionsFromCurrentLayout;
    window.applyAbsolutePositions = applyAbsolutePositions;
    window.clearAbsoluteStyles = clearAbsoluteStyles;
    window.autoArrangeIcons = autoArrangeIcons;
    window.applyLayoutState = applyLayoutState;
    window.isEmpty = isEmpty;

    // Smooth pointer dragging with rAF and transform proxy
    let dragEl = null;
    let placeholder = null;
    let startIndex = -1;
    let grabDX = 0;
    let grabDY = 0;
    let rafId = 0;
    let pending = null;
    let proxy = null; // floating visual element for grid drag (unused after change)
    // New: drag threshold handling
    let isDragging = false;
    const DRAG_THRESHOLD = 6; // px
    let startClientX = 0,
        startClientY = 0;
    // Base page coords for grid drag using fixed positioning
    let baseLeft = 0,
        baseTop = 0;

    function cancelRAF() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
    }

    function schedule(fn) {
        pending = fn;
        if (!rafId)
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                const p = pending;
                pending = null;
                p && p();
            });
    }

    function makeProxy(fromEl) {
        const r = fromEl.getBoundingClientRect();
        const d = desktop.getBoundingClientRect();
        const el = fromEl.cloneNode(true);
        el.style.position = 'fixed';
        el.style.left = r.left + 'px';
        el.style.top = r.top + 'px';
        el.style.width = r.width + 'px';
        el.style.height = r.height + 'px';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '10000';
        el.classList.add('dragging');
        // Ensure visibility: bypass base opacity/animation on icons
        el.classList.add('drag-proxy');
        el.style.opacity = '1';
        el.style.animation = 'none';
        // Reduce layout cost while animating
        el.style.willChange = 'transform';
        document.body.appendChild(el);
        return {
            el,
            offsetX: 0,
            offsetY: 0,
            baseLeft: r.left,
            baseTop: r.top,
            drect: d,
        };
    }

    function moveProxy(px, py) {
        if (!proxy) return;
        schedule(() => {
            proxy.el.style.transform = `translate(${px}px, ${py}px)`;
        });
    }

    function endProxy() {
        proxy?.el?.remove();
        proxy = null;
    }

    // Ensure an element becomes absolutely positioned at its current on-screen spot
    function absolutizeAtCurrentPosition(el) {
        const drect = desktop.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        el.style.position = 'absolute';
        el.style.left = Math.round(r.left - drect.left) + 'px';
        el.style.top = Math.round(r.top - drect.top) + 'px';
    }

    function startDragFree(e, icon) {
        dragEl = icon;
        const r = icon.getBoundingClientRect();
        grabDX = e.clientX - r.left;
        grabDY = e.clientY - r.top;
        // Convert to absolute at current position to avoid defaulting to 24,24
        absolutizeAtCurrentPosition(icon);
        icon.classList.add('dragging');
        icon.style.opacity = '0.85';
        try {
            icon.setPointerCapture(e.pointerId);
        } catch { }
        // prevent scroll during drag on touch
        document.body.style.overscrollBehavior = 'contain';
        document.body.style.touchAction = 'none';
    }

    function startDragGrid(e, icon) {
        // Use the real element in fixed positioning so it stays visible
        dragEl = icon;
        startIndex = icons().indexOf(icon);
        const r = icon.getBoundingClientRect();
        baseLeft = r.left;
        baseTop = r.top;
        grabDX = e.clientX - r.left;
        grabDY = e.clientY - r.top;

        // Insert a sized placeholder to preserve grid flow during drag
        placeholder = document.createElement('div');
        placeholder.className = 'icon';
        placeholder.style.visibility = 'hidden';
        placeholder.style.width = r.width + 'px';
        placeholder.style.height = r.height + 'px';
        desktop.insertBefore(placeholder, icon.nextSibling);

        // Lift the real icon
        icon.classList.add('dragging');
        icon.style.position = 'fixed';
        icon.style.left = r.left + 'px';
        icon.style.top = r.top + 'px';
        icon.style.width = r.width + 'px';
        icon.style.height = r.height + 'px';
        icon.style.zIndex = '10000';
        icon.style.pointerEvents = 'none';
        try {
            icon.setPointerCapture(e.pointerId);
        } catch { }
        // prevent scroll during drag on touch
        document.body.style.overscrollBehavior = 'contain';
        document.body.style.touchAction = 'none';
    }

    // Pointer events with threshold

    desktop && desktop.addEventListener('pointerdown', (e) => {
        const icon = e.target.closest('.icon');
        if (!icon || e.button === 2) return; // ignore right click

        // Record starting point; do not start drag yet
        isDragging = false;
        dragEl = icon;
        startClientX = e.clientX;
        startClientY = e.clientY;
        // Do not modify DOM until threshold exceeded
    });

    desktop && desktop.addEventListener('pointermove', (e) => {
        if (!dragEl) return;

        // If not yet dragging, check threshold
        if (!isDragging) {
            const dx = e.clientX - startClientX;
            const dy = e.clientY - startClientY;
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            // Start drag now
            isDragging = true;
            // read align-grid flag from storage
            let alignGrid = true;
            try { alignGrid = localStorage.getItem('align-grid') !== '0'; } catch (e) { }
            if (!alignGrid) startDragFree(e, dragEl);
            else startDragGrid(e, dragEl);
        }

        if (!localStorage || localStorage.getItem('align-grid') === '0') {
            const drect = desktop.getBoundingClientRect();
            let x = e.clientX - drect.left - grabDX;
            let y = e.clientY - drect.top - grabDY;
            const elRect = dragEl.getBoundingClientRect();
            x = Math.max(0, Math.min(x, drect.width - elRect.width));
            y = Math.max(0, Math.min(y, drect.height - elRect.height));
            schedule(() => {
                dragEl.style.left = x + 'px';
                dragEl.style.top = y + 'px';
            });
            return;
        }

        // grid mode: move the fixed-positioned real element
        schedule(() => {
            const x = e.clientX - grabDX;
            const y = e.clientY - grabDY;
            dragEl.style.left = x + 'px';
            dragEl.style.top = y + 'px';
        });

        // use elementFromPoint to reorder
        const elUnder = document.elementFromPoint(e.clientX, e.clientY);
        const target = elUnder?.closest?.('.icon');
        if (!target || target === dragEl || target === placeholder) return;
        const list = icons();
        const tgtIdx = list.indexOf(target);
        if (tgtIdx > startIndex)
            desktop.insertBefore(placeholder, target.nextSibling);
        else desktop.insertBefore(placeholder, target);
    });

    window.addEventListener('pointerup', (e) => {
        if (!dragEl) return;

        // restore touch behavior
        document.body.style.overscrollBehavior = '';
        document.body.style.touchAction = '';

        // If drag never started, just cleanup and let click/dblclick proceed
        if (!isDragging) {
            try {
                dragEl.releasePointerCapture?.(e.pointerId);
            } catch { }
            dragEl = null;
            cancelRAF();
            return;
        }

        // detect current layout
        let alignGrid = true;
        try { alignGrid = localStorage.getItem('align-grid') !== '0'; } catch (e) { }

        if (!alignGrid) {
            const map = getPosMap();
            const id = dragEl.dataset.id;
            map[id] = {
                left: Math.round(parseFloat(dragEl.style.left || '0')),
                top: Math.round(parseFloat(dragEl.style.top || '0')),
            };
            savePosMap(map);
            dragEl.classList.remove('dragging');
            dragEl.style.opacity = '';
            try {
                dragEl.releasePointerCapture(e.pointerId);
            } catch { }
            dragEl = null;
            cancelRAF();
            return;
        }

        // grid finalize: place real element where placeholder is and restore styles
        const finalBefore = placeholder.nextSibling;
        desktop.insertBefore(dragEl, finalBefore);
        // restore element styles
        dragEl.classList.remove('dragging');
        dragEl.style.position = '';
        dragEl.style.left = '';
        dragEl.style.top = '';
        dragEl.style.width = '';
        dragEl.style.height = '';
        dragEl.style.zIndex = '';
        dragEl.style.pointerEvents = '';
        placeholder?.remove();
        placeholder = null;
        saveOrder();
        try {
            dragEl.releasePointerCapture(e.pointerId);
        } catch { }
        endProxy();
        dragEl = null;
        startIndex = -1;
        isDragging = false;
        cancelRAF();
    });

    // Power overlay logic
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
    const powerOverlay = document.getElementById('powerOverlay');
    const powerBtn = document.getElementById('powerBtn');
    function setPowerState(on) {
        localStorage.setItem('power-on', on ? '1' : '0');
        if (on) {
            powerOverlay.setAttribute('aria-hidden', 'true');
        } else {
            powerOverlay.setAttribute('aria-hidden', 'false');
        }
        updateDesktopVisibility();
    }
    function getPowerState() {
        return localStorage.getItem('power-on') === '1';
    }
    function showPowerOverlay() {
        setPowerState(false);
    }
    function hidePowerOverlay() {
        setPowerState(true);
    }
    powerBtn?.addEventListener('click', () => {
        hidePowerOverlay();
        // When user powers on, also attempt to enter fullscreen
        tryEnterFullscreen();
    });
    window.addEventListener('DOMContentLoaded', () => {
        if (!getPowerState()) {
            powerOverlay.setAttribute('aria-hidden', 'false');
            updateHistoryUI();
        } else {
            powerOverlay.setAttribute('aria-hidden', 'true');
        }
        updateDesktopVisibility();
    });
    const observer = new MutationObserver(updateDesktopVisibility);
    observer.observe(powerOverlay, { attributes: true });

    // Window modal drag logic for recycle bin and terminal (FIXED accurate offset)
    function makeDraggable(modalId, barId) {
        const modal = document.getElementById(modalId);
        const bar = document.getElementById(barId);
        let isDragging = false, offsetX = 0, offsetY = 0;

        if (!modal || !bar) return;

        // Ensure modal has proper positioning
        modal.style.position = 'fixed';

        bar.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;

            // FIXED: Calculate offset from mouse to modal's top-left corner
            const rect = modal.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.body.style.userSelect = 'none';
            modal.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // FIXED: Calculate new position using accurate offset
            let left = e.clientX - offsetX;
            let top = e.clientY - offsetY;

            // Constrain to viewport
            left = Math.max(0, Math.min(left, window.innerWidth - modal.offsetWidth));
            top = Math.max(0, Math.min(top, window.innerHeight - modal.offsetHeight));

            modal.style.left = left + 'px';
            modal.style.top = top + 'px';
            modal.style.transform = 'none'; // Remove any centering transform
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
            modal.style.cursor = '';
        });
    }

    // Initialize draggable windows
    makeDraggable('recycleBinModal', 'recycleBinBar');
    makeDraggable('terminalModal', 'terminalBar');

    // Add thick blinking cursor style
    const style = document.createElement('style');
    style.textContent = `@keyframes blink-cursor { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
.terminal-cursor { border-left: 3px solid #00ea65; animation: blink-cursor 1s steps(1) infinite; }`;
    document.head.appendChild(style);

    // add resizer handle to terminal modal
    (function addTerminalResizer() {
        if (!terminalModal) return;
        const handle = document.createElement('div');
        handle.className = 'terminal-resize-handle';
        handle.style.position = 'absolute';
        handle.style.right = '4px';
        handle.style.bottom = '4px';
        handle.style.width = '18px';
        handle.style.height = '18px';
        handle.style.cursor = 'nwse-resize';
        handle.style.zIndex = 10010;
        terminalModal.appendChild(handle);
        let resizing = false;
        let startX = 0, startY = 0, startW = 0, startH = 0;
        handle.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            resizing = true;
            startX = e.clientX; startY = e.clientY;
            startW = terminalModal.offsetWidth; startH = terminalModal.offsetHeight;
            document.body.style.userSelect = 'none';
        });
        window.addEventListener('pointermove', function (e) {
            if (!resizing) return;
            let w = Math.max(240, startW + (e.clientX - startX));
            let h = Math.max(120, startH + (e.clientY - startY));
            terminalModal.style.width = w + 'px';
            terminalModal.style.height = h + 'px';
        });
        window.addEventListener('pointerup', function () {
            if (!resizing) return;
            resizing = false;
            document.body.style.userSelect = '';
        });
    })();

    // append caret and resize CSS into existing style block (if present) or inject new
    (function ensureCaretStyles() {
        const css = `
@keyframes blink-cursor { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
.inline-caret { display: inline-block; width: 2px; height: 1em; background: #00ea65; vertical-align: middle; animation: blink-cursor 1s steps(1) infinite; margin: 0 2px; }
.terminal-resize-handle { background: rgba(255,255,255,0.03); border-radius:3px; }
`;
        const s = document.createElement('style');
        s.textContent = css;
        document.head.appendChild(s);
    })();

    function adjustTerminalContentSize() {
        if (!terminalModal || !terminalOutput) return;
        // Try to find header/bar height if present
        const bar = document.getElementById('terminalBar') || terminalModal.querySelector('.window-bar') || null;
        const footer = terminalModal.querySelector('.window-footer') || null;
        const modalStyles = getComputedStyle(terminalModal);
        const padTop = parseInt(modalStyles.paddingTop || 0, 10) || 0;
        const padBottom = parseInt(modalStyles.paddingBottom || 0, 10) || 0;
        const headerH = bar ? (bar.offsetHeight || 0) : 40; // fallback
        const footerH = footer ? (footer.offsetHeight || 0) : 8;
        // Set terminalOutput height to fill remaining modal area
        const innerH = terminalModal.clientHeight - headerH - footerH - padTop - padBottom - 16; // extra gap
        terminalOutput.style.maxHeight = Math.max(80, innerH) + 'px';
        terminalOutput.style.overflow = 'auto';
        terminalOutput.style.width = '100%';
    }

    // Observe modal size changes (works while user drags resizer)
    if (window.ResizeObserver && terminalModal) {
        try {
            const ro = new ResizeObserver(() => adjustTerminalContentSize());
            ro.observe(terminalModal);
        } catch (e) {
            // ignore
        }
    }

    // Ensure content adjusts when prompts are rendered or modal opened
    const origRenderTerminalPrompt = renderTerminalPrompt;
    function renderTerminalPromptWrapper() {
        origRenderTerminalPrompt();
        adjustTerminalContentSize();
    }
    // replace reference if function exists
    if (typeof renderTerminalPrompt === 'function') renderTerminalPrompt = renderTerminalPromptWrapper;

    // Call adjust when opening terminal
    (function hookTerminalOpen() {
        if (!terminalIcon) return;
        const openHandler = (e) => {
            if (e.detail === 2) return; // dbl handled elsewhere
            terminalModal.setAttribute('aria-hidden', 'false');
            terminalModal.style.display = 'block';
            adjustTerminalContentSize();
            // ensure modal gets keyboard focus
            setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
        };
        terminalIcon.addEventListener('click', openHandler);
        terminalIcon.addEventListener('dblclick', (e) => {
            e.preventDefault();
            terminalModal.setAttribute('aria-hidden', 'false');
            terminalModal.style.display = 'block';
            adjustTerminalContentSize();
            // ensure modal gets keyboard focus
            setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
        });
    })();

    // Attempt to enter fullscreen on load; if blocked, add a one-time click fallback
    function tryEnterFullscreen() {
        const el = document.documentElement;
        if (document.fullscreenElement) return;
        if (!el.requestFullscreen) return;
        // Try to request fullscreen now; if rejected due to no gesture, install one-time click handler
        el.requestFullscreen().catch(() => {
            const onClick = () => {
                el.requestFullscreen().catch(() => { /* ignore */ });
            };
            document.addEventListener('click', onClick, { once: true });
        });
    }

    // Hook into existing DOMContentLoaded where power overlay is initialized
    window.addEventListener('DOMContentLoaded', () => {
        tryEnterFullscreen();
    });

    function adjustRecycleBinContentSize() {
        if (!recycleBinModal || !recycleBinList) return;
        const bar = document.getElementById('recycleBinBar') || recycleBinModal.querySelector('.window-bar') || null;
        const modalStyles = getComputedStyle(recycleBinModal);
        const padTop = parseInt(modalStyles.paddingTop || 0, 10) || 0;
        const padBottom = parseInt(modalStyles.paddingBottom || 0, 10) || 0;
        const headerH = bar ? (bar.offsetHeight || 0) : 40;
        const innerH = recycleBinModal.clientHeight - headerH - padTop - padBottom - 16;
        recycleBinList.style.maxHeight = Math.max(80, innerH) + 'px';
        recycleBinList.style.overflow = 'auto';
        recycleBinList.style.width = '100%';
    }

    // Observe modal size changes (works while user drags resizer)
    if (window.ResizeObserver && recycleBinModal) {
        try {
            const ro = new ResizeObserver(() => adjustRecycleBinContentSize());
            ro.observe(recycleBinModal);
        } catch (e) {
            // ignore
        }
    }

    // Ensure content adjusts when modal opened
    const origUpdateRecycleBinList = updateRecycleBinList;
    function updateRecycleBinListWrapper() {
        origUpdateRecycleBinList();
        adjustRecycleBinContentSize();
    }
    // replace reference if function exists
    if (typeof updateRecycleBinList === 'function') updateRecycleBinList = updateRecycleBinListWrapper;

    // Call adjust when opening recycle bin
    (function hookRecycleBinOpen() {
        if (!recycleBinIcon) return;
        const openHandler = (e) => {
            if (e.detail === 2) return; // dbl handled elsewhere
            recycleBinModal.setAttribute('aria-hidden', 'false');
            recycleBinModal.style.display = 'block';
            adjustRecycleBinContentSize();
        };
        recycleBinIcon.addEventListener('click', openHandler);
        recycleBinIcon.addEventListener('dblclick', (e) => {
            e.preventDefault();
            recycleBinModal.setAttribute('aria-hidden', 'false');
            recycleBinModal.style.display = 'block';
            adjustRecycleBinContentSize();
        });
    })();

    // Add Restore All button and resizer handle to recycle bin modal
    (function addRecycleBinControlsAndResizer() {
        const bar = document.getElementById('recycleBinBar');
        if (!bar) return;
        // Restore All button
        if (!document.getElementById('restoreAllBtn')) {
            const btn = document.createElement('button');
            btn.id = 'restoreAllBtn';
            btn.textContent = 'Restore All';
            btn.style.marginLeft = '8px';
            btn.style.background = '#16a34a';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '6px 8px';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            // hide by default until password unlocks
            btn.style.display = 'none';
            const closeBtn = bar.querySelector('.window-close');
            if (closeBtn) bar.insertBefore(btn, closeBtn);
            else bar.appendChild(btn);
            btn.addEventListener('click', async () => {
                const deleted = Array.from(getDeletedSet()).filter(id => id !== 'recyclebin' && id !== 'terminal');
                if (!deleted.length) return;
                const ok = await showSweetAlert('Restore All', 'Restore all items from the Recycle Bin?', 'Restore All', 'Cancel');
                if (!ok) return;
                deleted.forEach(id => restoreDeletedIcon(id));
                updateRecycleBinList();
            });
        }
        // Resizer handle
        if (document.querySelector('.recyclebin-resize-handle')) return;
        if (!recycleBinModal) return;
        const handle = document.createElement('div');
        handle.className = 'recyclebin-resize-handle';
        handle.style.position = 'absolute';
        handle.style.right = '6px';
        handle.style.bottom = '6px';
        handle.style.width = '18px';
        handle.style.height = '18px';
        handle.style.cursor = 'nwse-resize';
        handle.style.zIndex = 10010;
        recycleBinModal.appendChild(handle);
        let resizing = false;
        let startX = 0, startY = 0, startW = 0, startH = 0;
        handle.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            resizing = true;
            startX = e.clientX; startY = e.clientY;
            startW = recycleBinModal.offsetWidth; startH = recycleBinModal.offsetHeight;
            document.body.style.userSelect = 'none';
        });
        window.addEventListener('pointermove', function (e) {
            if (!resizing) return;
            let w = Math.max(240, startW + (e.clientX - startX));
            let h = Math.max(120, startH + (e.clientY - startY));
            recycleBinModal.style.width = w + 'px';
            recycleBinModal.style.height = h + 'px';
            if (typeof adjustRecycleBinContentSize === 'function') adjustRecycleBinContentSize();
        });
        window.addEventListener('pointerup', function () {
            if (!resizing) return;
            resizing = false;
            document.body.style.userSelect = '';
        });
    })();
})();