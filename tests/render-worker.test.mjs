import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';

const source = transformSync(
    readFileSync(new URL('../src/client/render-worker.ts', import.meta.url), 'utf8'),
    { loader: 'ts', format: 'cjs' },
).code;

function worker(userAgent, hasAnimationFrame = true, fail = false) {
    const starts = [];
    const states = [];
    const messages = [];
    const self = {
        postMessage: message => messages.push(message),
        ...(hasAnimationFrame ? { requestAnimationFrame() {} } : {}),
    };
    runInNewContext(source, {
        self,
        navigator: { userAgent },
        require: () => ({
            startScene(...args) {
                if (fail) throw new Error('WebGL unavailable');
                starts.push(args);
                return { setState: state => states.push(state) };
            },
        }),
    });
    const canvas = {};
    const state = { visible: true };
    self.onmessage({ data: { type: 'init', canvas, state } });
    return { self, starts, states, messages, canvas, state };
}

for (const browser of ['Chrome/142.0.0.0 Safari/537.36', 'Chromium/142.0.0.0', 'Chrome/142.0.0.0 Edg/142.0.0.0']) {
    test(`${browser} uses display-synchronized rendering`, () => {
        const result = worker(browser);
        assert.deepEqual(result.starts[0], [result.canvas, result.state, false]);
        assert.equal(result.messages[0].type, 'ready');
    });
}

for (const browser of [
    'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/26.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/26.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/142.0.0.0 Mobile/15E148 Safari/604.1',
]) {
    test(`${browser} retains the high-refresh timer`, () => {
        assert.equal(worker(browser).starts[0][2], true);
    });
}

test('Chromium without worker animation frames falls back to the timer', () => {
    assert.equal(worker('Chrome/142.0.0.0', false).starts[0][2], true);
});

test('state changes still reach the scene', () => {
    const result = worker('Chrome/142.0.0.0');
    const state = { visible: false, width: 800, height: 600 };
    result.self.onmessage({ data: { type: 'state', state } });
    assert.deepEqual(result.states, [state]);
});

test('initialization failures still request the main-thread fallback', () => {
    const result = worker('Chrome/142.0.0.0', true, true);
    assert.equal(result.messages[0].type, 'error');
    assert.match(result.messages[0].message, /WebGL unavailable/);
});
