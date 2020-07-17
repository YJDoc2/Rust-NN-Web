use crate::utils;
use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};

use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct WB {
    acc: f32,
    weights: Vec<Vec<Vec<f32>>>,
    biases: Vec<Vec<f32>>,
}

pub struct Network {
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

pub static mut net: Network = Network {
    num_layers: 0,
    sizes: Vec::new(),
    biases: Vec::new(),
    weights: Vec::new(),
};

pub fn confidence(out: &Array1<f32>) -> f32 {
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

pub fn max(input: &Array1<f32>) -> usize {
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

pub fn sigmoid(x: Array1<f32>) -> Array1<f32> {
    x.map(|x: &f32| 1.0 / (1.0 + std::f64::consts::E.powf(-*x as f64)) as f32)
}
