import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';

const source = transformSync(
    readFileSync(new URL('../src/client/main.ts', import.meta.url), 'utf8'),
    { loader: 'ts', format: 'cjs', define: { 'import.meta.url': '"file:///main.ts"' } },
).code;

function mount() {
    let bounds = { width: 390, height: 844 };
    let onResize;
    const messages = [];
    const listeners = {};
    const canvas = { style: {}, transferControlToOffscreen: () => ({}) };
    const container = {
        style: {},
        appendChild() {},
        getBoundingClientRect: () => bounds,
    };
    const window = {
        innerWidth: 390,
        innerHeight: 664,
        visualViewport: { width: 390, height: 664 },
        addEventListener: (name, callback) => { listeners[name] = callback; },
    };
    runInNewContext(source, {
        window,
        document: {
            hidden: false,
            documentElement: { scrollTop: 0, scrollHeight: 2000, clientHeight: 664 },
            querySelector: () => container,
            createElement: () => canvas,
            addEventListener() {},
        },
        navigator: { platform: 'iPhone' },
        matchMedia: () => ({ matches: true }),
        getComputedStyle: () => ({ getPropertyValue: () => '#ffffff' }),
        Worker: class {
            postMessage(message) { messages.push(structuredClone(message)); }
        },
        ResizeObserver: class {
            constructor(callback) { onResize = callback; }
            observe(target) { assert.equal(target, container); }
        },
        URL,
        setTimeout() {},
        clearTimeout() {},
    });
    return { window, canvas, container, messages, listeners,
        resize(width, height) { bounds = { width, height }; onResize(); } };
}

test('drawing surface covers the full viewport above and behind Safari controls', () => {
    const result = mount();
    const state = result.messages[0].state;
    assert.equal(state.width, 390);
    assert.equal(state.height, 844);
    assert.deepEqual(result.container.style, {});
    assert.deepEqual(result.canvas.style, {});
});

test('toolbar, keyboard, and pinch zoom do not shrink the drawing surface', () => {
    const result = mount();
    result.window.visualViewport = { width: 195, height: 300 };
    result.listeners.resize();
    assert.equal(result.messages.at(-1).state.width, 390);
    assert.equal(result.messages.at(-1).state.height, 844);
});

test('orientation and container resizing update the render worker dimensions', () => {
    const result = mount();
    result.resize(844, 390);
    assert.equal(result.messages.at(-1).state.width, 844);
    assert.equal(result.messages.at(-1).state.height, 390);
});

test('restoring a page remeasures the surface and resumes rendering', () => {
    const result = mount();
    result.listeners.pagehide();
    assert.equal(result.messages.at(-1).state.visible, false);
    result.listeners.pageshow();
    assert.equal(result.messages.at(-1).state.visible, true);
    assert.equal(result.messages.at(-1).state.height, 844);
});
