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
  constructor(x, y, radius, color, velocity, speed = 4) {
    super(x, y, radius, color, velocity, speed);
  }
}

class Enemy extends Movable {
  constructor(x, y, radius, color, velocity, speed = 2) {
    super(x, y, radius, color, velocity, speed);
    this.destinedRadius = radius;
  }

  update() {
    if (this.radius > this.destinedRadius) {
      this.radius -= 1;
    }
    super.update();
  }
}

class Particle extends Movable {
  constructor(x, y, radius, color, velocity, speed = 2) {
    super(x, y, radius, color, velocity, speed);
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    super.draw();
    c.restore();
  }

  update() {
    super.update();
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, "white");
const projectiles = [];
const enemies = [];
const particles = [];

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

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
};

let animationId;
const animate = () => {
  animationId = requestAnimationFrame(animate);
  // 0.1 Opacity is what makes a blurry background
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < 8; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2 + 1,
              enemy.color,
              {
                x: Math.random() - 0.5,
                y: Math.random() - 0.5,
              }
            )
          );
        }

        // setTimeout 0 Prevents enemies from flashing on dead
        if (enemy.radius - 10 > 10) {
          enemy.destinedRadius -= 10;
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      // Game over
      cancelAnimationFrame(animationId);
    }
  });
};

addEventListener("click", (event) => {
  console.log(projectiles.length);
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const projectile = new Projectile(
    player.x,
    player.y,
    5,
    "white",
    velocity,
    4
  );
  projectiles.push(projectile);
});

animate();
spawnEnemies();
