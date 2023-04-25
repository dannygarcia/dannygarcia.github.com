import { isOnTouchScreen, container, camera, renderer, mouseTarget } from './main';

const SetListeners = () => {
    window.onresize = function() {
        var windowAspect = window.innerWidth / container.offsetHeight;
        camera.aspect = windowAspect;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, container.offsetHeight);
    };

    if (window.PointerEvent) {
        document.addEventListener('pointermove', onmove, false);
    } else {
        document.addEventListener('mousemove', onmove, false);
    }

    function onmove(e: MouseEvent | PointerEvent) {
        if (isOnTouchScreen) {
            mouseTarget.set(0, 0);
            return e;
        } else {

            // Handles mouseball getting larger when hovering over name header at top of page
            const mouseOverLink = !!(e.target && (e.target as HTMLElement).nodeName.toLowerCase() === 'a');
            
            mouseTarget.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                (-(e.clientY / container.offsetHeight) * 2 + 1)
            );
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.classList.add('loaded');
    }, false);
}

export default SetListeners;