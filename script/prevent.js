document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'Shift' && e.key === 'C')) {
        e.preventDefault();
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
