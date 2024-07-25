const board = document.getElementById('board');
const context = board.getContext('2d');
const nInput = document.getElementById('n-input');
const pInput = document.getElementById('p-input');
const ballInput = document.getElementById('ball-input');
const startBtn = document.getElementById('start-btn');
const playIcon = document.getElementById('play');
const speed = document.getElementById('speed');

const boardWidth = board.width //520;
const boardHeight = board.height //600;

context.font = '25px Montserrat';
context.textBaseline = 'middle';
context.textAlign = 'center';

const rowHeight = 40;
const colWidth = 25;
const cols = Math.floor(boardWidth/colWidth);
let pegs = [];
const pegRadius = 9;

let balls = [];
let simSpeed = 2*Number(speed.value);
let speedY = 0.75 * simSpeed;
const ballRadius = 5;
let animationStopped = true;
let hasFinished = true;
let fallenBalls = 0;

// let raf;
// let rafs = [];

let buckets = [];
for (let i=0; i<=nInput.value; i++) {
  buckets.push({k: i, count: 0})
}

// Checking inputs

const setN = () => {
  let n = Number(nInput.value);
  if (n < 1) {
    nInput.value = 1;
    return 1;
  }
  if (n>10) {
    nInput.value = 10;
    return 10;
  }
  if (!Number.isInteger(n)) {
    nInput.value = Math.round(n);
    return Math.round(n);
  }
  return n
}

const setBalls = () => {
  let n = Number(ballInput.value);
  if (n < 1) {
    ballInput.value = 1;
    return 1;
  }
  if (n>200) {
    ballInput.value = 200;
    return 200;
  }
  if (!Number.isInteger(n)) {
    ballInput.value = Math.round(n);
    return Math.round(n);
  }
  return n
}

const setP = () => {
  let p = Number(pInput.value);
  if (p <= 0) {
    pInput.value = 0.01;
    return 0.01;
  }
  if (p>1) {
    pInput.value = 1;
    return 1;
  }
  if (!Number.isInteger(p*100)) {
    pInput.value = Math.round(p*100)/100;
    return Math.round(p*100)/100;
  }
  return p;
}



// Drawing Board
const drawBoard = () => {
  context.lineWidth = 10;
  context.lineCap = 'round';
  context.strokeStyle = 'rgb(0,0,0)';
  context.beginPath();
  context.moveTo(240, 0);
  context.lineTo(240, 40);
  context.moveTo(280, 0);
  context.lineTo(280, 40);
  context.stroke();
}


// Drawing Pegs

const drawPeg = (row, col) => {
  context.lineWidth = 10;
  context.lineCap = 'round';
  context.fillStyle = 'rgb(0,0,0)';
  context.strokeStyle = 'rgb(0,0,0)';
  const x = 260 + col * colWidth;
  const y = 80 + row * rowHeight;
  context.beginPath();
  context.arc(x, y, pegRadius, 0, Math.PI * 2)
  context.fill();
  pegs.push({x, y})
}

const drawPegs = () => {
  pegs = [];
  const rows = setN();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      if (row%2 === 0 && col%2 === 0) {
        drawPeg(row, col);
        if (col != 0) {
          drawPeg(row, -col);
        }
      } else if (row%2 === 1 && col%2 === 1) {
        drawPeg(row, col);
        drawPeg(row, -col);
      }
    }
  }
}

// draw Buckets

const drawBuckets = () => {
  const n = setN();
  let bucketCount = n + 1;
  for (let i=1; i<=bucketCount; i++) {
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = 'rgb(0,0,0)';
    context.fillStyle = 'rgba(10, 150, 125, 0.3)'
    context.beginPath();
    context.moveTo(260 - (bucketCount/2 - i)*2*colWidth, boardHeight);
    context.lineTo(260 - (bucketCount/2 - i)*2*colWidth, boardHeight - 5*buckets[i-1].count);
    context.lineTo(260 - (bucketCount/2 - i+1)*2*colWidth, boardHeight - 5*buckets[i-1].count);
    context.lineTo(260 - (bucketCount/2 - i+1)*2*colWidth, boardHeight);
    context.fill();
    // context.moveTo(260 + (bucketCount/2 - i)*2*colWidth, boardHeight);
    // context.lineTo(260 + (bucketCount/2 - i)*2*colWidth, boardHeight-5);
    context.stroke();
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillText(buckets[i-1].count, 260 - (bucketCount/2 - i)*2*colWidth - colWidth, boardHeight-15);
    if (fallenBalls<balls.length && balls[fallenBalls].y >= boardHeight - ballRadius - 2) {
      balls[fallenBalls].y = boardHeight+10;
      balls[fallenBalls].draw();
      const rCount = balls[fallenBalls].rightCount;
      buckets[rCount].count++;
      fallenBalls++;
    }
    // context.fillText(i-1, 260 - (bucketCount/2 - i)*2*colWidth - colWidth, boardHeight-15);
  }
}

// add Balls

