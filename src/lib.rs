mod manipulation;
mod utils;
use manipulation::Direction;
use utils::set_panic_hook;

use ndarray::{Array1, Array2};
use wasm_bindgen::prelude::*;

#[macro_use]
use serde::{Deserialize, Serialize};
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Output {
    pub max_conf: f32,
    pub max_conf_predict: u8,
    pub most_occ: u8,
    pub most_occ_conf: f32,
}

struct Network {
    num_layers: usize,
    sizes: Vec<i32>,
    biases: Vec<Array1<f32>>,
    weights: Vec<Array2<f32>>,
}

impl Network {
    pub fn feedforward(&self, input: &Array1<f32>) -> Array1<f32> {
        let mut a: Array1<f32> = input.clone();
        for (b, w) in self.biases.iter().zip(self.weights.iter()) {
            let dot = w.dot(&a);
            let sum = dot + b;
            a = sigmoid(sum);
        }
        a
    }
}

static mut net: Network = Network {
    num_layers: 0,
    sizes: Vec::new(),
    biases: Vec::new(),
    weights: Vec::new(),
};

#[derive(Serialize, Deserialize)]
pub struct WB {
    acc: f32,
    weights: Vec<Vec<Vec<f32>>>,
    biases: Vec<Vec<f32>>,
}

#[wasm_bindgen]
pub fn load_from_string(sizes: Vec<i32>, s: String) {
    set_panic_hook();
    let wb: WB = serde_json::from_str(&s).unwrap();
    let mut biases = Vec::new();
    let mut weights = Vec::new();
    for b in wb.biases {
        let b_in = Array1::from(b);
        biases.push(b_in);
    }
    for w_vec in wb.weights {
        let mut a: Array2<f32> = Array2::zeros([w_vec[0].len(), w_vec.len()]);
        for i in 0..w_vec[0].len() {
            for j in 0..w_vec.len() {
                a[[i, j]] = w_vec[j][i];
            }
        }
        weights.push(a);
    }
    unsafe {
        net = Network {
            num_layers: sizes.len(),
            sizes: sizes,
            weights: weights,
            biases: biases,
        };
    }
}

#[wasm_bindgen]
pub fn guess(input: Vec<i32>) -> Output {
    let mut a = Array1::zeros(input.len());
    for i in 0..input.len() {
        a[i] = input[i] as f32;
    }
    let mut activation = Vec::new();
    unsafe {
        activation.push(net.feedforward(&a));
        activation.push(net.feedforward(&manipulation::shift(&a, Direction::Left, 2)));
        activation.push(net.feedforward(&manipulation::shift(&a, Direction::Down, 2)));
        activation.push(net.feedforward(&manipulation::shift(&a, Direction::Right, 2)));
        activation.push(net.feedforward(&manipulation::shift(&a, Direction::Up, 2)));
    }

    let mut output = Vec::new();
    let mut conf = Vec::new();

    for a in activation.iter() {
        output.push(max(&a));
        conf.push(confidence(&a));
    }

    let mut out = Output {
        max_conf: 0.0,
        max_conf_predict: 0,
        most_occ: 0,
        most_occ_conf: 0.0,
    };

    for i in 0..5 {
        if conf[i] > out.max_conf {
            out.max_conf = conf[i];
            out.max_conf_predict = output[i] as u8;
        }
    }

    let mut counts = std::collections::BTreeMap::new();
    for a in output.iter() {
        *counts.entry(a).or_insert(0) += 1;
    }

    let max = counts
        .into_iter()
        .max_by_key(|&(val, count)| (*val, count))
        .unwrap_or((&0, 0));

    out.most_occ = *(max.0) as u8;
    out.most_occ_conf = conf[output
        .iter()
        .position(|&a| a == out.most_occ as usize)
        .unwrap()];

    out
}

fn confidence(out: &Array1<f32>) -> f32 {
    let max = max(out);
    let mut sum = 0.0;
    for i in 0..10 {
        if i != max as usize {
            sum += out[i];
        }
    }
    let avg = sum / 9.0;

    (out[max as usize] - avg) * 100.0
}

fn max(input: &Array1<f32>) -> usize {
    let mut max = std::f32::MIN;
    let mut ret_idx = 0;
    for (idx, i) in input.iter().enumerate() {
        if *i > max {
            max = *i;
            ret_idx = idx;
        }
    }
    ret_idx
}

fn sigmoid(x: Array1<f32>) -> Array1<f32> {
    x.map(|x: &f32| 1.0 / (1.0 + std::f64::consts::E.powf(-*x as f64)) as f32)
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rust-nn-web!");
}
