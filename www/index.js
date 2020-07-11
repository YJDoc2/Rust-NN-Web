import * as wasm from 'rust_nn_web';

import * as wb from './network.json';

wasm.load_from_string([784, 30, 10], JSON.stringify(wb.default));

document.getElementById('submit').addEventListener('click', () => {
  var newArr = [];
  for (var i = 0; i < 28; i++) {
    newArr = newArr.concat(digit[i]);
  }
  var result = wasm.guess(newArr);
  console.log(result);
  document.getElementById('mc-conf').innerHTML = result.max_conf;
  document.getElementById('mc-ans').innerHTML = result.max_conf_predict;
  document.getElementById('mp-conf').innerHTML = result.most_occ_conf;
  document.getElementById('mp-ans').innerHTML = result.most_occ;
  document.getElementById('modal-ans').innerHTML = result.predict;
  document.getElementById('display-digit').style.display = 'block';
  document.getElementById('description').style.display = 'none';
});

function guess(arr) {
  //return wasm.guess(arr);
  return 'hello';
}
