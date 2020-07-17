var canvas;
var canvasContext;
var xPos;
var yPos;
var mouse_pressed = false;
var digit = Array(28)
  .fill()
  .map(() => Array(28).fill(0));
window.onload = function () {
  document.getElementById('display-digit').style.display = 'none';
  document.getElementById('alertThanks').style.display = 'none';
  document.getElementById('inputCorrect').style.display = 'none';
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  canvas.width = 280;
  canvas.height = 280;

  canvas.addEventListener('mousemove', function (evt) {
    if (evt.buttons !== 1) {
      return;
    }
    if (mouse_pressed) {
      var mousePos = findMousePos(evt);
      fillCustomBlock(Math.floor(mousePos.x / 10), Math.floor(mousePos.y / 10));
    }
  });
  canvas.addEventListener('touchmove', function (evt) {
    if (mouse_pressed) {
      var mousePos = findMousePos(evt);
      fillCustomBlock(Math.floor(mousePos.x / 10), Math.floor(mousePos.y / 10));
    }
  });

  canvas.addEventListener('click', function (evt) {
    var mousePos = findMousePos(evt);
    fillCustomBlock(Math.floor(mousePos.x / 10), Math.floor(mousePos.y / 10));
  });

  canvas.addEventListener('mousedown', function (evt) {
    mouse_pressed = true;
  });

  canvas.addEventListener('mouseup', function (evt) {
    mouse_pressed = false;
  });
  canvas.addEventListener('touchstart', function (evt) {
    mouse_pressed = true;
  });

  canvas.addEventListener('touchend', function (evt) {
    mouse_pressed = false;
  });
};

function fillCustomBlock(x, y) {
  if (x < 0) x = 0; //Sometimes if mouse is ta the top corner, Math.floor() yeilds a negative number
  if (digit[y][x] !== 1) {
    if (y < 0) y = 0;
    digit[y][x] = 1; // Note: here it is important to keep y and x in this order only!
    canvasContext.fillRect(10 * x, 10 * y, 10, 10);
    for (var i = x - 1; i <= x + 1; i++) {
      if (i < 28 && i >= 0)
        for (var j = y - 1; j <= y + 1; j++) {
          if (i !== j && j < 28 && j >= 0) {
            if (digit[j][i] === 0) {
              paintLightGrey(i, j);
              digit[j][i] += 1 / 3;
            } else if (digit[j][i] <= 1 / 3) {
              paintGrey(i, j);
              digit[j][i] += 1 / 3;
            } else if (digit[j][i] <= 2 / 3) {
              canvasContext.fillRect(10 * i, 10 * j, 10, 10);
              digit[j][i] += 1 / 3;
            }
          }
        }
    }
  }
}

function paintLightGrey(x, y) {
  canvasContext.fillStyle = 'darkgray ';
  canvasContext.fillRect(10 * x, 10 * y, 10, 10);
  canvasContext.fillStyle = 'black';
}

function paintGrey(x, y) {
  canvasContext.fillStyle = 'gray';
  canvasContext.fillRect(10 * x, 10 * y, 10, 10);
  canvasContext.fillStyle = 'black';
}

function findMousePos(evt) {
  var rectBorder = canvas.getBoundingClientRect(); //Accounts for scroll distance and margin outside canvas
  var mouseX = evt.clientX - rectBorder.left;
  var mouseY = evt.clientY - rectBorder.top;
  return {
    x: mouseX,
    y: mouseY,
  };
}

function clearCanvas(evt) {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  digit = Array(28)
    .fill()
    .map(() => Array(28).fill(0));
  document.getElementById('modal-ans').innerHTML = '';
  document.getElementById('display-digit').style.display = 'none';
  document.getElementById('description').style.display = 'block';
  document.getElementById('inputCorrect').style.display = 'none';
  document.getElementById('wrongBtn').removeAttribute('disabled');
  document.getElementById('correctBtn').removeAttribute('disabled');
  document.getElementById('alertThanks').style.display = 'none';
}

function wrongPrediction(evt) {
  document.getElementById('inputCorrect').style.display = 'block';
  document.getElementById('alertThanks').style.display = 'none';
  document.getElementById('correctBtn').setAttribute('disabled', 'true');
}

function correctPrediction(evt) {
  //On CLick function for "Yes" in answer
  document.getElementById('alertThanks').style.display = 'block';
  document.getElementById('inputCorrect').style.display = 'none';
  document.getElementById('wrongBtn').setAttribute('disabled', 'true');
}

function submitFeedback(evt) {
  //Submit function for feedback form
  document.getElementById('alertThanks').style.display = 'block';
}
