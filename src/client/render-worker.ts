import { startScene } from './scene';

let scene: ReturnType<typeof startScene> | undefined;
self.onmessage = ({ data }) => {
    try {
        if (data.type === 'init') {
            scene = startScene(data.canvas, data.state, true);
            self.postMessage({ type: 'ready' });
        } else if (data.type === 'state') {
            scene?.setState(data.state);
        }
    } catch (error) {
        self.postMessage({ type: 'error', message: String(error) });
    }
};
