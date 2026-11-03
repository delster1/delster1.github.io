/* tslint:disable */
/* eslint-disable */

export class Cell {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static build_empty_cell(): Cell;
    static build_food_cell(): Cell;
    static build_pheremone_cell(new_pheremone_level: number): Cell;
    static build_searched_cell(): Cell;
    get_pheromone_level(): number;
    to_u8(): number;
    cell_type: CellType;
    pheromone_level: number;
}

export enum CellType {
    Empty = 0,
    Trail = 1,
    Searched = 2,
    Food = 3,
    Home = 4,
}

export class Universe {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    ants_count(): number;
    ants_positions_flat(): number;
    cells(): number;
    get_cell(row: number, col: number): Cell;
    height(): number;
    is_within_bounds(x: number, y: number): boolean;
    max_ants(): number;
    new_ant(): boolean;
    static new(): Universe;
    render(): string;
    set_ant_count(count: number): void;
    tick(): void;
    width(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_cell_free: (a: number, b: number) => void;
    readonly __wbg_get_cell_cell_type: (a: number) => number;
    readonly __wbg_get_cell_pheromone_level: (a: number) => number;
    readonly __wbg_set_cell_cell_type: (a: number, b: number) => void;
    readonly __wbg_set_cell_pheromone_level: (a: number, b: number) => void;
    readonly __wbg_universe_free: (a: number, b: number) => void;
    readonly cell_build_empty_cell: () => number;
    readonly cell_build_food_cell: () => number;
    readonly cell_build_pheremone_cell: (a: number) => number;
    readonly cell_build_searched_cell: () => number;
    readonly cell_get_pheromone_level: (a: number) => number;
    readonly cell_to_u8: (a: number) => number;
    readonly universe_ants_count: (a: number) => number;
    readonly universe_ants_positions_flat: (a: number) => number;
    readonly universe_cells: (a: number) => number;
    readonly universe_get_cell: (a: number, b: number, c: number) => number;
    readonly universe_height: (a: number) => number;
    readonly universe_is_within_bounds: (a: number, b: number, c: number) => number;
    readonly universe_max_ants: (a: number) => number;
    readonly universe_new: () => number;
    readonly universe_new_ant: (a: number) => number;
    readonly universe_render: (a: number) => [number, number];
    readonly universe_set_ant_count: (a: number, b: number) => void;
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
