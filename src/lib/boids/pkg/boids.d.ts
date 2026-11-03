/* tslint:disable */
/* eslint-disable */

export class Boid {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    bias: number;
    group: BoidGroup;
    vx: number;
    vy: number;
    x: number;
    y: number;
}

export enum BoidGroup {
    None = 0,
    One = 1,
    Two = 2,
}

export class Pixel {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    Alpha: number;
    Blue: number;
    Green: number;
    Red: number;
}

export class Universe {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    boids_count(): number;
    clear_mouse_position(): void;
    height(): number;
    max_boids(): number;
    static new(): Universe;
    pixels(): number;
    set_boid_count(count: number): void;
    set_mouse_position(x: number, y: number): void;
    tick(): void;
    width(): number;
}

export function greet(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_boid_free: (a: number, b: number) => void;
    readonly __wbg_get_boid_bias: (a: number) => number;
    readonly __wbg_get_boid_group: (a: number) => number;
    readonly __wbg_get_boid_vx: (a: number) => number;
    readonly __wbg_get_boid_vy: (a: number) => number;
    readonly __wbg_get_boid_x: (a: number) => number;
    readonly __wbg_get_boid_y: (a: number) => number;
    readonly __wbg_get_pixel_Alpha: (a: number) => number;
    readonly __wbg_get_pixel_Blue: (a: number) => number;
    readonly __wbg_get_pixel_Green: (a: number) => number;
    readonly __wbg_get_pixel_Red: (a: number) => number;
    readonly __wbg_pixel_free: (a: number, b: number) => void;
    readonly __wbg_set_boid_bias: (a: number, b: number) => void;
    readonly __wbg_set_boid_group: (a: number, b: number) => void;
    readonly __wbg_set_boid_vx: (a: number, b: number) => void;
    readonly __wbg_set_boid_vy: (a: number, b: number) => void;
    readonly __wbg_set_boid_x: (a: number, b: number) => void;
    readonly __wbg_set_boid_y: (a: number, b: number) => void;
    readonly __wbg_set_pixel_Alpha: (a: number, b: number) => void;
    readonly __wbg_set_pixel_Blue: (a: number, b: number) => void;
    readonly __wbg_set_pixel_Green: (a: number, b: number) => void;
    readonly __wbg_set_pixel_Red: (a: number, b: number) => void;
    readonly __wbg_universe_free: (a: number, b: number) => void;
    readonly greet: () => void;
    readonly universe_boids_count: (a: number) => number;
    readonly universe_clear_mouse_position: (a: number) => void;
    readonly universe_height: (a: number) => number;
    readonly universe_max_boids: (a: number) => number;
    readonly universe_new: () => number;
    readonly universe_pixels: (a: number) => number;
    readonly universe_set_boid_count: (a: number, b: number) => void;
    readonly universe_set_mouse_position: (a: number, b: number, c: number) => void;
    readonly universe_tick: (a: number) => void;
    readonly universe_width: (a: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
