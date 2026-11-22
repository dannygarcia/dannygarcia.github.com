import { startScene } from './scene';

let scene: ReturnType<typeof startScene> | undefined;
self.onmessage = ({ data }) => {
    try {
        if (data.type === 'init') {
            // Chromium can synchronize worker rendering with the display. Forcing
            // 120 Hz timers there submits unnecessary frames and can build a GPU
            // backlog. Keep the existing timer workaround on Safari, where it
            // allows presentation above the page's requestAnimationFrame cap.
            const isChromium = /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent);
            const useTimer = !isChromium || typeof self.requestAnimationFrame !== 'function';
            scene = startScene(data.canvas, data.state, useTimer);
            self.postMessage({ type: 'ready' });
        } else if (data.type === 'state') {
            scene?.setState(data.state);
        }
    } catch (error) {
        self.postMessage({ type: 'error', message: String(error) });
    }
};
