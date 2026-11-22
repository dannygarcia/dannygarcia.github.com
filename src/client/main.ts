import type { SceneState } from './scene';

const container = document.querySelector('.canvas-container') as HTMLElement;
if (container) {
    let canvas = document.createElement('canvas');
    container.appendChild(canvas);
    let worker: Worker | undefined;
    let fallback: { setState(state: SceneState): void } | undefined;
    let startingFallback = false;
    let startupTimeout: ReturnType<typeof setTimeout>;
    const doc = document.documentElement;
    const state: SceneState = {
        width: 1,
        height: 1,
        narrow: /iPhone|iPod/.test(navigator.platform) || matchMedia('(max-width: 736px)').matches,
        color: getComputedStyle(doc).getPropertyValue('--c-primary').trim(),
        scroll: 0,
        pointerX: 0,
        pointerY: 0,
        overLink: false,
        visible: !document.hidden,
    };
    const sendState = () => {
        if (worker) worker.postMessage({ type: 'state', state });
        if (fallback) fallback.setState({ ...state });
    };
    const resize = () => {
        // CSS owns the full-viewport surface. The visual viewport excludes
        // browser controls and also shrinks during pinch zoom / keyboard use.
        // Match the drawing buffer and camera to the actual surface instead.
        const bounds = container.getBoundingClientRect();
        state.width = Math.max(1, Math.round(bounds.width));
        state.height = Math.max(1, Math.round(bounds.height));
        state.scroll = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
        sendState();
    };
    const startFallback = async () => {
        if (startingFallback) return;
        startingFallback = true;
        clearTimeout(startupTimeout);
        worker?.terminate();
        worker = undefined;
        // Transferring is irreversible, so a failed worker needs a fresh canvas.
        const replacement = document.createElement('canvas');
        canvas.replaceWith(replacement);
        canvas = replacement;
        resize();
        const { startScene } = await import('./scene');
        fallback = startScene(canvas, { ...state });
    };

    resize();
    if (typeof canvas.transferControlToOffscreen === 'function' && typeof Worker !== 'undefined') {
        try {
            worker = new Worker(new URL('./render-worker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = ({ data }) => {
                if (data.type === 'ready') clearTimeout(startupTimeout);
                if (data.type === 'error') void startFallback();
            };
            worker.onerror = () => { void startFallback(); };
            const offscreen = canvas.transferControlToOffscreen();
            worker.postMessage({ type: 'init', canvas: offscreen, state }, [offscreen]);
            startupTimeout = setTimeout(() => { void startFallback(); }, 5000);
        } catch {
            void startFallback();
        }
    } else {
        void startFallback();
    }

    window.addEventListener('resize', resize);
    // Also catches orientation, standalone mode, and CSS viewport changes that
    // do not produce a window resize. Toolbar animations leave 100lvh stable.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('load', resize, { once: true });
    window.addEventListener('pageshow', () => {
        state.visible = !document.hidden;
        resize();
    });
    window.addEventListener('pagehide', () => {
        state.visible = false;
        sendState();
    });
    document.addEventListener('visibilitychange', () => {
        state.visible = !document.hidden;
        sendState();
    });
    window.addEventListener('scroll', () => {
        state.scroll = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
        sendState();
    }, { passive: true });
    const onmove = (event: MouseEvent) => {
        state.pointerX = (event.clientX / state.width) * 2 - 1;
        state.pointerY = -(event.clientY / state.height) * 2 + 1;
        state.overLink = event.target instanceof Element && !!event.target.closest('a');
        sendState();
    };
    document.addEventListener(window.PointerEvent ? 'pointermove' : 'mousemove', onmove, { passive: true });
}
