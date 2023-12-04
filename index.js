const canvas = document.querySelector("#canvas");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scoreValue = document.querySelector("#score-value");
const deadScore = document.querySelector("#dead-score");
const startGameBtn = document.querySelector("#start-game-btn");
const restartGameBtn = document.querySelector("#restart-game-btn");
const startModal = document.querySelector("#start-modal");
const deadModal = document.querySelector("#dead-modal");
const scoreboard = document.querySelector(".score-board");
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
const friction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let gameStarted = false;

const init = function () {
  player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  gameStarted = true;
};

const spawnEnemies = function () {
  setInterval(() => {
    const radius = 15 + Math.random() * (30 - 15);

    let x;
    let y;
    if (Math.random() < 0.5) {
      // enters from left or right
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      // enters from top or bottom
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, ${
      30 + Math.random() * (80 - 30)
    }%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle) * 1.5,
      y: Math.sin(angle) * 1.5,
    };
    const enemy = new Enemy(x, y, radius, color, velocity);
    enemies.push(enemy);
  }, 1000);
};
let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.3)";

  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, i) => {
    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, i) => {
    projectile.update();
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x + projectile.radius > canvas.width ||
      projectile.y + projectile.radius > canvas.height ||
      projectile.y - projectile.radius < 0
    ) {
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
    }
  });
  // console.log(projectiles);
  enemies.forEach((enemy, i) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist <= enemy.radius + player.radius + 1) {
      deadScore.textContent = score;
      deadModal.style.display = "flex";
      gameStarted = false;
      cancelAnimationFrame(animationId);
    }
    projectiles.forEach((projectile, k) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist <= enemy.radius + projectile.radius + 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * Math.random() * 6,
                y: (Math.random() - 0.5) * Math.random() * 6,
              }
            )
          );
        }
        score++;

        scoreValue.textContent = score;
        gsap.to(".score-board", { scale: "5", duration: 0.3 });
        gsap.to(".score-board", { scale: "1", duration: 0.3 });
        if (enemy.radius - 13 > 13) {
          gsap.to(enemy, {
            radius: enemy.radius - 13,
          });
          enemy.radius -= 13;
          // removes flash when hit enemy

          setTimeout(() => {
            projectiles.splice(k, 1);
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(i, 1);
            projectiles.splice(k, 1);
          }, 0);
        }
      }
    });
  });
}

window.addEventListener("click", (e) => {
  if (!gameStarted) return;

  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 7,
    y: Math.sin(angle) * 7,
  };
  const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    "white",
    velocity
  );
  projectiles.push(projectile);
});

startGameBtn.addEventListener("click", () => {
  console.log(gameStarted);
  if (gameStarted) return;
  init();
  gsap.to("#start-modal > h1", {
    y: "-800px",
    delay: 0.2,
    duration: 1.2,
    ease: "power1.in",
  });
  gsap.to("#start-modal > p", {
    y: "-800px",
    delay: 0.4,
    ease: "power1.in",
    duration: 1.2,
  });
  gsap.to("#start-modal > button", {
    y: "-800px",
    delay: 0.6,
    duration: 1.2,
    ease: "power1.in",
  });

  setTimeout(() => {
    animate();
    spawnEnemies();

    startModal.style.display = "none";
    deadModal.style.display = "none";
    gsap.to(".score-board", { top: "3%", duration: 1.5, ease: "power1.inOut" });
  }, 2100);
});

restartGameBtn.addEventListener("click", () => {
  if (gameStarted) return;

  init();

  animate();
  spawnEnemies();
  startModal.style.display = "none";
  deadModal.style.display = "none";
});
