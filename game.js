const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.7;
let baseSpeed = 5;
let speed = baseSpeed;
let maxSpeed = 12;

let score = 0;
let gameOver = false;
let powerMode = false;
let powerTimer = 0;

class Dog {
  constructor() {
    this.width = 60;
    this.height = 40;
    this.x = 150;
    this.y = canvas.height - 120;
    this.dy = 0;
    this.jumpForce = -15;
    this.grounded = true;
  }

  draw() {
    ctx.fillStyle = "#c68642"; // brown
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.dy += gravity;
    this.y += this.dy;

    if (this.y + this.height >= canvas.height - 80) {
      this.y = canvas.height - 80 - this.height;
      this.dy = 0;
      this.grounded = true;
    }

    this.draw();
  }

  jump() {
    if (this.grounded) {
      this.dy = this.jumpForce;
      this.grounded = false;
      playJumpSound();
    }
  }
}

class Obstacle {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = canvas.width;
    this.y = canvas.height - 120;
  }

  draw() {
    ctx.fillStyle = "#2e2e2e";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= speed;
    this.draw();
  }
}

class PowerUp {
  constructor() {
    this.radius = 20;
    this.x = canvas.width;
    this.y = canvas.height - 180;
  }

  draw() {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x -= speed;
    this.draw();
  }
}

let dog = new Dog();
let obstacles = [];
let powerUps = [];

function spawnObstacle() {
  if (!powerMode) {
    obstacles.push(new Obstacle());
  }
}

function spawnPowerUp() {
  powerUps.push(new PowerUp());
}

setInterval(spawnObstacle, 2000);
setInterval(spawnPowerUp, 10000);

function detectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function playJumpSound() {
  let audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  audio.play();
}

function playPowerSound() {
  let audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play();
}

function animate() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over - Refresh to Restart", canvas.width/4, canvas.height/2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  dog.update();

  obstacles.forEach((obs, index) => {
    obs.update();
    if (detectCollision(dog, obs)) {
      if (!powerMode) {
        gameOver = true;
      }
    }
    if (obs.x + obs.width < 0) {
      obstacles.splice(index, 1);
    }
  });

  powerUps.forEach((p, index) => {
    p.update();
    if (
      dog.x < p.x + p.radius &&
      dog.x + dog.width > p.x - p.radius &&
      dog.y < p.y + p.radius &&
      dog.y + dog.height > p.y - p.radius
    ) {
      powerMode = true;
      powerTimer = 300;
      speed = maxSpeed;
      playPowerSound();
      powerUps.splice(index, 1);
    }
    if (p.x < 0) powerUps.splice(index, 1);
  });

  if (powerMode) {
    powerTimer--;
    if (powerTimer <= 0) {
      powerMode = false;
      speed = baseSpeed + score / 200;
    }
  }

  score++;
  speed = baseSpeed + score / 500;

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(animate);
}

window.addEventListener("keydown", e => {
  if (e.code === "Space") dog.jump();
});

window.addEventListener("touchstart", () => {
  dog.jump();
});

animate();
