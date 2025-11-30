// DaxxyOS desktop behavior
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

	const desktop = $('.desktop');
	const icons = () => $$('.icon', desktop);
	// Helper to get current index of an icon in the grid list (restored for grid drag)
	function indexOfIcon(el) {
		return icons().indexOf(el);
	}

	// Disable default browser context menu and show custom menu everywhere on the app
	const ctxMenu = $('#iconContextMenu');
	const ctxOpen = $('#ctxOpen');
	const ctxCopy = $('#ctxCopy');
	const ctxRefresh = $('#ctxRefresh');
	const ctxShutdown = $('#ctxShutdown');
	const ctxAlign = $('#ctxAlign');
	const ctxAuto = $('#ctxAutoArrange');
	const ctxRename = $('#ctxRename');
	const ctxDelete = $('#ctxDelete');
	let ctxTarget = null; // null => background

	function hideCtx() {
		ctxMenu.classList.remove('show');
		ctxMenu.setAttribute('aria-hidden', 'true');
	}

	// Persistence helpers for toggles
	function loadBool(key, def) {
		const v = localStorage.getItem(key);
		return v === null ? def : v === '1';
	}
	function saveBool(key, val) {
		localStorage.setItem(key, val ? '1' : '0');
	}

	let alignGrid = loadBool('align-grid', true);
	let autoArrange = loadBool('auto-arrange', false);

	function setCheckboxLabel(btn, base, checked) {
		if (!btn) return;
		btn.textContent = (checked ? '✓ ' : '') + base;
		btn.setAttribute('aria-checked', checked ? 'true' : 'false');
	}
	function refreshCtxCheckboxes() {
		setCheckboxLabel(ctxAlign, 'Align icons to grid', alignGrid);
		setCheckboxLabel(ctxAuto, 'Auto arrange icons', autoArrange);
	}

	function showCtx(x, y, type) {
		ctxMenu.style.left = x + 'px';
		ctxMenu.style.top = y + 'px';
		const isIcon = type === 'icon';
		if (ctxOpen) ctxOpen.style.display = isIcon ? 'block' : 'none';
		if (ctxCopy) ctxCopy.style.display = isIcon ? 'block' : 'none';
		if (ctxAlign) ctxAlign.style.display = isIcon ? 'none' : 'block';
		if (ctxAuto) ctxAuto.style.display = isIcon ? 'none' : 'block';
		if (ctxRefresh) ctxRefresh.style.display = isIcon ? 'none' : 'block';
		if (ctxShutdown) ctxShutdown.style.display = isIcon ? 'none' : 'block';
		if (ctxRename) ctxRename.style.display = isIcon ? 'block' : 'none';
		if (ctxDelete) ctxDelete.style.display = isIcon ? 'block' : 'none';
		refreshCtxCheckboxes();
		ctxMenu.classList.add('show');
		ctxMenu.setAttribute('aria-hidden', 'false');
	}

	document.addEventListener('contextmenu', (e) => {
		const inApp = e.target.closest('.desktop-app');
		if (!inApp) return; // allow default outside app
		e.preventDefault();
		const icon = e.target.closest('.icon');
		if (icon) {
			icons().forEach((i) => i.classList.remove('selected'));
			icon.classList.add('selected');
			ctxTarget = icon;
			showCtx(e.pageX, e.pageY, 'icon');
		} else {
			ctxTarget = null;
			showCtx(e.pageX, e.pageY, 'background');
		}
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('#iconContextMenu')) hideCtx();
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') hideCtx();
	});
	window.addEventListener('blur', hideCtx);

	ctxOpen?.addEventListener('click', () => {
		const url = ctxTarget?.getAttribute('data-url');
		if (url) window.open(url, '_blank', 'noopener');
		hideCtx();
	});
	ctxCopy?.addEventListener('click', async () => {
		const url = ctxTarget?.getAttribute('data-url');
		if (!url) return hideCtx();
		try {
			await navigator.clipboard.writeText(url);
		} catch (e) {
			const ta = document.createElement('textarea');
			ta.value = url;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		hideCtx();
	});
	ctxRefresh?.addEventListener('click', () => {
		location.reload();
		hideCtx();
	});
	ctxShutdown?.addEventListener('click', () => {
		showPowerOverlay();
		hideCtx();
	});

	// Removed taskbar position controls and persistence

	// New: Desktop layout toggles
	ctxAlign?.addEventListener('click', () => {
		alignGrid = !alignGrid;
		if (!alignGrid && autoArrange) {
			autoArrange = false;
			saveBool('auto-arrange', false);
		}
		saveBool('align-grid', alignGrid);
		applyLayoutState();
		hideCtx();
	});
	ctxAuto?.addEventListener('click', () => {
		autoArrange = !autoArrange;
		if (autoArrange) {
			alignGrid = true; // Auto-arrange requires grid
			saveBool('align-grid', true);
		}
		saveBool('auto-arrange', autoArrange);
		applyLayoutState();
		hideCtx();
	});

	// Rename label logic
	function getLabelMap() {
		try {
			return JSON.parse(localStorage.getItem('icon-labels') || '{}');
		} catch {
			return {};
		}
	}
	function saveLabelMap(map) {
		localStorage.setItem('icon-labels', JSON.stringify(map));
	}
	function getDefaultLabel(id) {
		const icon = icons().find(i => i.dataset.id === id);
		if (!icon) return id;
		const labelSpan = icon.querySelector('.label');
		return labelSpan ? labelSpan.getAttribute('data-default') || labelSpan.textContent : id;
	}
	function applyLabels() {
		const map = getLabelMap();
		icons().forEach((icon) => {
			const id = icon.dataset.id;
			const labelSpan = icon.querySelector('.label');
			if (!labelSpan) return;
			if (!labelSpan.hasAttribute('data-default')) labelSpan.setAttribute('data-default', labelSpan.textContent);
			const label = map[id];
			if (label) {
				labelSpan.textContent = label;
			} else {
				labelSpan.textContent = labelSpan.getAttribute('data-default');
			}
		});
	}
	applyLabels();
	ctxRename?.addEventListener('click', () => {
		if (!ctxTarget) return hideCtx();
		const labelSpan = ctxTarget.querySelector('.label');
		if (!labelSpan) return hideCtx();
		const current = labelSpan.textContent;
		const defaultLabel = labelSpan.getAttribute('data-default') || current;
		const newLabel = prompt('Rename app label:', current);
		const map = getLabelMap();
		if (!newLabel || !newLabel.trim()) {
			labelSpan.textContent = defaultLabel;
			delete map[ctxTarget.dataset.id];
			saveLabelMap(map);
			hideCtx();
			return;
		}
		if (newLabel !== current) {
			labelSpan.textContent = newLabel.trim();
			map[ctxTarget.dataset.id] = newLabel.trim();
			saveLabelMap(map);
		}
		hideCtx();
	});

	// Delete icon logic
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
				const ids = icons().map(i => i.dataset.id).filter(Boolean).filter(id => id !== 'recyclebin' && id !== 'terminal');
				localStorage.setItem('icon-deleted', JSON.stringify(ids));
			} catch (e) { /* ignore */ }
		}
		const deleted = getDeletedSet();
		icons().forEach((icon) => {
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
	// Prevent deleting protected system icons; show sweet alert on attempt
	ctxDelete?.addEventListener('click', () => {
		if (!ctxTarget) return hideCtx();
		const id = ctxTarget.dataset.id;
		if (!id) return hideCtx();
		if (id === 'recyclebin' || id === 'terminal') {
			hideCtx();
			// reuse existing sweet alert helper
			showSweetAlert('Invalid action!', 'You cannot delete the Recycle Bin or the Terminal.', 'OK', 'Cancel');
			return;
		}
		// hide the icon instead of removing it so it can be restored without a page reload
		ctxTarget.style.display = 'none';
		ctxTarget.classList.add('deleted');
		const deleted = getDeletedSet();
		deleted.add(id);
		saveDeletedSet(deleted);
		hideCtx();
		updateRecycleBinList();
	});

	// Recycle Bin logic moved to: assets/js/modules/recyclebin.js
	// Terminal logic moved to: assets/js/modules/terminal.js
	// Grid-based drag & drop + ordering/persistence moved to: assets/js/modules/dragdrop.js
	// Clock logic moved to: assets/js/modules/clock.js

	// Module loader: load the moved modules relative to this script's location
	(function loadModules() {
		try {
			const scriptEl = document.currentScript;
			const base = scriptEl && scriptEl.src ? scriptEl.src.replace(/\/[^\/]*$/, '/') : '';
			const modules = ['modules/power.js', 'modules/recyclebin.js', 'modules/terminal.js', 'modules/dragdrop.js', 'modules/clock.js'];
			modules.forEach((m) => {
				const s = document.createElement('script');
				s.src = base + m;
				s.defer = true;
				document.head.appendChild(s);
			});
		} catch (e) {
			// If anything fails here, we don't want to break the rest of the script.
			console.warn('Module loader failed', e);
		}
	})();
})();