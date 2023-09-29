let row_data = null;

fetch('development_data.json')
  .then(response => response.json())
  .then(data => {
    row_data = data;
    processData(row_data);
  })
  .catch(error => {
    console.error('Error:', error);
  });


const canvas = document.getElementById("myCanvas");
canvas.width = 200;


const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "KEYS");
const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)];

function animate() {
  
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  car.update(road.borders, traffic);
  
  canvas.height = window.innerHeight;
  
  ctx.save();
  ctx.translate(0, -car.y + canvas.height * 0.7);
  
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx, "red");
  }
  
  road.draw(ctx);
  car.draw(ctx, "blue");
  
  ctx.restore();
  requestAnimationFrame(animate);
}


function processData(row_data) {
  current_state = row_data[0];
  next_state = row_data[1];
  current_timestamp = current_state.Timestamp;
  while (next_state != null) {
    current_timestamp += 1;
    if (current_timestamp >= next_state.Timestamp) {
      animate();
      current_state = next_state;
      next_state = row_data[row_data.indexOf(current_state) + 1];
    }
    console.log(current_state)
  }
}