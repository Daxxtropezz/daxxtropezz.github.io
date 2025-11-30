// Recycle Bin logic (moved)
(function () {
    const recycleBinIcon = document.querySelector('[data-id="recyclebin"]');
    const recycleBinModal = document.getElementById('recycleBinModal');
    const recycleBinList = document.getElementById('recycleBinList');
    const closeRecycleBin = document.getElementById('closeRecycleBin');
    const recycleBinPasswordWrap = document.getElementById('recycleBinPasswordWrap');
    const recycleBinPasswordInput = document.getElementById('recycleBinPasswordInput');
    const recycleBinPasswordBtn = document.getElementById('recycleBinPasswordBtn');
    const RECYCLE_BIN_PASSWORD = 'DaxxyOS{this_is_my_bin}';
    let recycleBinUnlocked = false;
    let incorrectPasswordCount = 0;

    // Small helper: show a simple sweet-alert style confirmation, returns Promise<boolean>
    function showSweetAlert(title, text, confirmText = 'Restore', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.background = 'rgba(0,0,0,0.45)';
            overlay.style.zIndex = '20000';
            const box = document.createElement('div');
            box.style.width = '320px';
            box.style.maxWidth = '90%';
            box.style.margin = '12% auto';
            box.style.background = '#111';
            box.style.border = '1px solid #333';
            box.style.borderRadius = '8px';
            box.style.padding = '18px';
            box.style.color = '#ddd';
            box.style.fontFamily = 'Share Tech Mono, monospace';
            box.style.textAlign = 'center';
            const h = document.createElement('div'); h.style.fontWeight = '700'; h.style.marginBottom = '8px'; h.textContent = title;
            const p = document.createElement('div'); p.style.marginBottom = '14px'; p.textContent = text;
            const btnWrap = document.createElement('div'); btnWrap.style.display = 'flex'; btnWrap.style.justifyContent = 'center'; btnWrap.style.gap = '8px';
            const ok = document.createElement('button'); ok.textContent = confirmText; ok.style.background = '#10b981'; ok.style.border = 'none'; ok.style.color = '#fff'; ok.style.padding = '8px 12px'; ok.style.borderRadius = '6px';
            const cancel = document.createElement('button'); cancel.textContent = cancelText; cancel.style.background = '#333'; cancel.style.border = 'none'; cancel.style.color = '#fff'; cancel.style.padding = '8px 12px'; cancel.style.borderRadius = '6px';
            btnWrap.appendChild(ok); btnWrap.appendChild(cancel);
            box.appendChild(h); box.appendChild(p); box.appendChild(btnWrap);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            ok.addEventListener('click', () => { overlay.remove(); resolve(true); });
            cancel.addEventListener('click', () => { overlay.remove(); resolve(false); });
        });
    }
    window.showSweetAlert = showSweetAlert;

    function getDeletedSet() {
        try {
            return new Set(JSON.parse(localStorage.getItem('icon-deleted') || '[]'));
        } catch {
            return new Set();
        }
    }
    function saveDeletedSet(set) {
        localStorage.setItem('icon-deleted', JSON.stringify(Array.from(set)));
    }
    function applyDeletedIcons() {
        // Initialize deleted state if missing so icons hide immediately
        if (localStorage.getItem('icon-deleted') === null) {
            try {
                const ids = Array.from(document.querySelectorAll('.icon')).map(i => i.dataset.id).filter(Boolean).filter(id => id !== 'recyclebin' && id !== 'terminal');
                localStorage.setItem('icon-deleted', JSON.stringify(ids));
            } catch (e) { /* ignore */ }
        }
        const deleted = getDeletedSet();
        document.querySelectorAll('.icon').forEach((icon) => {
            const id = icon.dataset.id;
            // Never remove recyclebin or terminal from the DOM
            if (id === 'recyclebin' || id === 'terminal') return;
            if (deleted.has(id)) {
                icon.style.display = 'none';
                icon.classList.add('deleted');
            } else {
                icon.style.display = '';
                icon.classList.remove('deleted');
            }
        });
    }
    applyDeletedIcons();

    function updateRecycleBinList() {
        // gather deleted items excluding system icons
        const deletedAll = Array.from(getDeletedSet()).filter(id => id !== 'recyclebin' && id !== 'terminal');
        const rbtn = document.getElementById('restoreAllBtn');
        if (!recycleBinList) return;
        if (!recycleBinUnlocked) {
            recycleBinList.innerHTML = '';
            if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'block';
            // show Restore All when there are deleted items but keep it disabled until unlocked
            if (rbtn) {
                if (deletedAll.length) {
                    rbtn.style.display = 'inline-block';
                    rbtn.disabled = true;
                    rbtn.style.opacity = '0.5';
                    rbtn.title = 'Unlock Recycle Bin to enable Restore All';
                } else {
                    rbtn.style.display = 'none';
                }
            }
            return;
        }
        if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'none';
        // enable Restore All when unlocked (only if there are deleted items)
        if (rbtn) {
            rbtn.style.display = deletedAll.length ? 'inline-block' : 'none';
            rbtn.disabled = false;
            rbtn.style.opacity = '';
            rbtn.title = '';
        }
        const deleted = deletedAll;
        const labelMap = (function () {
            try {
                return JSON.parse(localStorage.getItem('icon-labels') || '{}');
            } catch {
                return {};
            }
        })();
        recycleBinList.innerHTML = '';
        if (!deleted.length) {
            recycleBinList.innerHTML = '<div style="color:#aaa;padding:12px;">Recycle Bin is empty.</div>';
            return;
        }
        deleted.forEach(id => {
            const label = labelMap[id] || id;
            const item = document.createElement('div');
            item.className = 'recyclebin-item';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.style.padding = '8px';
            item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            const txt = document.createElement('span');
            txt.textContent = label;
            const btn = document.createElement('button');
            btn.textContent = 'Restore';
            btn.style.background = '#2563eb';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '6px 8px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                const ok = await showSweetAlert('Restore Application', `Are you sure you want to restore '${label}'?`, 'Restore', 'Cancel');
                if (ok) {
                    restoreDeletedIcon(id);
                }
            });
            item.appendChild(txt);
            item.appendChild(btn);
            item.setAttribute('data-id', id);
            item.style.cursor = 'default';
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // also offer restore via context menu
                showSweetAlert('Restore Application', `Restore '${label}'?`, 'Restore', 'Cancel').then((ok) => { if (ok) restoreDeletedIcon(id); });
            });
            recycleBinList.appendChild(item);
        });
    }

    function restoreDeletedIcon(id) {
        const deleted = getDeletedSet();
        if (deleted.has(id)) {
            deleted.delete(id);
            saveDeletedSet(deleted);
        }
        // Restore icon to desktop without reloading
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) {
            el.style.display = '';
            el.classList.remove('deleted');
        }
        // Ensure order includes id
        try {
            const order = JSON.parse(localStorage.getItem('icon-order') || '[]');
            if (!order.includes(id)) order.push(id);
            localStorage.setItem('icon-order', JSON.stringify(order));
        } catch (e) { /* ignore */ }
        // Update recycle list UI
        updateRecycleBinList();
    }
    recycleBinIcon?.addEventListener('dblclick', (e) => {
        e.preventDefault();
        recycleBinModal && recycleBinModal.setAttribute('aria-hidden', 'false');
        if (recycleBinModal) recycleBinModal.style.display = 'block';
        recycleBinUnlocked = false;
        updateRecycleBinList();
    });
    recycleBinIcon?.addEventListener('click', (e) => {
        // Only open modal if not double-click (handled above)
        if (e.detail === 2) return;
        recycleBinModal && recycleBinModal.setAttribute('aria-hidden', 'false');
        if (recycleBinModal) recycleBinModal.style.display = 'block';
        recycleBinUnlocked = false;
        updateRecycleBinList();
    });
    closeRecycleBin?.addEventListener('click', () => {
        recycleBinModal && recycleBinModal.setAttribute('aria-hidden', 'true');
        if (recycleBinModal) recycleBinModal.style.display = 'none';
        recycleBinUnlocked = false;
        if (recycleBinPasswordInput) recycleBinPasswordInput.value = '';
    });
    if (recycleBinPasswordBtn) {
        recycleBinPasswordBtn.addEventListener('click', () => {
            if (!recycleBinPasswordInput) return;
            if (recycleBinPasswordInput.value === RECYCLE_BIN_PASSWORD) {
                recycleBinUnlocked = true;
                incorrectPasswordCount = 0;
                updateRecycleBinList();
            } else {
                incorrectPasswordCount++;
                let err = document.getElementById('recycleBinErrorMsg');
                if (!err) {
                    err = document.createElement('div');
                    err.id = 'recycleBinErrorMsg';
                    err.style.color = '#f87171';
                    err.style.fontSize = '13px';
                    err.style.marginTop = '2px';
                    recycleBinPasswordWrap && recycleBinPasswordWrap.appendChild(err);
                }
                if (err) {
                    err.textContent = 'Incorrect password.';
                    if (incorrectPasswordCount >= 3) {
                        err.textContent += ' Hint: The hint must be found hidden in the terminal.';
                    }
                }
                if (recycleBinPasswordInput) recycleBinPasswordInput.style.borderColor = '#f87171';
                setTimeout(() => {
                    if (err) err.textContent = '';
                    if (recycleBinPasswordInput) recycleBinPasswordInput.style.borderColor = '#333';
                }, 3000);
            }
        });
    }
    if (recycleBinPasswordInput) {
        recycleBinPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                recycleBinPasswordBtn && recycleBinPasswordBtn.click();
            }
        });
    }

    // Add Restore All button and resizer handle to recycle bin modal (same as original)
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
            // adjustRecycleBinContentSize if present on page
            const fn = window.adjustRecycleBinContentSize;
            if (typeof fn === 'function') fn();
        });
        window.addEventListener('pointerup', function () {
            if (!resizing) return;
            resizing = false;
            document.body.style.userSelect = '';
        });
    })();
})();