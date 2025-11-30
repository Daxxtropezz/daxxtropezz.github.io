(function () {
    const clock = document.getElementById('clock');
    const clockCenter = document.getElementById('clockCenter');
    function fmt(n) { return n.toString().padStart(2, '0'); }
    function tick() {
        const d = new Date();
        const t = `${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(d.getSeconds())}`;
        if (clock) clock.textContent = t;
        if (clockCenter) clockCenter.textContent = t;
    }
    tick();
    setInterval(tick, 1000);
})();
