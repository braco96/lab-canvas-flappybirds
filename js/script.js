window.onload = function() {
  // Obtenemos el canvas y su contexto para poder dibujar
  const canvas = document.getElementById("my-canvas");
  const ctx = canvas.getContext("2d");

  // Definimos el tamaño del canvas; así controlamos el área de juego
  canvas.width = 500;
  canvas.height = 600;

  // Cargamos todas las imágenes necesarias del juego
  const bgImg = new Image();
  bgImg.src = "images/bg.png"; // fondo del escenario
  const birdImg = new Image();
  birdImg.src = "images/flappy.png"; // imagen del jugador
  const topImg = new Image();
  topImg.src = "images/obstacle_top.png"; // obstáculo superior
  const bottomImg = new Image();
  bottomImg.src = "images/obstacle_bottom.png"; // obstáculo inferior

  // Clase genérica para el jugador y los obstáculos
  class Component {
    constructor(width, height, x, y, image) {
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
      this.image = image;
      // Velocidades y gravedad iniciales
      this.speedX = 0;
      this.speedY = 0;
      this.gravity = 0.25; // gravedad positiva hace que caiga
      this.gravitySpeed = 0; // velocidad acumulada por la gravedad
    }

    // Dibuja la imagen del componente en su posición actual
    update() {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // Calcula la nueva posición aplicando gravedad y velocidad
    newPos() {
      this.gravitySpeed += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY + this.gravitySpeed;
    }

    // Comprobamos colisión rectangular con otro componente
    crashWith(other) {
      return !(
        this.bottom() < other.top() ||
        this.top() > other.bottom() ||
        this.right() < other.left() ||
        this.left() > other.right()
      );
    }

    // Métodos auxiliares para facilitar los cálculos de colisión
    top() { return this.y; }
    bottom() { return this.y + this.height; }
    left() { return this.x; }
    right() { return this.x + this.width; }
  }

  let player; // guardará la instancia del pájaro
  let obstacles = []; // almacena todos los obstáculos activos
  let frame = 0; // contador de frames para crear obstáculos y puntuar
  let score = 0; // puntuación del jugador
  let interval; // referencia al intervalo del juego

  // Asociamos la función startGame al botón
  document.getElementById("start-button").onclick = function() {
    startGame();
  };

  function startGame() {
    // Reiniciamos todos los valores para empezar una nueva partida
    player = new Component(40, 30, 50, 150, birdImg); // posición inicial del pájaro
    player.gravity = 0.25; // gravedad base hacia abajo
    obstacles = [];
    frame = 0;
    score = 0;
    clearInterval(interval);
    // Actualizamos el juego 50 veces por segundo aprox.
    interval = setInterval(updateGameArea, 20);
  }

  function updateGameArea() {
    // Limpiamos el canvas para dibujar el nuevo frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Dibujamos el fondo en cada actualización
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    frame += 1; // contamos las actualizaciones realizadas

    // Cada 120 frames (aprox. cada 2.4 s) creamos un nuevo par de obstáculos
    if (frame % 120 === 0) {
      createObstaclePair();
    }

    // Movemos y dibujamos todos los obstáculos existentes
    obstacles.forEach((obs) => {
      obs.x += -2; // desplazamos a la izquierda para simular movimiento
      obs.update();
    });

    // Eliminamos obstáculos que ya salieron de la pantalla
    obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);

    // Comprobamos si el jugador choca con algún obstáculo
    for (let i = 0; i < obstacles.length; i++) {
      if (player.crashWith(obstacles[i])) {
        stopGame();
        return; // detenemos la actualización si hay colisión
      }
    }

    // Actualizamos la posición del jugador
    player.newPos();
    // Si el jugador sale del canvas por arriba o abajo, termina el juego
    if (player.y < 0 || player.y + player.height > canvas.height) {
      stopGame();
      return;
    }
    player.update();

    // Actualizamos y mostramos la puntuación en pantalla
    score = Math.floor(frame / 10); // cada 10 frames sumamos un punto
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText("Puntos: " + score, 10, 30);
  }

  function createObstaclePair() {
    // Generamos la apertura vertical de forma aleatoria
    const gap = 120; // espacio para que pase el pájaro
    const minHeight = 20;
    const maxHeight = canvas.height - gap - 20;
    const height = Math.floor(
      Math.random() * (maxHeight - minHeight + 1) + minHeight
    );
    // Tubo superior
    obstacles.push(new Component(50, height, canvas.width, 0, topImg));
    // Tubo inferior
    obstacles.push(
      new Component(
        50,
        canvas.height - height - gap,
        canvas.width,
        height + gap,
        bottomImg
      )
    );
  }

  function stopGame() {
    // Detenemos el intervalo y mostramos un mensaje de finalización
    clearInterval(interval);
    ctx.font = "40px sans-serif";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
  }

  // Escuchamos la barra espaciadora para controlar el vuelo del pájaro
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      player.gravity = -0.4; // gravedad negativa para que suba
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      player.gravity = 0.25; // restablecemos la gravedad para que baje
    }
  });
};
