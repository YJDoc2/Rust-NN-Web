import * as wasm from 'rust_nn_web';

import * as wb from './network.json';

wasm.load_from_string([784, 30, 10], JSON.stringify(wb.default));

document.getElementById('submit').addEventListener('click', () => {
  let newArr = [];
  for (let i = 0; i < 28; i++) {
    newArr = newArr.concat(digit[i]);
  }
  let result = wasm.guess(newArr);
  console.log(result.conf, result.predict);

  let t_digit = JSON.parse(JSON.stringify(digit));

  let left_start = 0;
  let right_end = 0;
  let top_start = 0;
  let bottom_end = 0;
  let flag1 = false;
  let flag2 = false;
  for (let p = 0; p < 28; p++) {
    for (let q = 0; q < 28; q++) {
      if (!flag1 && t_digit[q][p] > 0) {
        left_start = p;
        flag1 = true;
      }
      if (!flag2 && t_digit[p][q] > 0) {
        top_start = p;
        flag2 = true;
      }
    }
    if (flag1 && flag2) break;
  }
  flag1 = false;
  flag2 = false;
  for (let p = 27; p >= 0; p--) {
    for (let q = 27; q >= 0; q--) {
      if (!flag1 && t_digit[q][p] > 0) {
        right_end = p;
        flag1 = true;
      }
      if (!flag2 && t_digit[p][q] > 0) {
        bottom_end = p;
        flag2 = true;
      }
    }
    if (flag1 && flag2) break;
  }
  let horizontal_shift = Math.floor(14 - (left_start + right_end) / 2);
  let vertical_shift = Math.floor(14 - (top_start + bottom_end) / 2);
  for (let p = top_start; p <= bottom_end; p++) {
    if (27 - right_end > left_start)
      // bigger gap on right side
      for (let q = right_end; q >= left_start; q--) {
        t_digit[p][q + horizontal_shift] = t_digit[p][q];
        t_digit[p][q] = 0;
      }
    else
      for (let q = left_start; q <= right_end; q++) {
        t_digit[p][q + horizontal_shift] = t_digit[p][q];
        t_digit[p][q] = 0;
      }
  }

  for (
    let p = left_start + horizontal_shift;
    p <= right_end + horizontal_shift;
    p++
  ) {
    if (27 - bottom_end > top_start)
      // bigger gap on bottom
      for (let q = bottom_end; q >= top_start; q--) {
        t_digit[q + vertical_shift][p] = t_digit[q][p];
        t_digit[q][p] = 0;
      }
    else
      for (let q = top_start; q <= bottom_end; q++) {
        t_digit[q + vertical_shift][p] = t_digit[q][p];
        t_digit[q][p] = 0;
      }
  }

  let t_newArr = [];
  for (let i = 0; i < 28; i++) {
    t_newArr = t_newArr.concat(t_digit[i]);
  }
  let t_result = wasm.guess(t_newArr);
  result = result.conf > t_result.conf ? result : t_result;
  document.getElementById('mc-conf').innerHTML = result.conf;
  document.getElementById('mc-ans').innerHTML = result.predict;
  document.getElementById('modal-ans').innerHTML = result.predict;
  document.getElementById('display-digit').style.display = 'block';
  document.getElementById('description').style.display = 'none';
});

document.getElementById('storeAns').addEventListener('click', async () => {
  let newArr = [];
  for (let i = 0; i < 28; i++) {
    newArr = newArr.concat(t_digit[i]);
  }
  const correctAns = document.getElementById('correctAns').value;
  console.log(correctAns);
  try {
    const data = await fetch('/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newArr: newArr, correctAns: correctAns }),
    });
    console.log('Feedback submitted!!!');
  } catch (e) {
    console.log(e);
  }
});
