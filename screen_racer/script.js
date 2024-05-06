var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var gameRunning = false;
var lastTime = 0;
var speedIncrease = 0.10;
var carTurningLeft = false;
var carTurningRight = false;
var coins = [];
var score = 0;
var coinSpeedBonus = 5;

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

    // Kollision med venstre kant af canvas
    if (newX - car.width / 2 < 0) {
        newX = car.width / 2;
    }
    // Kollision med højre kant af canvas
    if (newX + car.width / 2 > canvas.width) {
        newX = canvas.width - car.width / 2;
    }
    // Kollision med øverste kant af canvas
    if (newY - car.height / 2 < 0) {
        newY = car.height / 2;
    }
    // Kollision med nederste kant af canvas
    if (newY + car.height / 2 > canvas.height) {
        newY = canvas.height - car.height / 2;
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


        // Funktion til at tegne bilen med afrundede kanter og en sort kant
function spawnCar() {
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
    coins.forEach(function(coin) {
        ctx.save(); // Gem den aktuelle kontekst

        // Tegn mønten (cirkel)
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = coin.color;
        ctx.fill();

        // Tegn 'C' indeni mønten
        ctx.font = "bold 15px Arial"; // Angiv skrifttype og størrelse
        ctx.fillStyle = "white"; // Farve på teksten
        ctx.textAlign = "center"; // Juster teksten til midten
        ctx.textBaseline = "middle"; // Juster teksten til midten
        ctx.fillText("C", coin.x, coin.y); // Tegn teksten

        // Tegn kanten omkring mønten
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore(); // Gendan den gemte kontekst
    });
}


function spawnCoin() {
    // Kontroller, om der allerede er en mønt på canvas
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
    }
}

function checkCoinCollision() {
    coins.forEach(function(coin, index) {
        // Beregn afstanden mellem bilen og mønten
        var dx = car.x - coin.x;
        var dy = car.y - coin.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        // Hvis afstanden er mindre end summen af bilens og møntens radii, kolliderer de
        if (distance < car.width / 2 + coin.radius) {
            // Fjern mønten fra arrayet
            coins.splice(index, 1);

            car.speed -= coinSpeedBonus;
            // Tilføj point eller udfør andre handlinger
            // Her kan du tilføje logik for at øge spillerens score, f.eks.
            score++;
            log.print(score);
        }
    });
}

function startGame() {
    gameRunning = true;
    lastTime = performance.now();
    function gameLoop(timestamp) {
        var deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        updateCarPosition(deltaTime);
        spawnCar();
        drawCoins();
        spawnCoin();
        checkCoinCollision();

        car.speed += speedIncrease;

        requestAnimationFrame(gameLoop);
    }
    // Start spillet
    gameLoop(lastTime);
}

function stopGame(){ //skal laves så den ikke refresher men køre den kode der skal være for game over! 
    gameRunning = false;
    location.reload();
}

var startButton = document.getElementById("startButton");
startButton.addEventListener("click", function() {
    if (!gameRunning){
        startGame();
        startButton.textContent = "Stop Game";
    } else {
        stopGame();
        startButton.textContent = "Start Game";
    }
        
});
