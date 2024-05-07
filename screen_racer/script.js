var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var gameRunning = false;
var lastTime = 0;
var speedIncrease = 0.05;
var speedDecrease = 10;
var carTurningLeft = false;
var carTurningRight = false;
var coins = [];
var score = 0;
var gameLoop;

var car = {
    x: 50,
    y: 200,
    width: 40,
    height: 20,
    speed: 30,
    angle: 0
};

document.addEventListener("keydown", function(event) {
    if(event.key === "ArrowLeft") {
        carTurningLeft = true;
    }
    if(event.key === "ArrowRight") {
        carTurningRight = true;
    }
});

document.addEventListener("keyup", function(event) {
    if(event.key === "ArrowLeft") {
        carTurningLeft = false;
    }
    if(event.key === "ArrowRight") {
        carTurningRight = false;
    }
});

function updateCarPosition(deltaTime) {
    // Beregn bilens nye position baseret på delta time
    var distance = car.speed * (deltaTime / 1000); // deltaTime er i millisekunder, så vi deler med 1000 for at få sekunder
    var newX = car.x + Math.cos(car.angle) * distance;
    var newY = car.y + Math.sin(car.angle) * distance;

    if (newX - car.width / 2 < 0 || newX + car.width / 2 > canvas.width || newY - car.height / 2 < 0 || newY + car.height / 2 > canvas.height) {
        console.log("crashed car")
        stopGame(); //efter metode kører forsvinder det rigtige canvas layout
         return;// Stop funktionen her for at forhindre yderligere behandling af bilens position
    }

    // Opdater bilens position
    car.x = newX;
    car.y = newY;

    // Opdater bilens rotation baseret på delta time og tastetryk
    var rotationSpeed = (Math.PI / 1); // Juster dette efter behov
    if (carTurningLeft) {
        car.angle -= rotationSpeed * (deltaTime / 1000);
    }
    if (carTurningRight) {
        car.angle += rotationSpeed * (deltaTime / 1000);
    }
}

function spawnCar() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    
    // Tegn kroppen
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(-car.width / 2 + 5, -car.height / 2);
    ctx.lineTo(car.width / 2 - 5, -car.height / 2);
    ctx.quadraticCurveTo(car.width / 2, -car.height / 2, car.width / 2, -car.height / 2 + 5);
    ctx.lineTo(car.width / 2, car.height / 2 - 5);
    ctx.quadraticCurveTo(car.width / 2, car.height / 2, car.width / 2 - 5, car.height / 2);
    ctx.lineTo(-car.width / 2 + 5, car.height / 2);
    ctx.quadraticCurveTo(-car.width / 2, car.height / 2, -car.width / 2, car.height / 2 - 5);
    ctx.lineTo(-car.width / 2, -car.height / 2 + 5);
    ctx.quadraticCurveTo(-car.width / 2, -car.height / 2, -car.width / 2 + 5, -car.height / 2);
    ctx.fill();
    
    // Tegn kanten
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

function drawCoins() {
    if (!gameRunning) return;
    coins.forEach(function(coin) {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = coin.color;
        ctx.fill();

        ctx.font = "bold 15px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("C", coin.x, coin.y);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function spawnCoin() {
    if (!gameRunning) return;
    if (coins.length === 0) {
        // Generér tilfældige koordinater for mønten inden for canvasets dimensioner
        var coinX = Math.random() * canvas.width;
        var coinY = Math.random() * canvas.height;

        // Opret mønten med de genererede koordinater og en fast radius
        var coin = {
            x: coinX,
            y: coinY,
            radius: 10, // Juster radius efter behov
            color: "gold"
        };

        // Tilføj mønten til mønt-arrayet
        coins.push(coin);
        console.log("coin spawned");
    }
}

function checkCoinCollision() {
    if (!gameRunning) return;
    for (var i = coins.length - 1; i >= 0; i--) {
        var coin = coins[i];
        // Beregn afstanden mellem bilen og mønten
        var dx = car.x - coin.x;
        var dy = car.y - coin.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        // Hvis afstanden er mindre end summen af bilens og møntens radii, kolliderer de
        if (distance < car.width / 2 + coin.radius) {
            // Fjern mønten fra arrayet
            coins.splice(i, 1);

            car.speed -= speedDecrease;
            score++;
            console.log("Collision detected");
        }
    }
}

function drawHUD() {
    // Tegn hastighed (speed)
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Speed: " + car.speed.toFixed(2), 70, 30);

    // Tegn score
    ctx.fillText("Score: " + score, 50, 60);
}

function gameOver() {
    console.log("GameOver called")
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);     // Ryd canvas

    // Vis "Game Over" besked
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);

    // Vis scoren
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);

    // Stop spil-loopet
    cancelAnimationFrame(gameLoop);
    console.log("Game is over");
}

function startGame() {
    //nulstilling af stats
    score = 0;
    car = {
        x: 50,
        y: 200,
        width: 40,
        height: 20,
        speed: 30,
        angle: 0
    };
    coins = [];

    gameRunning = true;
    lastTime = performance.now();
    gameLoop = function(timestamp) {
        if (!gameRunning) {
            console.log("Game stopped. Exiting game loop.");
            return; // Stop spillet, hvis gameRunning er falsk
        }

        var deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        updateCarPosition(deltaTime);
        spawnCar();
        spawnCoin();
        drawCoins();
        checkCoinCollision();
        drawHUD();

        car.speed += speedIncrease;

        requestAnimationFrame(gameLoop);
    };
    gameLoop(lastTime);
}

function stopGame() {
    gameOver();
    startButton.textContent = "Start Game";
}

var startButton = document.getElementById("startButton");
startButton.addEventListener("click", function() {
    if (!gameRunning){
        startGame();
        startButton.textContent = "Stop Game";
    } else {
        stopGame();
    }
        
});
