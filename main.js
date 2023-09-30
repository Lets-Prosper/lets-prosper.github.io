// Trained demo

// {"levels":[{"inputs":[0,0,0,0.7129208604216236,0.844633889226857],"outputs":[0,1,0,0,0,0],"biases":[0.36305218254413196,-0.2791670414264066,0.4275719993903899,0.4027458214192947,-0.1648425455618889,0.7084421730524109],"weights":[[0.3099786471233225,-0.3915812303206001,0.30590022536932193,0.67631166972877,-0.40093357966710313,0.4776540054623362],[-0.1300940341672106,0.25599629146942315,0.5962190754371645,-0.6025871227165938,0.5688570403446533,0.5798153686386649],[-0.019827395911881512,-0.39025613767290446,-0.3322073137425033,-0.2794871585314656,-0.39950245876287893,0.6604811197924],[-0.6026384035174138,-0.4830377279362584,0.06482137404789662,-0.16471884655217137,-0.768131765421022,-0.594662449274259],[-0.12069418023377829,0.08732687240685152,-0.7621459227593416,-0.4414718016093638,-0.3608969399307149,-0.45086201465107245]]},{"inputs":[0,1,0,0,0,0],"outputs":[1,1,1,0],"biases":[-0.6000476107381317,-0.5739339900967068,0.010620722687706939,0.4275676132718233],"weights":[[0.4512893425058352,0.13357256080778102,0.8456264813112793,-0.36799149894740196],[0.04920798283982766,0.5459048469143315,0.684432764064606,-0.4688219880645502],[-0.8004523350794828,-0.5609857160829502,0.5064092973244019,-0.20586692052996036],[-0.6829858151500844,-0.2712646619433167,-0.5900683300757498,0.8290350606055005],[0.6641896165367301,-0.6323434548016649,0.6242894800654318,0.21370081956492093],[-0.5915991310846063,-0.47612192458473507,-0.01466000791721321,-0.6241154075452968]]}]}

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
      NeuralNetwork.mutate(cars[i].brain, 0.05);
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, getRandomColor()),
];

animate();

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

function animate(time) {
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
