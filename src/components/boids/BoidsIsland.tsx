import { useEffect, useRef } from "react";
import type { Universe } from "../../lib/boids/pkg/boids.js";

export default function BoidsIsland() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const pauseRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const boidCountInputRef = useRef<HTMLInputElement | null>(null);
  const boidCountOutputRef = useRef<HTMLOutputElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const status = statusRef.current;
    const pauseButton = pauseRef.current;
    const resetButton = resetRef.current;
    const boidCountInput = boidCountInputRef.current;
    const boidCountOutput = boidCountOutputRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !status || !pauseButton || !resetButton || !boidCountInput || !boidCountOutput) return;

    let disposed = false;
    let paused = false;
    let frame = 0;
    let universe: Universe | undefined;
    let memory: WebAssembly.Memory | undefined;
    let mousePosition: { x: number; y: number } | undefined;
    let cleanup = () => {};

    const setStatus = (message: string) => {
      status.textContent = message;
    };

    const setBoidCount = () => {
      const count = Number(boidCountInput.value);
      boidCountOutput.textContent = String(count);
      if (!universe) return;

      universe.set_boid_count(count);
      setStatus(`${paused ? "paused" : "running"} · ${universe.boids_count()} boids`);
    };

    const trackPointer = (event: PointerEvent) => {
      if (!universe) return;

      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      mousePosition = {
        x: Math.max(0, Math.min(canvas.width - 1, ((event.clientX - bounds.left) / bounds.width) * canvas.width)),
        y: Math.max(0, Math.min(canvas.height - 1, ((event.clientY - bounds.top) / bounds.height) * canvas.height)),
      };
      universe.set_mouse_position(mousePosition.x, mousePosition.y);
    };

    const clearPointer = () => {
      mousePosition = undefined;
      universe?.clear_mouse_position();
    };

    const initialize = async () => {
      try {
        const [module, wasmAsset] = await Promise.all([
          import("../../lib/boids/pkg/boids.js"),
          import("../../lib/boids/pkg/boids_bg.wasm?url"),
        ]);
        const wasm = await module.default({ module_or_path: wasmAsset.default });
        if (disposed) return;

        memory = wasm.memory;
        universe = module.Universe.new();
        boidCountInput.max = String(universe.max_boids());
        boidCountInput.disabled = false;
        universe.set_boid_count(Number(boidCountInput.value));
        const width = universe.width();
        const height = universe.height();
        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = false;

        const draw = () => {
          if (!universe || !memory || disposed) return;
          if (!paused) universe.tick();
          const pixels = new Uint8ClampedArray(
            memory.buffer,
            universe.pixels(),
            width * height * 4
          );
          context.putImageData(new ImageData(pixels, width, height), 0, 0);
          frame = requestAnimationFrame(draw);
        };

        const reset = () => {
          universe?.free();
          universe = module.Universe.new();
          universe.set_boid_count(Number(boidCountInput.value));
          if (mousePosition) {
            universe.set_mouse_position(mousePosition.x, mousePosition.y);
          }
          setStatus(`${paused ? "paused" : "running"} · ${universe.boids_count()} boids`);
        };
        const togglePause = () => {
          paused = !paused;
          pauseButton.textContent = paused ? "Resume" : "Pause";
          setStatus(`${paused ? "paused" : "running"} · ${universe?.boids_count() ?? 0} boids`);
        };

        resetButton.addEventListener("click", reset);
        pauseButton.addEventListener("click", togglePause);
        boidCountInput.addEventListener("input", setBoidCount);
        canvas.addEventListener("pointermove", trackPointer);
        canvas.addEventListener("pointerleave", clearPointer);
        canvas.addEventListener("pointercancel", clearPointer);
        resetButton.disabled = false;
        pauseButton.disabled = false;
        setBoidCount();
        setStatus(`running · ${universe.boids_count()} boids`);
        draw();

        cleanup = () => {
          resetButton.removeEventListener("click", reset);
          pauseButton.removeEventListener("click", togglePause);
          boidCountInput.removeEventListener("input", setBoidCount);
          canvas.removeEventListener("pointermove", trackPointer);
          canvas.removeEventListener("pointerleave", clearPointer);
          canvas.removeEventListener("pointercancel", clearPointer);
        };
      } catch (error) {
        console.error("Could not initialize the Boids WebAssembly demo.", error);
        setStatus("Boids demo could not be loaded. Open the source repository for details.");
      }
    };

    void initialize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
      universe?.free();
    };
  }, []);

  return (
    <div className="boids-demo">
      <div className="boids-toolbar">
        <span ref={statusRef} role="status" aria-live="polite">Loading simulation…</span>
        <div className="boids-controls" aria-label="Boids simulation controls">
          <button ref={pauseRef} type="button" disabled>Pause</button>
          <button ref={resetRef} type="button" disabled>Reset</button>
        </div>
      </div>
      <div className="boids-population-control">
        <label htmlFor="boids-population-slider">Boid count</label>
        <input
          ref={boidCountInputRef}
          id="boids-population-slider"
          type="range"
          min="1"
          max="500"
          step="1"
          defaultValue="300"
          aria-describedby="boids-population-hint"
          disabled
        />
        <output ref={boidCountOutputRef} htmlFor="boids-population-slider">300</output>
      </div>
      <canvas
        ref={canvasRef}
        className="boids-canvas"
        aria-label="Animated flocking simulation that follows the pointer"
      />
      <p className="boids-hint" id="boids-population-hint">Adjust the flock size with the slider, then move your pointer over it to guide the boids.</p>
    </div>
  );
}
