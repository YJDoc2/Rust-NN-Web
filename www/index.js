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
  document.getElementById('ans').innerHTML=result;
  document.getElementById('modal-ans').innerHTML=result;
  document.getElementById('display-digit').style.display = "block";
  document.getElementById('description').style.display = "none";
});

function guess(arr) {
  //return wasm.guess(arr);
  return 'hello';
}
