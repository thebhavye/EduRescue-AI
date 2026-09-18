/*
 * WebGL-aware wrapper around the REAL React Bits SpecularButton.
 *
 * The upstream SpecularButton assumes WebGL is available; in environments
 * without it (e.g. jsdom test runs, disabled-GPU browsers) it would throw
 * during mount. This wrapper probes for a WebGL context first:
 *  - WebGL present  → renders the real SpecularButton unchanged.
 *  - WebGL missing  → renders a plain accessible <button> with the IDENTICAL
 *                     handlers, disabled state, type and children, styled to
 *                     match the primary purple action.
 * No business logic lives here — purely a graceful-degradation boundary.
 */
import { useMemo } from 'react';
import { SpecularButton, type SpecularButtonProps } from './SpecularButton';

function webglAvailable(): boolean {
  try {
    if (typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ?? (canvas.getContext('webgl') as unknown);
    if (!gl) return false;
    // jsdom logs "not implemented" but returns a falsy value; a real context
    // exposes getParameter. Treat anything else as unavailable.
    return (
      typeof gl === 'object' &&
      gl !== null &&
      typeof (gl as WebGLRenderingContext).getParameter === 'function'
    );
  } catch {
    return false;
  }
}

export function SafeSpecularButton(props: SpecularButtonProps) {
  const ok = useMemo(() => webglAvailable(), []);
  const { className = '', ...rest } = props;
  if (ok) return <SpecularButton {...props} />;
  const { children, disabled, onClick, type = 'button' } = rest;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      className={`btn btn-primary btn-block specular-fallback ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default SafeSpecularButton;