const addBalls = () => {
  fallenBalls = 0;
  balls = [];
  const ballCount = setBalls();
  for (let i = 0; i < ballCount; i++) {
    balls.push({
      x: 260,
      y: -9,
      rightCount: 0,
      draw() {
        context.lineWidth = 3;
        context.strokeStyle = 'rgb(200, 200, 220)';
        context.fillStyle = 'rgb(100,90,100)';
        context.lineCap = 'round';
        context.beginPath();
        context.arc(this.x, this.y, 6, 0, Math.PI * 2);
        context.stroke();
        context.fill();
      },
    })
  }
}

// Simulate Ball Movement

const redrawCanvas = () => {
  context.clearRect(0, 0, board.width, board.height);
  drawBoard();
  drawPegs();
  drawBuckets();
}

const animateBounce = (ball, prob) => {
  const rand = Math.random();
  if (rand <= prob) {
    ball.rightCount++
  }
  let bounceHeight = 15;
  let bounceSteps = Math.floor(40/simSpeed);
  let jumpWidth = bounceSteps + 10;
  let jumpHeight = Math.floor(20 / simSpeed);

  const bounce = () => {
    if (bounceSteps > 0) {
      ball.y -= bounceHeight / jumpHeight;
      ball.x += rand > prob ? -colWidth / jumpWidth : colWidth / jumpWidth;
      bounceSteps -= 1;
      redrawCanvas();
      ball.draw();
      requestAnimationFrame(bounce);
    } else {
      //Ball falling after bounce
      ball.y += bounceHeight / jumpHeight;
      ball.x += rand > prob ? -colWidth / jumpWidth : colWidth / jumpWidth;
      bounceHeight -= 1.5;
      redrawCanvas();
      ball.draw();
      if (bounceHeight > 0) {
      requestAnimationFrame(bounce);
      }
    }
  }
  bounce();
}

const ballMove = (ball, prob) => {
  // context.clearRect(ball.prevX - ballRadius - 1, ball.prevY - ballRadius - 1, ballRadius * 2 + 2, ballRadius * 2 + 2);
  // ball.prevX = ball.x;
  // ball.prevY = ball.y;

  for (let peg of pegs) {
    if (Math.abs(ball.y - peg.y) <= pegRadius && Math.abs(ball.x - peg.x) <= pegRadius + 0.1) {
      animateBounce(ball, prob);
      return;
    }
  }
  if (ball.y < boardHeight - ballRadius) {
    ball.y += speedY;
  }
  ball.draw();
}

const animateBall = async (ball, prob) => {
  const moveBall = () => {
    redrawCanvas();
    balls.forEach(b => b.draw());
    ballMove(ball, prob);
    if (ball.y < boardHeight - ballRadius) {
      requestAnimationFrame(moveBall);
    }
  }
  moveBall();
}

// Animate Balls falling

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const animate = async () => {
  const prob = setP();
  for (let i = 0; i < balls.length; i++) {
    if (!animationStopped) {
      if (balls[i].y === -9) {
        await animateBall(balls[i], prob);
        await delay(1000/simSpeed);
      }
      if (i === balls.length - 1) {
        setTimeout(() => {
          startBtn.style.background = 'rgb(122, 202, 48)';
          playIcon.classList.remove('fa-pause');
          playIcon.classList.add('fa-play');
          animationStopped = true;
          hasFinished = true;
          nInput.disabled = false;
          pInput.disabled = false;
          ballInput.disabled = false;
          speed.disabled = false;
        }, 10000/simSpeed);
      }
    }
  }
}

const startSimulation = () => {
  nInput.disabled = true;
  pInput.disabled = true;
  ballInput.disabled = true;
  speed.disabled = true;
  buckets = [];
  hasFinished = false;
  simSpeed = 2*Number(speed.value);
  speedY = 0.75 * simSpeed;
  const n = setN();
  for (let i=0; i<=n; i++) {
    buckets.push({k: i, count: 0})
  }
  addBalls();
  animationStopped = false;
  startBtn.style.background = 'rgb(255, 0, 0)';
  playIcon.classList.remove('fa-play');
  playIcon.classList.add('fa-pause');
  // startBtn.textContent = 'Stop';
  window.requestAnimationFrame(animate);
}

const stopSimulation = () => {
  animationStopped = true;
  startBtn.style.background = 'rgb(122, 202, 48)';
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play');
}

const continueSimulation = () => {
  animationStopped = false;
  startBtn.style.background = 'rgb(255, 0, 0)';
  playIcon.classList.remove('fa-play');
  playIcon.classList.add('fa-pause');
  window.requestAnimationFrame(animate);
}

const toggleSimulation = () => {
  if (hasFinished) {
    startSimulation();
  } else if (animationStopped) {
    continueSimulation();
  } else {
    stopSimulation();
  }
}

// Start Animation

startBtn.addEventListener('click', toggleSimulation)


// On Load
window.addEventListener('load', () => {
  addBalls();
  redrawCanvas();
})

// redraw board when n or balls changed

nInput.addEventListener('change', () => {
  const n = setN();
  buckets = [];
  for (let i=0; i<=n; i++) {
    buckets.push({k: i, count: 0})
  }
  redrawCanvas();
})

ballInput.addEventListener('change', () => {
  setBalls();
  addBalls();
  redrawCanvas();
})

pInput.addEventListener('change', setP)
