(function () {
    function syncCollapseHints() {
        document.querySelectorAll('[data-bs-toggle="collapse"][data-bs-target]').forEach(function (header) {
            var targetId = header.getAttribute('data-bs-target');
            var panel = targetId ? document.querySelector(targetId) : null;
            var hint = header.querySelector('.collapse-hint');
            if (!panel || !hint) {
                return;
            }
            var open = panel.classList.contains('show') || panel.classList.contains('open');
            hint.textContent = open ? '收起' : '展开';
            header.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function applyMobileCompactLayout() {
        var narrow = window.matchMedia('(max-width: 576px)').matches;
        document.querySelectorAll('[data-sim-collapse]').forEach(function (panel) {
            if (narrow) {
                panel.classList.remove('show');
                panel.classList.remove('open');
            } else {
                if (panel.classList.contains('collapsible-content')) {
                    panel.classList.add('open');
                } else {
                    panel.classList.add('show');
                }
            }
        });
        syncCollapseHints();
    }

    function bindCollapsePanels() {
        document.querySelectorAll('[data-sim-collapse]').forEach(function (panel) {
            panel.addEventListener('shown.bs.collapse', syncCollapseHints);
            panel.addEventListener('hidden.bs.collapse', syncCollapseHints);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindCollapsePanels();
        applyMobileCompactLayout();
    });
    window.addEventListener('resize', applyMobileCompactLayout);
    window.simulatorLayout = {
        syncCollapseHints: syncCollapseHints,
        applyMobileCompactLayout: applyMobileCompactLayout
    };
})();
