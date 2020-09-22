const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

class Entity {
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

class Movable extends Entity {
  constructor(x, y, radius, color, velocity, speed = 1) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.speed = speed;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x * this.speed;
    this.y = this.y + this.velocity.y * this.speed;
  }
}

class Player extends Entity {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
  }
}

class Projectile extends Movable {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

class Enemy extends Movable {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, "blue");
const projectiles = [];
const enemies = [];

const spawnEnemies = () => {
  setInterval(() => {
    let x;
    let y;
    const radius = Math.random() * (30 - 10) + 10;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    console.log(x, y);
    const color = "red";
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

const animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  projectiles.forEach((projectile) => {
    projectile.update();
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        // Prevents enemies from flashing on dead
        setTimeout(() => {
          enemies.splice(enemyIndex, 1)
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    })
  });
};

addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }
  console.log(angle);
  const projectile = new Projectile(player.x, player.y, 5, "purple", velocity);
  projectiles.push(projectile);
});

animate();
spawnEnemies();
