// Terminal logic (moved from script.js)
(function () {
    const terminalIcon = document.querySelector('[data-id="terminal"]');
    const terminalModal = document.getElementById('terminalModal');
    const terminalOutput = document.getElementById('terminalOutput');
    const closeTerminal = document.getElementById('closeTerminal');
    const secretMessage = "Bin's secret VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==";
    let terminalUser = 'daxxyOS';
    let terminalPrompt = () => `${terminalUser}@daxxyOS:~$ `;
    let terminalInputValue = '';
    let terminalCursorPos = 0;
    let waitingForRootPassword = false;
    let passwordInputValue = '';
    let passwordInputActive = false;
    let terminalHistory = [];
    let terminalHistoryIndex = -1;

    function addToHistory(cmd) {
        if (!cmd) return;
        terminalHistory.push(cmd);
        if (terminalHistory.length > 200) terminalHistory.shift();
        terminalHistoryIndex = terminalHistory.length;
        updateHistoryUI();
    }
    function updateHistoryUI() {
        if (!terminalModal) return;
        const existing = terminalModal.querySelector('.terminal-history');
        if (existing) existing.remove();
    }
    setTimeout(updateHistoryUI, 0);
    if (terminalModal) terminalModal.tabIndex = 0;

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&#039;');
    }

    function updateInputDisplay() {
        if (!terminalOutput) return;
        const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
        if (!inputSpan) return;
        const val = terminalInputValue || '';
        const pos = Math.max(0, Math.min(terminalCursorPos, val.length));
        const before = escapeHtml(val.slice(0, pos));
        const after = escapeHtml(val.slice(pos));
        inputSpan.innerHTML = before + '<span class="inline-caret" aria-hidden="true"></span>' + after;
    }

    function printTerminal(text, isCmd = false) {
        if (!terminalOutput) return null;
        const div = document.createElement('div');
        div.textContent = text;
        if (isCmd) div.style.color = '#00ea65';
        if (!isCmd) {
            div.style.cursor = 'pointer';
            div.title = 'Click to copy';
            div.addEventListener('click', function () {
                navigator.clipboard.writeText(text).then(() => {
                    const prev = div.textContent;
                    div.textContent = 'Copied to clipboard!';
                    setTimeout(() => { div.textContent = prev; }, 1200);
                }).catch(() => { });
            });
        }
        if (text === secretMessage) {
            div.title = 'Click to copy password';
            div.addEventListener('click', function () {
                navigator.clipboard.writeText('VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==').then(() => {
                    const prev = div.textContent;
                    div.textContent = 'Copied to clipboard!';
                    setTimeout(() => { div.textContent = prev; }, 1200);
                });
            });
        }
        terminalOutput.appendChild(div);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        return div;
    }

    function handleTerminalCmd(cmd) {
        const trimmed = cmd.trim();
        const lastPromptLine = terminalOutput.querySelector('.terminal-prompt-line:last-child');
        if (lastPromptLine) lastPromptLine.innerHTML = `<span style='font-weight:bold;'>${terminalPrompt()}</span>${trimmed}`;
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
        if (!trimmed) { renderTerminalPrompt(); return; }

        if (trimmed === 'history') {
            if (!terminalHistory.length) printTerminal('No history.');
            else terminalHistory.forEach((h, idx) => printTerminal(`${idx + 1}  ${h}`));
            renderTerminalPrompt();
            return;
        }
        if (trimmed === 'history -c') {
            terminalHistory = [];
            terminalHistoryIndex = -1;
            updateHistoryUI();
            printTerminal('History cleared.');
            renderTerminalPrompt();
            return;
        }

        printTerminal(terminalPrompt() + trimmed, true);
        const echoDecodeMatch = trimmed.match(/^echo\s+"([^"]+)"\s*\|\s*base64\s*-d$/);
        if (echoDecodeMatch) {
            try {
                const decoded = atob(echoDecodeMatch[1]);
                const outDiv = printTerminal(decoded);
                navigator.clipboard.writeText(decoded).then(() => {
                    outDiv.textContent = decoded + ' (Copied to clipboard!)';
                    setTimeout(() => { outDiv.textContent = decoded; }, 1200);
                }).catch(() => { });
            } catch { printTerminal('Invalid base64 string.'); }
            renderTerminalPrompt();
            return;
        }
        const echoEncodeMatch = trimmed.match(/^echo\s+"([^"]+)"\s*\|\s*base64\s*-e$/);
        if (echoEncodeMatch) {
            try {
                const encoded = btoa(echoEncodeMatch[1]);
                const outDiv = printTerminal(encoded);
                navigator.clipboard.writeText(encoded).then(() => {
                    outDiv.textContent = encoded + ' (Copied to clipboard!)';
                    setTimeout(() => { outDiv.textContent = encoded; }, 1200);
                }).catch(() => { });
            } catch { printTerminal('Unable to encode string.'); }
            renderTerminalPrompt();
            return;
        }
        if (trimmed === 'man' || trimmed === 'help') {
            printTerminal('Available commands:');
            printTerminal('ls                - List files');
            printTerminal('whoami            - Show current user');
            printTerminal('root              - Switch to root user (requires password)');
            printTerminal('sudo su           - Switch to root user (requires password)');
            printTerminal('sudo -l           - Switch to root user (requires password)');
            printTerminal('echo "..." | base64 -d   - Decode base64 string');
            printTerminal('echo "..." | base64 -e   - Encode string to base64');
            printTerminal('clear             - Clear terminal');
            printTerminal('exit/logout       - Close or logout terminal');
            renderTerminalPrompt();
            return;
        }

        if (terminalUser === 'daxxyOS') {
            if (trimmed === 'ls') { }
            else if (trimmed === 'sudo -l' || trimmed === 'sudo su' || trimmed === 'sudo su -' || trimmed === 'root') {
                printTerminal('Password for root:');
                waitingForRootPassword = true;
                return renderTerminalPrompt();
            } else if (trimmed === 'whoami') printTerminal('daxxyOS');
            else if (trimmed === 'exit' || trimmed === 'logout') {
                if (terminalModal) terminalModal.setAttribute('aria-hidden', 'true');
                if (terminalModal) terminalModal.style.display = 'none';
            } else if (trimmed === 'clear') terminalOutput.innerHTML = '';
            else printTerminal('Command not found: ' + trimmed);
        } else if (terminalUser === 'root') {
            if (trimmed === 'ls') { }
            else if (trimmed === 'ls -la') printTerminal('secret.txt');
            else if (trimmed === 'cat secret.txt') printTerminal(secretMessage);
            else if (trimmed === 'clear') terminalOutput.innerHTML = '';
            else if (trimmed === 'whoami') printTerminal('root');
            else if (trimmed === 'exit' || trimmed === 'logout') terminalUser = 'daxxyOS';
            else printTerminal('Command not found: ' + trimmed);
        }
        renderTerminalPrompt();
    }

    function renderTerminalPrompt() {
        if (!terminalOutput) return;
        const promptDiv = document.createElement('div');
        promptDiv.className = 'terminal-prompt-line';
        if (waitingForRootPassword) {
            promptDiv.innerHTML = `<span style="font-weight:bold;">Password for root:</span><span id="terminalInputSpan"></span>`;
            passwordInputActive = true;
        } else {
            promptDiv.innerHTML = `<span style="font-weight:bold;">${terminalPrompt()}</span><span id="terminalInputSpan"></span>`;
            passwordInputActive = false;
        }
        terminalOutput.appendChild(promptDiv);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalCursorPos = terminalInputValue.length;
        updateInputDisplay();

        if (window.innerWidth <= 640) {
            let input = document.getElementById('terminalRealInput');
            if (!input) {
                input = document.createElement('input');
                input.id = 'terminalRealInput';
                input.className = 'terminal-input';
                input.autocomplete = 'off';
                input.style.marginTop = '8px';
                input.style.width = '100%';
                input.style.fontFamily = 'Share Tech Mono, monospace';
                input.style.fontSize = '15px';
                input.style.background = '#222';
                input.style.color = '#00ea65';
                input.style.borderRadius = '6px';
                input.style.border = '1px solid #333';
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        if (input.value.trim()) addToHistory(input.value);
                        handleTerminalCmd(input.value);
                        input.value = '';
                    }
                });
                terminalModal && terminalModal.appendChild(input);
            }
            input.type = passwordInputActive ? 'password' : 'text';
            input.focus();
        } else {
            terminalModal && terminalModal.focus();
        }
    }

    terminalModal && terminalModal.addEventListener('keydown', async function (e) {
        if (terminalModal.getAttribute('aria-hidden') === 'true') return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
        if (!inputSpan) return;
        if (waitingForRootPassword) {
            if (e.key === 'Enter') {
                if (terminalInputValue.trim()) addToHistory(terminalInputValue);
                handleTerminalCmd(terminalInputValue);
                terminalInputValue = '';
                passwordInputValue = '';
                terminalCursorPos = 0;
            } else if (e.key === 'Backspace') {
                if (terminalCursorPos > 0) {
                    passwordInputValue = passwordInputValue.slice(0, terminalCursorPos - 1) + passwordInputValue.slice(terminalCursorPos);
                    terminalCursorPos--;
                    terminalInputValue = passwordInputValue;
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                let pasteText = '';
                try { pasteText = await navigator.clipboard.readText(); } catch { }
                if (pasteText) {
                    passwordInputValue = passwordInputValue.slice(0, terminalCursorPos) + pasteText + passwordInputValue.slice(terminalCursorPos);
                    terminalCursorPos += pasteText.length;
                    terminalInputValue = passwordInputValue;
                }
                updateInputDisplay();
                return;
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                terminalInputValue = '';
                passwordInputValue = '';
                handleTerminalCmd('clear');
                return;
            } else if (e.key === 'ArrowLeft') {
                if (terminalCursorPos > 0) terminalCursorPos--;
            } else if (e.key === 'ArrowRight') {
                if (terminalCursorPos < passwordInputValue.length) terminalCursorPos++;
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                passwordInputValue = passwordInputValue.slice(0, terminalCursorPos) + e.key + passwordInputValue.slice(terminalCursorPos);
                terminalCursorPos++;
                terminalInputValue = passwordInputValue;
            }
            inputSpan.textContent = '•'.repeat(passwordInputValue.length);
            return;
        }

        if (e.key === 'Enter') {
            if (terminalInputValue.trim()) addToHistory(terminalInputValue);
            handleTerminalCmd(terminalInputValue);
            terminalInputValue = '';
            terminalCursorPos = 0;
            updateInputDisplay();
            return;
        }
        if (e.key === 'Backspace') {
            if (terminalCursorPos > 0) {
                terminalInputValue = terminalInputValue.slice(0, terminalCursorPos - 1) + terminalInputValue.slice(terminalCursorPos);
                terminalCursorPos--;
            }
            updateInputDisplay();
            return;
        }
        if (e.key === 'ArrowUp') {
            if (terminalHistory.length && terminalHistoryIndex > 0) {
                terminalHistoryIndex--;
                terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
                terminalCursorPos = terminalInputValue.length;
                updateInputDisplay();
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            if (terminalHistory.length && terminalHistoryIndex < terminalHistory.length - 1) {
                terminalHistoryIndex++;
                terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
                terminalCursorPos = terminalInputValue.length;
                updateInputDisplay();
            } else if (terminalHistoryIndex === terminalHistory.length - 1) {
                terminalHistoryIndex++;
                terminalInputValue = '';
                terminalCursorPos = 0;
                updateInputDisplay();
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
            let pasteText = '';
            try { pasteText = await navigator.clipboard.readText(); } catch { }
            if (pasteText) {
                terminalInputValue = terminalInputValue.slice(0, terminalCursorPos) + pasteText + terminalInputValue.slice(terminalCursorPos);
                terminalCursorPos += pasteText.length;
                updateInputDisplay();
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            terminalInputValue = '';
            handleTerminalCmd('clear');
            return;
        }
        if (e.key === 'ArrowLeft') {
            if (terminalCursorPos > 0) terminalCursorPos--;
            updateInputDisplay();
            return;
        }
        if (e.key === 'ArrowRight') {
            if (terminalCursorPos < terminalInputValue.length) terminalCursorPos++;
            updateInputDisplay();
            return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            terminalInputValue = terminalInputValue.slice(0, terminalCursorPos) + e.key + terminalInputValue.slice(terminalCursorPos);
            terminalCursorPos++;
            updateInputDisplay();
        }
    });

    terminalModal && terminalModal.addEventListener('contextmenu', async function (e) {
        e.preventDefault();
        let pasteText = '';
        try { pasteText = await navigator.clipboard.readText(); } catch { }
        if (!pasteText) return;
        const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
        if (!inputSpan) return;
        if (waitingForRootPassword) {
            passwordInputValue += pasteText;
            terminalInputValue = passwordInputValue;
            inputSpan.textContent = ''.repeat(passwordInputValue.length);
        } else {
            terminalInputValue += pasteText;
            inputSpan.textContent = terminalInputValue;
        }
    });

    terminalIcon?.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (terminalModal) terminalModal.setAttribute('aria-hidden', 'false');
        if (terminalModal) terminalModal.style.display = 'block';
        if (terminalOutput) terminalOutput.innerHTML = '';
        terminalUser = 'daxxyOS';
        terminalInputValue = '';
        printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
        printTerminal('Try to switch to root user and explore further.');
        renderTerminalPrompt();
        setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
    });
    terminalIcon?.addEventListener('click', (e) => {
        if (e.detail === 2) return;
        if (terminalModal) terminalModal.setAttribute('aria-hidden', 'false');
        if (terminalModal) terminalModal.style.display = 'block';
        if (terminalOutput) terminalOutput.innerHTML = '';
        terminalUser = 'daxxyOS';
        terminalInputValue = '';
        printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
        printTerminal('Tryto switch to root user and explore further.');
        renderTerminalPrompt();
        setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
    });

    function adjustTerminalContentSize() {
        if (!terminalModal || !terminalOutput) return;
        const bar = document.getElementById('terminalBar') || terminalModal.querySelector('.window-bar') || null;
        const footer = terminalModal.querySelector('.window-footer') || null;
        const modalStyles = getComputedStyle(terminalModal);
        const padTop = parseInt(modalStyles.paddingTop || 0, 10) || 0;
        const padBottom = parseInt(modalStyles.paddingBottom || 0, 10) || 0;
        const headerH = bar ? (bar.offsetHeight || 0) : 40;
        const footerH = footer ? (footer.offsetHeight || 0) : 8;
        const innerH = terminalModal.clientHeight - headerH - footerH - padTop - padBottom - 16;
        terminalOutput.style.maxHeight = Math.max(80, innerH) + 'px';
        terminalOutput.style.overflow = 'auto';
        terminalOutput.style.width = '100%';
    }
    window.adjustTerminalContentSize = adjustTerminalContentSize;

    // close button handler (fix for cannot close terminal)
    closeTerminal?.addEventListener('click', () => {
        if (terminalModal) terminalModal.setAttribute('aria-hidden', 'true');
        if (terminalModal) terminalModal.style.display = 'none';
    });
})();