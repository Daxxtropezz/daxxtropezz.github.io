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
	function initAbsolutePositions() {
		const map = getPosMap();
		const dRect = desktop.getBoundingClientRect();
		icons().forEach((el) => {
			const id = el.dataset.id;
			let p = map[id];
			if (!p) {
				const r = el.getBoundingClientRect();
				p = { left: r.left - dRect.left, top: r.top - dRect.top };
				map[id] = p;
			}
			el.style.position = 'absolute';
			el.style.left = p.left + 'px';
			el.style.top = p.top + 'px';
		});
		savePosMap(map);
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
	function applyLayoutState() {
		desktop.classList.toggle('free-layout', !alignGrid);
		if (!alignGrid) {
			initAbsolutePositions();
		} else {
			clearAbsoluteStyles();
			if (autoArrange) autoArrangeIcons();
		}
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
	let proxy = null; // floating visual element for grid drag

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

	desktop.addEventListener('pointerdown', (e) => {
		const icon = e.target.closest('.icon');
		if (!icon) return;
		if (e.button === 2) return; // ignore right click

		// prevent scroll during drag on touch
		document.body.style.overscrollBehavior = 'contain';
		document.body.style.touchAction = 'none';

		if (!alignGrid) {
			dragEl = icon;
			const r = icon.getBoundingClientRect();
			grabDX = e.clientX - r.left;
			grabDY = e.clientY - r.top;
			icon.classList.add('dragging');
			icon.style.opacity = '0.85';
			try {
				icon.setPointerCapture(e.pointerId);
			} catch {}
			return;
		}

		// grid mode: use floating proxy for smoother drag
		dragEl = icon;
		startIndex = indexOfIcon(icon);
		icon.style.visibility = 'hidden';
		placeholder = document.createElement('div');
		placeholder.className = 'icon';
		placeholder.style.visibility = 'hidden';
		desktop.insertBefore(placeholder, icon.nextSibling);
		proxy = makeProxy(icon);
		grabDX = e.clientX - proxy.baseLeft;
		grabDY = e.clientY - proxy.baseTop;
		try {
			icon.setPointerCapture(e.pointerId);
		} catch {}
	});

	desktop.addEventListener('pointermove', (e) => {
		if (!dragEl) return;

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

		// grid mode with proxy
		const dx = e.clientX - proxy.baseLeft - grabDX;
		const dy = e.clientY - proxy.baseTop - grabDY;
		moveProxy(dx, dy);

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

		if (!alignGrid) {
			const map = getPosMap();
			const id = dragEl.dataset.id;
			map[id] = {
				left: parseFloat(dragEl.style.left || '0'),
				top: parseFloat(dragEl.style.top || '0'),
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

		// grid finalize: place real element where placeholder is and animate proxy back
		const finalBefore = placeholder.nextSibling;
		desktop.insertBefore(dragEl, finalBefore);
		dragEl.style.visibility = '';
		placeholder?.remove();
		placeholder = null;
		saveOrder();
		try {
			dragEl.releasePointerCapture(e.pointerId);
		} catch {}
		endProxy();
		dragEl = null;
		startIndex = -1;
		cancelRAF();
	});
})();
