import '@testing-library/jest-dom/vitest';

// jsdom does not implement window.matchMedia, but the vendored React Bits
// ScrollExpand reads it directly (upstream source). This test-environment
// shim mirrors a "no preference" result and touches no component source.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom does not implement ResizeObserver (used by the vendored React Bits
// components); real browsers provide it. Minimal test-environment stub.
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    observe(): void {
      /* test stub */
    }
    unobserve(): void {
      /* test stub */
    }
    disconnect(): void {
      /* test stub */
    }
  } as unknown as typeof window.ResizeObserver;
}
