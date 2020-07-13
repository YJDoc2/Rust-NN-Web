import * as wasm from "rust_nn_web";

import * as wb from "./network.json";

wasm.load_from_string([784, 30, 10], JSON.stringify(wb.default));

document.getElementById("submit").addEventListener("click", () => {
  var left_start = 0;
  var right_end = 0;
  var top_start = 0;
  var bottom_end = 0;
  var flag1 = false;
  var flag2 = false;
  for (var p = 0; p < 28; p++){
  	for (var q = 0 ; q <28 ; q++) {
  		if(!flag1 && digit[q][p]>0){
  			left_start = p;
  			flag1 = true;
  		}
  		if(!flag2 && digit[p][q]>0){
  			top_start = p;
  			flag2 = true;
  		}
  	}
  	if(flag1 && flag2)
  		break;
  }
  flag1 = false;
  flag2 = false;
  for (var p = 27; p >= 0 ; p--){
  	for (var q = 27 ; q >= 0 ; q--) {
  		if(!flag1 && digit[q][p]>0){
  			right_end = p;
  			flag1 = true;
  		}
  		if(!flag2 && digit[p][q]>0){
  			bottom_end = p;
  			flag2 = true;
  		}
  	}
  	if(flag1 && flag2)
  		break;
  }
  var horizontal_shift = 14-((left_start+right_end)/2);
  var vertical_shift = 14-((top_start+bottom_end)/2);
  for (var p = top_start; p <= bottom_end; p++){
  	if((27-right_end)>left_start) // bigger gap on right side
	  	for (var q = right_end ; q >= left_start ; q--) {
	  		digit[p][q+horizontal_shift]=digit[p][q];
	  		digit[p][q]=0;	
		}
	else
		for (var q = left_start ; q <= right_end ; q++) {
	  		digit[p][q + horizontal_shift]=digit[p][q];
	  		digit[p][q]=0;	
		}
  }


  for (var p = left_start + horizontal_shift; p <=  right_end +horizontal_shift; p++){
	if(27-bottom_end > top_start) // bigger gap on bottom
	  	for (var q = bottom_end ; q >= top_start ; q--) {
	  		digit[q + vertical_shift][p]=digit[q][p];
	  		digit[q][p]=0;	
		}
	else
		for (var q = top_start ; q <= bottom_end ; q++) {
	  		digit[q + vertical_shift][p]=digit[q][p];
	  		digit[q][p]=0;	
		}
 }

  var newArr = [];
  for (var i = 0; i < 28; i++) {
    newArr = newArr.concat(digit[i]);
  }
  var result = wasm.guess(newArr);
  console.log(result);

  document.getElementById("mc-conf").innerHTML = result.max_conf;
  document.getElementById("mc-ans").innerHTML = result.max_conf_predict;
  document.getElementById("mp-conf").innerHTML = result.most_occ_conf;
  document.getElementById("mp-ans").innerHTML = result.most_occ;
  document.getElementById("modal-ans").innerHTML = result.predict;
  document.getElementById("display-digit").style.display = "block";
  document.getElementById("description").style.display = "none";
});

document.getElementById("storeAns").addEventListener("click", async () => {
  var newArr = [];
  for (var i = 0; i < 28; i++) {
    newArr = newArr.concat(digit[i]);
  }
  const correctAns = document.getElementById("correctAns").value;
  console.log(correctAns);
  try {
    const data = await fetch("http://localhost:8000/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newArr: newArr, correctAns: correctAns }),
    });
    console.log("Feedback submitted!!!");
  } catch (e) {
    console.log(e);
  }

});

function guess(arr) {
  //return wasm.guess(arr);
  return "hello";
}
