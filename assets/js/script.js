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
		const deleted = getDeletedSet();
		icons().forEach((icon) => {
			if (deleted.has(icon.dataset.id)) {
				icon.remove();
			}
		});
	}
	applyDeletedIcons();
	ctxDelete?.addEventListener('click', () => {
		if (!ctxTarget) return hideCtx();
		const id = ctxTarget.dataset.id;
		if (!id) return hideCtx();
		ctxTarget.remove();
		const deleted = getDeletedSet();
		deleted.add(id);
		saveDeletedSet(deleted);
		hideCtx();
		updateRecycleBinList();
	});

	// Recycle Bin logic
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

	function updateRecycleBinList() {
		if (!recycleBinUnlocked) {
			recycleBinList.innerHTML = '';
			if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'block';
			return;
		}
		if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'none';
		const deleted = Array.from(getDeletedSet());
		const labelMap = getLabelMap();
		recycleBinList.innerHTML = '';
		if (!deleted.length) {
			recycleBinList.innerHTML = '<div style="color:#aaa;padding:12px;">Recycle Bin is empty.</div>';
			return;
		}
		deleted.forEach(id => {
			const label = labelMap[id] || id;
			const item = document.createElement('div');
			item.className = 'recyclebin-item';
			item.textContent = label;
			item.setAttribute('data-id', id);
			item.style.cursor = 'pointer';
			item.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				restoreDeletedIcon(id);
			});
			recycleBinList.appendChild(item);
		});
	}
	function restoreDeletedIcon(id) {
		const deleted = getDeletedSet();
		deleted.delete(id);
		saveDeletedSet(deleted);
		// Restore icon to desktop
		const order = loadOrder();
		if (!order.includes(id)) order.push(id);
		localStorage.setItem('icon-order', JSON.stringify(order));
		location.reload();
	}
	recycleBinIcon?.addEventListener('dblclick', (e) => {
		e.preventDefault();
		recycleBinModal.setAttribute('aria-hidden', 'false');
		recycleBinModal.style.display = 'block';
		recycleBinUnlocked = false;
		updateRecycleBinList();
	});
	recycleBinIcon?.addEventListener('click', (e) => {
		// Only open modal if not double-click (handled above)
		if (e.detail === 2) return;
		recycleBinModal.setAttribute('aria-hidden', 'false');
		recycleBinModal.style.display = 'block';
		recycleBinUnlocked = false;
		updateRecycleBinList();
	});
	closeRecycleBin?.addEventListener('click', () => {
		recycleBinModal.setAttribute('aria-hidden', 'true');
		recycleBinModal.style.display = 'none';
		recycleBinUnlocked = false;
		if (recycleBinPasswordInput) recycleBinPasswordInput.value = '';
	});
	if (recycleBinPasswordBtn) {
		recycleBinPasswordBtn.addEventListener('click', () => {
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
					recycleBinPasswordWrap.appendChild(err);
				}
				err.textContent = 'Incorrect password.';
				if (incorrectPasswordCount >= 3) {
					err.textContent += ' Hint: The hint must be found hidden in the terminal.';
				}
				recycleBinPasswordInput.style.borderColor = '#f87171';
				setTimeout(() => {
					err.textContent = '';
					recycleBinPasswordInput.style.borderColor = '#333';
				}, 3000);
			}
		});
	}
	if (recycleBinPasswordInput) {
		recycleBinPasswordInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				recycleBinPasswordBtn.click();
			}
		});
	}

	// Terminal logic - FIXED
	const terminalIcon = document.querySelector('[data-id="terminal"]');
	const terminalModal = document.getElementById('terminalModal');
	const terminalOutput = document.getElementById('terminalOutput');
	const closeTerminal = document.getElementById('closeTerminal');
	const secretMessage = "Bin's secret VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==";
	let terminalUser = 'daxxyOS';
	let terminalPrompt = () => `${terminalUser}@daxxyOS:~$ `;
	let terminalInputValue = '';
	let waitingForRootPassword = false;
	let terminalHistory = [];
	let terminalHistoryIndex = -1;

	// Make terminalModal focusable
	if (terminalModal) terminalModal.tabIndex = 0;

	function renderTerminalPrompt() {
		const promptDiv = document.createElement('div');
		promptDiv.className = 'terminal-prompt-line';
		promptDiv.innerHTML = `<span style="font-weight:bold;">${terminalPrompt()}</span><span id="terminalInputSpan"></span><span class="terminal-cursor" style="font-weight:bold;border-left:3px solid #00ea65;animation:blink-cursor 1s steps(1) infinite;">&nbsp;</span>`;
		terminalOutput.appendChild(promptDiv);
		terminalOutput.scrollTop = terminalOutput.scrollHeight;

		// Focus the modal for key events
		terminalModal.focus();
	}

	function printTerminal(text, isCmd = false) {
		const div = document.createElement('div');
		div.textContent = text;
		if (isCmd) div.style.color = '#00ea65';
		if (text === secretMessage) {
			div.style.cursor = 'pointer';
			div.title = 'Click to copy password';
			div.addEventListener('click', function () {
				navigator.clipboard.writeText('VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==').then(() => {
					div.textContent = 'Copied to clipboard!';
					setTimeout(() => { div.textContent = text; }, 1200);
				});
			});
		}
		terminalOutput.appendChild(div);
		terminalOutput.scrollTop = terminalOutput.scrollHeight;
	}

	function handleTerminalCmd(cmd) {
		const trimmed = cmd.trim();
		const lastPromptLine = terminalOutput.querySelector('.terminal-prompt-line:last-child');
		if (lastPromptLine) {
			lastPromptLine.innerHTML = `<span style='font-weight:bold;'>${terminalPrompt()}</span>${trimmed}`;
		}
		if (waitingForRootPassword) {
			if (trimmed === 'root') {
				terminalUser = 'root';
				printTerminal('Switched to root user.');
			} else {
				printTerminal('Wrong password, try again.');
			}
			waitingForRootPassword = false;
			renderTerminalPrompt();
			return;
		}
		if (!trimmed) {
			renderTerminalPrompt();
			return;
		}
		printTerminal(terminalPrompt() + trimmed, true);
		if (trimmed === 'man' || trimmed === 'help') {
			printTerminal('Available commands:');
			printTerminal('ls                - List files');
			printTerminal('whoami            - Show current user');
			printTerminal('root              - Switch to root user (requires password)');
			printTerminal('sudo su           - Switch to root user (requires password)');
			printTerminal('sudo -l           - Switch to root user (requires password)');
			printTerminal('clear             - Clear terminal');
			printTerminal('exit/logout       - Close or logout terminal');
			renderTerminalPrompt();
			return;
		}
		if (terminalUser === 'daxxyOS') {
			if (trimmed === 'ls') {
				// No output
			} else if (trimmed === 'sudo -l' || trimmed === 'sudo su' || trimmed === 'sudo su -' || trimmed === 'root') {
				printTerminal('Password for root:');
				waitingForRootPassword = true;
				return renderTerminalPrompt();
			} else if (trimmed === 'whoami') {
				printTerminal('daxxyOS');
			} else if (trimmed === 'exit' || trimmed === 'logout') {
				terminalModal.setAttribute('aria-hidden', 'true');
				terminalModal.style.display = 'none';
			} else if (trimmed === 'clear') {
				terminalOutput.innerHTML = '';
			} else {
				printTerminal('Command not found: ' + trimmed);
			}
		} else if (terminalUser === 'root') {
			if (trimmed === 'ls') {
				// No output
			} else if (trimmed === 'ls -la') {
				printTerminal('secret.txt');
			} else if (trimmed === 'cat secret.txt') {
				printTerminal(secretMessage);
			} else if (trimmed === 'clear') {
				terminalOutput.innerHTML = '';
			} else if (trimmed === 'whoami') {
				printTerminal('root');
			} else if (trimmed === 'exit' || trimmed === 'logout') {
				terminalUser = 'daxxyOS';
			} else {
				printTerminal('Command not found: ' + trimmed);
			}
		}
		renderTerminalPrompt();
	}

	// Inline terminal input logic - FIXED
	terminalModal.addEventListener('keydown', function (e) {
		if (terminalModal.getAttribute('aria-hidden') === 'true') return;

		// Prevent default for all keys except when typing in input fields
		if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
			e.preventDefault();
		}

		const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
		if (!inputSpan) return;

		if (e.key === 'Enter') {
			if (terminalInputValue.trim()) {
				terminalHistory.push(terminalInputValue);
			}
			terminalHistoryIndex = terminalHistory.length;
			handleTerminalCmd(terminalInputValue);
			terminalInputValue = '';
		} else if (e.key === 'Backspace') {
			terminalInputValue = terminalInputValue.slice(0, -1);
		} else if (e.key === 'ArrowUp') {
			if (terminalHistory.length && terminalHistoryIndex > 0) {
				terminalHistoryIndex--;
				terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
			}
		} else if (e.key === 'ArrowDown') {
			if (terminalHistory.length && terminalHistoryIndex < terminalHistory.length - 1) {
				terminalHistoryIndex++;
				terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
			} else if (terminalHistoryIndex === terminalHistory.length - 1) {
				terminalHistoryIndex++;
				terminalInputValue = '';
			}
		} else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			terminalInputValue += e.key;
		}
		inputSpan.textContent = terminalInputValue;
	});

	terminalIcon?.addEventListener('dblclick', (e) => {
		e.preventDefault();
		terminalModal.setAttribute('aria-hidden', 'false');
		terminalModal.style.display = 'block';
		terminalOutput.innerHTML = '';
		terminalUser = 'daxxyOS';
		terminalInputValue = '';
		printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
		printTerminal('Try to switch to root user and explore further.');
		renderTerminalPrompt();
	});
	terminalIcon?.addEventListener('click', (e) => {
		if (e.detail === 2) return;
		terminalModal.setAttribute('aria-hidden', 'false');
		terminalModal.style.display = 'block';
		terminalOutput.innerHTML = '';
		terminalUser = 'daxxyOS';
		terminalInputValue = '';
		printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
		printTerminal('Tryto switch to root user and explore further.');
		renderTerminalPrompt();
	});
	closeTerminal?.addEventListener('click', () => {
		terminalModal.setAttribute('aria-hidden', 'true');
		terminalModal.style.display = 'none';
	});

	// Center and show modals for Recycle Bin and Terminal
	function showModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'false');
		modal.style.display = 'block';
		// Center modal
		modal.style.position = 'fixed';
		modal.style.left = '50%';
		modal.style.top = '50%';
		modal.style.transform = 'translate(-50%, -50%)';
		modal.style.zIndex = '1000';
	}
	function hideModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'true');
		modal.style.display = 'none';
	}

	// Double-click handlers for icons
	function setupIconModals() {
		document.querySelectorAll('.icon').forEach(icon => {
			icon.addEventListener('dblclick', function (e) {
				e.preventDefault();
				const id = icon.getAttribute('data-id');
				if (id === 'recyclebin') {
					recycleBinModal.setAttribute('aria-hidden', 'false');
					recycleBinModal.style.display = 'block';
					recycleBinUnlocked = false;
					updateRecycleBinList();
				} else if (id === 'terminal') {
					terminalModal.setAttribute('aria-hidden', 'false');
					terminalModal.style.display = 'block';
					terminalOutput.innerHTML = '';
					printTerminal('Welcome to DaxxyOS CTF Terminal! Type "help" for available commands.');
					printTerminal('Try "root" to switch to root user and explore further.');
					terminalInputValue = '';
				}
			});
		});
		document.getElementById('closeRecycleBin').onclick = () => {
			recycleBinModal.setAttribute('aria-hidden', 'true');
			recycleBinModal.style.display = 'none';
			recycleBinUnlocked = false;
			if (recycleBinPasswordInput) recycleBinPasswordInput.value = '';
		};
		document.getElementById('closeTerminal').onclick = () => {
			terminalModal.setAttribute('aria-hidden', 'true');
			terminalModal.style.display = 'none';
		};
	}
	window.addEventListener('DOMContentLoaded', setupIconModals);

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
			} catch (e) { }
		}
	}

	icons().forEach((icon) => {
		icon.addEventListener('click', () => {
			icons().forEach((i) => i.classList.remove('selected'));
			icon.classList.add('selected');
			const now = Date.now();
			if (now - lastClickTime < dblDelay) {
				const id = icon.getAttribute('data-id');
				if (id !== 'recyclebin' && id !== 'terminal') {
					openURL(icon.getAttribute('data-url'));
				}
			}
			lastClickTime = now;
		});
		icon.addEventListener('dblclick', (e) => {
			e.preventDefault();
			const id = icon.getAttribute('data-id');
			if (id === 'recyclebin') {
				recycleBinModal.setAttribute('aria-hidden', 'false');
				recycleBinModal.style.display = 'block';
				recycleBinUnlocked = false;
				updateRecycleBinList();
			} else if (id === 'terminal') {
				terminalModal.setAttribute('aria-hidden', 'false');
				terminalModal.style.display = 'block';
				terminalOutput.innerHTML = '';
				printTerminal('Welcome to DaxxyOS CTF Terminal! Type "help" for available commands.');
				printTerminal('Try "root" to switch to root user and explore further.');
				terminalInputValue = '';
			} else {
				openURL(icon.getAttribute('data-url'));
			}
		});
		icon.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				const id = icon.getAttribute('data-id');
				if (id !== 'recyclebin' && id !== 'terminal') {
					openURL(icon.getAttribute('data-url'));
				}
			}
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
		} catch { }
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
		} catch { }
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
		} catch { }
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
			} catch { }
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
	});
	window.addEventListener('DOMContentLoaded', () => {
		if (!getPowerState()) {
			powerOverlay.setAttribute('aria-hidden', 'false');
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
})();