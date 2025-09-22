// DaxxyOS desktop behavior
(function () {
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
		// Removed taskbar position toggles from context menu
		if (ctxRefresh) ctxRefresh.style.display = isIcon ? 'none' : 'block';
		if (ctxShutdown) ctxShutdown.style.display = isIcon ? 'none' : 'block';
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
		try {
			window.close();
		} catch (e) {}
		location.href = 'about:blank';
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

	// Clock with seconds (digital) — update both taskbar and center clock
	const clock = $('#clock');
	const clockCenter = $('#clockCenter');
	function fmt(n) {
		return n.toString().padStart(2, '0');
	}
	function tick() {
		const d = new Date();
		const t = `${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(
			d.getSeconds()
		)}`;
		if (clock) clock.textContent = t;
		if (clockCenter) clockCenter.textContent = t;
	}
	tick();
	setInterval(tick, 1000);

	// Selection + double-click open
	let lastClickTime = 0;
	const dblDelay = 280; // ms
	function openURL(url) {
		if (!url) return;
		const w = window.open(url, '_blank', 'noopener');
		if (w) {
			try {
				w.opener = null;
			} catch (e) {}
		}
	}

	icons().forEach((icon) => {
		icon.addEventListener('click', () => {
			icons().forEach((i) => i.classList.remove('selected'));
			icon.classList.add('selected');
			const now = Date.now();
			if (now - lastClickTime < dblDelay)
				openURL(icon.getAttribute('data-url'));
			lastClickTime = now;
		});
		icon.addEventListener('dblclick', (e) => {
			e.preventDefault();
			openURL(icon.getAttribute('data-url'));
		});
		icon.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') openURL(icon.getAttribute('data-url'));
		});
	});

	// Keyboard navigation (arrow keys)
	document.addEventListener('keydown', (e) => {
		const focused = document.activeElement?.closest?.('.icon');
		if (!focused) return;
		const list = icons();
		const idx = list.indexOf(focused);
		const cols = Math.max(1, Math.floor(document.body.clientWidth / 120));
		if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key))
			e.preventDefault();
		if (e.key === 'ArrowRight' && idx < list.length - 1) list[idx + 1].focus();
		if (e.key === 'ArrowLeft' && idx > 0) list[idx - 1].focus();
		if (e.key === 'ArrowDown' && idx + cols < list.length)
			list[idx + cols].focus();
		if (e.key === 'ArrowUp' && idx - cols >= 0) list[idx - cols].focus();
	});

	// Block Ctrl/Cmd+A text selection across the app (allow in inputs if any)
	document.addEventListener('keydown', (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
			const tag =
				(document.activeElement && document.activeElement.tagName) || '';
			if (!/INPUT|TEXTAREA/.test(tag)) e.preventDefault();
		}
	});

	// Grid-based drag and drop reordering with persistence
	function saveOrder() {
		const order = icons().map((i) => i.dataset.id);
		localStorage.setItem('icon-order', JSON.stringify(order));
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
		if (!order.length) return;
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
		localStorage.setItem('icon-pos', JSON.stringify(m));
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
		} catch {}
		clearAbsoluteStyles();
		if (autoArrange) autoArrangeIcons();
	}
	applyLayoutState();

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
		} catch {}
		// prevent scroll during drag on touch
		document.body.style.overscrollBehavior = 'contain';
		document.body.style.touchAction = 'none';
	}

	function startDragGrid(e, icon) {
		// Use the real element in fixed positioning so it stays visible
		dragEl = icon;
		startIndex = indexOfIcon(icon);
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
		} catch {}
		// prevent scroll during drag on touch
		document.body.style.overscrollBehavior = 'contain';
		document.body.style.touchAction = 'none';
	}

	// Pointer events with threshold

	desktop.addEventListener('pointerdown', (e) => {
		const icon = e.target.closest('.icon');
		if (!icon || e.button === 2) return; // ignore right click

		// Record starting point; do not start drag yet
		isDragging = false;
		dragEl = icon;
		startClientX = e.clientX;
		startClientY = e.clientY;
		// Do not modify DOM until threshold exceeded
	});

	desktop.addEventListener('pointermove', (e) => {
		if (!dragEl) return;

		// If not yet dragging, check threshold
		if (!isDragging) {
			const dx = e.clientX - startClientX;
			const dy = e.clientY - startClientY;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
			// Start drag now
			isDragging = true;
			if (!alignGrid) startDragFree(e, dragEl);
			else startDragGrid(e, dragEl);
		}

		if (!alignGrid) {
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
			} catch {}
			dragEl = null;
			cancelRAF();
			return;
		}

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
			} catch {}
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
		} catch {}
		endProxy();
		dragEl = null;
		startIndex = -1;
		isDragging = false;
		cancelRAF();
	});
})();
