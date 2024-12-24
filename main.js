// 获取游戏元素
const ball = document.getElementById('ball');
const paddle = document.getElementById('paddle');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameContainer = document.getElementById('gameContainer');
const scoresContainer = document.getElementById('scoresContainer');
let score = 0;
let lives = 3;
let ballSpeedX = 2;
let ballSpeedY = 2;
let paddleSpeed = 10;

// 初始化砖块
function createBricks() {
    const brickContainer = document.createElement('div');
    brickContainer.style.position = 'absolute';
    brickContainer.style.top = '50px';
    brickContainer.style.left = '50px';
    gameContainer.appendChild(brickContainer);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10; j++) {
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.top = i * 26 + 'px';
            brick.style.left = j * 76 + 'px';
            brickContainer.appendChild(brick);
        }
    }
}

// 移动挡板
document.addEventListener('mousemove', function (e) {
    let mouseX = e.clientX - gameContainer.offsetLeft;
    if (mouseX > 0 && mouseX < gameContainer.offsetWidth - paddle.offsetWidth) {
        paddle.style.left = mouseX + 'px';
    }
});

// 小球运动
function moveBall() {
    let ballX = ball.offsetLeft;
    let ballY = ball.offsetTop;
    let ballRadius = ball.offsetWidth / 2;
    let paddleX = paddle.offsetLeft;
    let paddleY = paddle.offsetTop;
    let paddleWidth = paddle.offsetWidth;
    let containerWidth = gameContainer.offsetWidth;
    let containerHeight = gameContainer.offsetHeight;

    // 检测小球与挡板的碰撞
    if (ballY + ballRadius >= paddleY && ballX + ballRadius >= paddleX && ballX - ballRadius <= paddleX + paddleWidth) {
        ballSpeedY = -ballSpeedY;
    }

    // 检测小球与砖块的碰撞
    let bricks = document.querySelectorAll('.brick');
    bricks.forEach(brick => {
        let brickX = brick.offsetLeft;
        let brickY = brick.offsetTop;
        let brickWidth = brick.offsetWidth;
        let brickHeight = brick.offsetHeight;

        if (ballY - ballRadius <= brickY + brickHeight && ballY + ballRadius >= brickY && ballX + ballRadius >= brickX && ballX - ballRadius <= brickX + brickWidth) {
            ballSpeedY = -ballSpeedY;
            brick.remove();
            score++;
            scoreDisplay.textContent = `得分: ${score}`;
        }
    });

    // 检测小球是否触碰底部
    if (ballY + ballRadius >= containerHeight) {
        lives--;
        livesDisplay.textContent = `生命: ${lives}`;
        if (lives === 0) {
            alert('游戏结束');
            document.location.reload();
        } else {
            ball.style.top = '280px';
            ball.style.left = '390px';
            ballSpeedX = 2;
            ballSpeedY = 2;
        }
    }

    // 小球碰壁反弹
    if (ballX + ballRadius >= containerWidth || ballX - ballRadius <= 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY - ballRadius <= 0) {
        ballSpeedY = -ballSpeedY;
    }

    // 更新小球位置
    ball.style.top = (ball.offsetTop + ballSpeedY) + 'px';
    ball.style.left = (ball.offsetLeft + ballSpeedX) + 'px';
}

// 游戏主循环
let gameInterval;
function startGame() {
    const playerName = document.getElementById('playerName').value;
    const playerId = document.getElementById('playerId').value;
    if (playerName && playerId) {
        gameContainer.style.display = 'block';
        createBricks();
        gameInterval = setInterval(moveBall, 10);
        fetchPlayerScores();
    } else {
        alert('请输入玩家名字和ID');
    }
}

// 获取所有玩家的分数
function fetchPlayerScores() {
    fetch('/players')
    .then(response => response.json())
    .then(data => {
            scoresContainer.innerHTML = '';
            data.forEach(player => {
                var playerScores = player.scores.map(score => score.score).join(', ');
                var playerInfo = `<p>${player.name} - ID: ${player.id}, 分数: ${playerScores}</p>`;
                scoresContainer.innerHTML += playerInfo;
            });
        })
    .catch(error => console.error('Error:', error));
}

// 页面加载完成后获取分数
document.addEventListener('DOMContentLoaded', fetchPlayerScores);