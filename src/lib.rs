mod net;
mod utils;
use ndarray::Array1;

use wasm_bindgen::prelude::*;

#[macro_use]
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Output {
    pub conf: f32,
    pub predict: u8,
}

#[wasm_bindgen]
pub fn guess(input: Vec<i32>) -> Output {
    let mut a = Array1::zeros(input.len());
    for i in 0..input.len() {
        a[i] = input[i] as f32;
    }
    unsafe {
        a = net::net.feedforward(&a);
    }

    let mut output;
    let mut conf;

    output = net::max(&a);
    conf = net::confidence(&a);

    let mut out = Output {
        conf: conf,
        predict: output as u8,
    };

    out
}
