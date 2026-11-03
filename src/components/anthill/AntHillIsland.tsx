// src/components/AnthillIsland.tsx
import { useEffect, useRef } from "react";
import type { Universe } from "../../lib/anthill/pkg/anthill.js";

const CELL_SIZE = 5;
const CELL_COLORS = ["#0b1512", "#2f9f75", "#52655e", "#f0c35e", "#d47d52"];

export default function AnthillIsland() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const pauseRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const addAntRef = useRef<HTMLButtonElement | null>(null);
  const antCountInputRef = useRef<HTMLInputElement | null>(null);
  const antCountOutputRef = useRef<HTMLOutputElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const status = statusRef.current;
    const pauseButton = pauseRef.current;
    const resetButton = resetRef.current;
    const addAntButton = addAntRef.current;
    const antCountInput = antCountInputRef.current;
    const antCountOutput = antCountOutputRef.current;
    const context = canvas?.getContext("2d");
    if (
      !canvas ||
      !context ||
      !status ||
      !pauseButton ||
      !resetButton ||
      !addAntButton ||
      !antCountInput ||
      !antCountOutput
    ) return;

    let disposed = false;
    let paused = false;
    let frame = 0;
    let frameCount = 0;
    let universe: Universe | undefined;
    let memory: WebAssembly.Memory | undefined;

    const setStatus = (message: string) => {
      status.textContent = message;
    };

    const setAntCount = () => {
      const count = Number(antCountInput.value);
      antCountOutput.textContent = String(count);
      if (!universe) return;

      universe.set_ant_count(count);
      setStatus(`${paused ? "paused" : "running"} · ${universe.ants_count()} ants`);
    };

    const initialize = async () => {
      try {
        const [module, wasmAsset] = await Promise.all([
          import("../../lib/anthill/pkg/anthill.js"),
          import("../../lib/anthill/pkg/anthill_bg.wasm?url"),
        ]);
        const wasm = await module.default({ module_or_path: wasmAsset.default });
        if (disposed) return;

        memory = wasm.memory;
        universe = module.Universe.new();
        antCountInput.max = String(universe.max_ants());
        antCountInput.disabled = false;
        universe.set_ant_count(Number(antCountInput.value));
        const width = universe.width();
        const height = universe.height();
        canvas.width = width * CELL_SIZE;
        canvas.height = height * CELL_SIZE;
        context.imageSmoothingEnabled = false;

        const draw = () => {
          if (!universe || !memory || disposed) return;
          if (!paused) universe.tick();

          context.fillStyle = CELL_COLORS[0];
          context.fillRect(0, 0, canvas.width, canvas.height);

          const cells = new Uint8Array(memory.buffer, universe.cells(), width * height);
          for (let index = 0; index < cells.length; index++) {
            const cellType = cells[index];
            if (cellType === 0) continue;
            context.fillStyle = CELL_COLORS[cellType] ?? CELL_COLORS[0];
            context.fillRect(
              (index % width) * CELL_SIZE,
              Math.floor(index / width) * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }

          const antsCount = universe.ants_count();
          const ants = new Uint32Array(
            memory.buffer,
            universe.ants_positions_flat(),
            antsCount * 2
          );
          context.fillStyle = "#fff2c2";
          for (let index = 0; index < antsCount; index++) {
            const row = ants[index * 2];
            const col = ants[index * 2 + 1];
            context.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }

          frameCount++;
          if (frameCount % 30 === 0) {
            setStatus(`${paused ? "paused" : "running"} · ${antsCount} ants`);
          }
          frame = requestAnimationFrame(draw);
        };

        const reset = () => {
          universe?.free();
          universe = module.Universe.new();
          universe.set_ant_count(Number(antCountInput.value));
          setStatus(`${paused ? "paused" : "running"} · ${universe.ants_count()} ants`);
        };
        const addAnt = () => {
          if (!universe) return;
          if (!universe.new_ant()) {
            setStatus(`ant limit reached · ${universe.ants_count()} ants`);
          }
        };
        const togglePause = () => {
          paused = !paused;
          pauseButton.textContent = paused ? "Resume" : "Pause";
          if (universe) setStatus(`${paused ? "paused" : "running"} · ${universe.ants_count()} ants`);
        };

        resetButton.addEventListener("click", reset);
        addAntButton.addEventListener("click", addAnt);
        pauseButton.addEventListener("click", togglePause);
        antCountInput.addEventListener("input", setAntCount);
        resetButton.disabled = false;
        addAntButton.disabled = false;
        pauseButton.disabled = false;
        setAntCount();
        setStatus(`running · ${universe.ants_count()} ants`);
        draw();

        cleanup = () => {
          resetButton.removeEventListener("click", reset);
          addAntButton.removeEventListener("click", addAnt);
          pauseButton.removeEventListener("click", togglePause);
          antCountInput.removeEventListener("input", setAntCount);
        };
      } catch (error) {
        console.error("Could not initialize the Anthill WebAssembly demo.", error);
        setStatus("Anthill demo could not be loaded. Open the source repository for details.");
      }
    };

    let cleanup = () => {};
    void initialize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
      universe?.free();
    };
  }, []);

  return (
    <div className="anthill-demo">
      <div className="anthill-toolbar">
        <span ref={statusRef} role="status" aria-live="polite">Loading simulation…</span>
        <div className="anthill-controls" aria-label="Anthill simulation controls">
          <button ref={pauseRef} type="button" disabled>Pause</button>
          <button ref={addAntRef} type="button" disabled>Add ant</button>
          <button ref={resetRef} type="button" disabled>Reset</button>
        </div>
      </div>
      <div className="anthill-population-control">
        <label htmlFor="anthill-population-slider">Ant count</label>
        <input
          ref={antCountInputRef}
          id="anthill-population-slider"
          type="range"
          min="1"
          max="200"
          step="1"
          defaultValue="20"
          aria-describedby="anthill-population-hint"
          disabled
        />
        <output ref={antCountOutputRef} htmlFor="anthill-population-slider">20</output>
      </div>
      <canvas
        ref={canvasRef}
        className="anthill-canvas"
        aria-label="Animated ant-colony simulation with food, trails, and ants"
      />
      <p id="anthill-population-hint" className="anthill-hint">
        Adjust the live population with the slider. Ants can reproduce up to 200; reset starts a new world at the selected count.
      </p>
    </div>
  );
}
