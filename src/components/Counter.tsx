import { useState } from "react";

export default function Counter() {
  const [n, setN] = useState<number>(0);
  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => setN((v) => v - 1)} aria-label="decrement">−</button>
      <strong>{n}</strong>
      <button onClick={() => setN((v) => v + 1)} aria-label="increment">+</button>
    </div>
  );
}

