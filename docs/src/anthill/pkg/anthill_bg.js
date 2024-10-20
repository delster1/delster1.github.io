let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
/**
*/
export const CellType = Object.freeze({ Empty:0,"0":"Empty",Trail:1,"1":"Trail",Searched:2,"2":"Searched",Food:3,"3":"Food",Home:4,"4":"Home", });

const CellFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cell_free(ptr >>> 0));
/**
*/
export class Cell {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Cell.prototype);
        obj.__wbg_ptr = ptr;
        CellFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cell_free(ptr);
    }
    /**
    * @returns {CellType}
    */
    get cell_type() {
        const ret = wasm.__wbg_get_cell_cell_type(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {CellType} arg0
    */
    set cell_type(arg0) {
        wasm.__wbg_set_cell_cell_type(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get pheromone_level() {
        const ret = wasm.__wbg_get_cell_pheromone_level(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set pheromone_level(arg0) {
        wasm.__wbg_set_cell_pheromone_level(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    to_u8() {
        const ret = wasm.cell_to_u8(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get_pheromone_level() {
        const ret = wasm.cell_get_pheromone_level(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} new_pheremone_level
    * @returns {Cell}
    */
    static build_pheremone_cell(new_pheremone_level) {
        const ret = wasm.cell_build_pheremone_cell(new_pheremone_level);
        return Cell.__wrap(ret);
    }
    /**
    * @returns {Cell}
    */
    static build_empty_cell() {
        const ret = wasm.cell_build_empty_cell();
        return Cell.__wrap(ret);
    }
    /**
    * @returns {Cell}
    */
    static build_searched_cell() {
        const ret = wasm.cell_build_searched_cell();
        return Cell.__wrap(ret);
    }
    /**
    * @returns {Cell}
    */
    static build_food_cell() {
        const ret = wasm.cell_build_food_cell();
        return Cell.__wrap(ret);
    }
}

const UniverseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_universe_free(ptr >>> 0));
/**
*/
export class Universe {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Universe.prototype);
        obj.__wbg_ptr = ptr;
        UniverseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UniverseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_universe_free(ptr);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @returns {boolean}
    */
    is_within_bounds(x, y) {
        const ret = wasm.universe_is_within_bounds(this.__wbg_ptr, x, y);
        return ret !== 0;
    }
    /**
    * @param {number} row
    * @param {number} col
    * @returns {Cell}
    */
    get_cell(row, col) {
        const ret = wasm.universe_get_cell(this.__wbg_ptr, row, col);
        return Cell.__wrap(ret);
    }
    /**
    */
    new_ant() {
        wasm.universe_new_ant(this.__wbg_ptr);
    }
    /**
    */
    tick() {
        wasm.universe_tick(this.__wbg_ptr);
    }
    /**
    * @returns {number}
    */
    ants_positions_flat() {
        const ret = wasm.universe_ants_positions_flat(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    ants_count() {
        const ret = wasm.universe_ants_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    width() {
        const ret = wasm.universe_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    height() {
        const ret = wasm.universe_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    cells() {
        const ret = wasm.universe_cells(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {string}
    */
    render() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.universe_render(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Universe}
    */
    static new() {
        const ret = wasm.universe_new();
        return Universe.__wrap(ret);
    }
}

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_log_5bb5f88f245d7762(arg0) {
    console.log(getObject(arg0));
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export const __wbg_random_26e2d782b541ca6b = typeof Math.random == 'function' ? Math.random : notDefined('Math.random');

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

