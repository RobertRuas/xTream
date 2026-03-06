/**
 * Initializes spatial navigation for Smart TVs and TV Box remote controls.
 * Arrow keys navigate between focusable elements. Enter clicks. Escape goes back.
 */
export const initSpatialNavigation = () => {
    if (typeof window === 'undefined') return;

    document.addEventListener('keydown', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace'].includes(e.key)) return;
        const active = document.activeElement;
        const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');

        if (e.key === 'Enter') {
            if (active && typeof active.click === 'function' && !isInput) {
                e.preventDefault();
                active.click();
            }
            return;
        }

        if ((e.key === 'Escape' || e.key === 'Backspace') && !isInput) {
            const closeBtn = document.querySelector('.close-button, .back-button, [aria-label="Close"], [aria-label="Back"]');
            if (closeBtn) { e.preventDefault(); closeBtn.click(); }
            return;
        }

        if (isInput) return;
        e.preventDefault();

        const focusables = Array.from(
            document.querySelectorAll('a, button, input, select, [tabindex="0"], .nav-link, .card, .category-pill')
        ).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
        });

        if (!focusables.length) return;

        if (!active || active === document.body || !focusables.includes(active)) {
            focusables[0].focus();
            return;
        }

        const currentRect = active.getBoundingClientRect();
        let bestMatch = null;
        let minDistance = Infinity;

        focusables.forEach(candidate => {
            if (candidate === active) return;
            const cRect = candidate.getBoundingClientRect();
            const dx = (cRect.left + cRect.width / 2) - (currentRect.left + currentRect.width / 2);
            const dy = (cRect.top + cRect.height / 2) - (currentRect.top + currentRect.height / 2);
            const wx = Math.abs(dx), wy = Math.abs(dy);
            let isValid = false, distance = Infinity;

            if (e.key === 'ArrowRight' && dx > 0 && wx > wy) { isValid = true; distance = dx * dx + dy * dy * 4; }
            else if (e.key === 'ArrowLeft' && dx < 0 && wx > wy) { isValid = true; distance = dx * dx + dy * dy * 4; }
            else if (e.key === 'ArrowDown' && dy > 0 && wy > wx) { isValid = true; distance = dy * dy + dx * dx * 4; }
            else if (e.key === 'ArrowUp' && dy < 0 && wy > wx) { isValid = true; distance = dy * dy + dx * dx * 4; }

            if (isValid && distance < minDistance) { minDistance = distance; bestMatch = candidate; }
        });

        if (bestMatch) bestMatch.focus();
    });
};
