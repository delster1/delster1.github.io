// src/components/AnthillIsland.tsx
import { useEffect, useRef } from "react";

export default function AnthillIsland() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initedRef = useRef(false); // avoid double init in React StrictMode (dev)

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      const mod = await import("anthill");

      const wasmUrl = (await import("anthill/anthill_bg.wasm?url")).default;

      await mod.default(wasmUrl);

      const { Universe, memory } = mod;

      // ---- your existing logic ----
      const CELL_SIZE = 5;
      let universe = Universe.new();
      const width = universe.width();
      const height = universe.height();

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.height = (CELL_SIZE + 1) * height + 1;
      canvas.width = (CELL_SIZE + 1) * width + 1;
      const ctx = canvas.getContext("2d")!;

      const GRID_COLOR = "#CCCCCC";
      const CELL_COLOR: Record<number, string> = {
        0: "#EEEEE4",
        1: "green",
        2: "red",
        3: "#FFD700",
        4: "#8B4513",
      };

      const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;
        for (let i = 0; i <= width; i++) {
          ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
          ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }
        for (let j = 0; j <= height; j++) {
          ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
          ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }
        ctx.stroke();
      };

      const drawCells = () => {
        const cellsPtr = universe.cells();
        const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const idx = row * width + col;
            ctx.fillStyle = CELL_COLOR[cells[idx]];
            ctx.fillRect(
              col * (CELL_SIZE + 1) + 1,
              row * (CELL_SIZE + 1) + 1,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }

        const antsCount = universe.ants_count();
        const antsPtr = universe.ants_positions_flat();
        const ants = new Uint32Array(memory.buffer, antsPtr, antsCount * 2);
        for (let i = 0; i < antsCount; i++) {
          const row = ants[i * 2];
          const col = ants[i * 2 + 1];
          ctx.fillStyle = "black";
          ctx.fillRect(
            col * (CELL_SIZE + 1) + 1,
            row * (CELL_SIZE + 1) + 1,
            CELL_SIZE,
            CELL_SIZE
          );
        }
        ctx.stroke();
      };

      const loop = () => {
        universe.tick();
        drawGrid();
        drawCells();
        requestAnimationFrame(loop);
      };
      loop();
    })();
  }, []);

  return (
    <div>
      <div id="food-count"></div>
      <button id="reset">Reset</button>
      <canvas ref={canvasRef} id="anthill-canvas" />
    </div>
  );
}

