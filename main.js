const MOD = 700;
let idx = -1;
let row_data = [];
let traffic = [];

fetch('development_data.json')
.then(response => response.json())
.then(data => {
  row_data = data;
  animate();
})
.catch(error => {
  console.error('Error:', error);
});



const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
  }
}

function getLaneConverter(lane) {
  return (lane) => {
    if (lane => 0 && lane <= 3000) {
      return 1;
    } else if (lane >3000 && lane <= 6000) {
      return 0;
    } else {
      return 2;
    }
  }
}
function getTraffic(state) {
  traffic = [];
  traffic.push(
    new Car(road.getLaneCenter(0), -(Math.abs(state.FirstObjectDistance_Y % MOD)), 30, 50, "DUMMY", 3, getRandomColor()),
    new Car(road.getLaneCenter(1), -(Math.abs(state.SecondObjectDistance_Y % MOD)), 30, 50, "PERSON", 2, "white"),
    new Car(road.getLaneCenter(2), -(Math.abs(state.ThirdObjectDistance_Y % MOD)), 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -(Math.abs(state.FourthObjectDistance_Y % MOD)), 30, 50, "DUMMY", 2, getRandomColor()),
  )
  return traffic;
}

// const traffic = [
//   // x, y, width, height, color
//   new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, getRandomColor()),
//   new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, getRandomColor()),
// ];


function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function processData(row_data) {
  current_state = row_data[0];
  next_state = row_data[1];
  current_timestamp = current_state.Timestamp;
  animate(null, row_data, 0);
}

function animate(time) {
  if (idx == -1) {
    idx = 40; //+(prompt("Enter the state number"));
    const current_state = row_data[idx];
    traffic = getTraffic(current_state);
    console.log(traffic);
  }

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx);
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
