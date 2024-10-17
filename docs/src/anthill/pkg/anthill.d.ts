/* tslint:disable */
/* eslint-disable */
/**
*/
export enum CellType {
  Empty = 0,
  Trail = 1,
  Searched = 2,
  Food = 3,
  Home = 4,
}
/**
*/
export class Cell {
  free(): void;
/**
* @returns {number}
*/
  to_u8(): number;
/**
* @returns {number}
*/
  get_pheromone_level(): number;
/**
* @param {number} new_pheremone_level
* @returns {Cell}
*/
  static build_pheremone_cell(new_pheremone_level: number): Cell;
/**
* @returns {Cell}
*/
  static build_empty_cell(): Cell;
/**
* @returns {Cell}
*/
  static build_searched_cell(): Cell;
/**
* @returns {Cell}
*/
  static build_food_cell(): Cell;
/**
*/
  cell_type: CellType;
/**
*/
  pheromone_level: number;
}
/**
*/
export class Universe {
  free(): void;
/**
* @param {number} x
* @param {number} y
* @returns {boolean}
*/
  is_within_bounds(x: number, y: number): boolean;
/**
* @param {number} row
* @param {number} col
* @returns {Cell}
*/
  get_cell(row: number, col: number): Cell;
/**
*/
  new_ant(): void;
/**
*/
  tick(): void;
/**
* @returns {number}
*/
  ants_positions_flat(): number;
/**
* @returns {number}
*/
  ants_count(): number;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @returns {number}
*/
  cells(): number;
/**
* @returns {string}
*/
  render(): string;
/**
* @returns {Universe}
*/
  static new(): Universe;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_universe_free: (a: number) => void;
  readonly universe_is_within_bounds: (a: number, b: number, c: number) => number;
  readonly universe_get_cell: (a: number, b: number, c: number) => number;
  readonly universe_new_ant: (a: number) => void;
  readonly universe_tick: (a: number) => void;
  readonly universe_ants_positions_flat: (a: number) => number;
  readonly universe_ants_count: (a: number) => number;
  readonly universe_width: (a: number) => number;
  readonly universe_height: (a: number) => number;
  readonly universe_cells: (a: number) => number;
  readonly universe_render: (a: number, b: number) => void;
  readonly universe_new: () => number;
  readonly __wbg_cell_free: (a: number) => void;
  readonly __wbg_get_cell_cell_type: (a: number) => number;
  readonly __wbg_set_cell_cell_type: (a: number, b: number) => void;
  readonly __wbg_get_cell_pheromone_level: (a: number) => number;
  readonly __wbg_set_cell_pheromone_level: (a: number, b: number) => void;
  readonly cell_to_u8: (a: number) => number;
  readonly cell_get_pheromone_level: (a: number) => number;
  readonly cell_build_pheremone_cell: (a: number) => number;
  readonly cell_build_empty_cell: () => number;
  readonly cell_build_searched_cell: () => number;
  readonly cell_build_food_cell: () => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
