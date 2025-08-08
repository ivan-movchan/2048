const VERSION = "v1.1";

const BOARD_SIZE = 4;
const PIECE_COUNT = 16;

const MOVE_UP = 0;
const MOVE_DOWN = 2;
const MOVE_LEFT = 1;
const MOVE_RIGHT = 3;

const MOVE_KEYS = [ "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD" ];

document.getElementById("version").innerHTML = VERSION;

let scores = (window.localStorage.getItem("scores") === null) ? 0 : parseInt(window.localStorage.getItem("scores"));
let bestScores = (window.localStorage.getItem("bestScores") === null) ? 0 : parseInt(window.localStorage.getItem("bestScores"));
let moves = (window.localStorage.getItem("moves") === null) ? 0 : parseInt(window.localStorage.getItem("moves"));

let gameBoard = null;

if (moves > 0) {
    gameBoard = (window.localStorage.getItem("board") === null) ? null : JSON.parse(window.localStorage.getItem("board"));
};

function newNumber() {
    return (Math.floor(Math.random() * 10) === 0) ? 4 : 2;
}

function initGameBoard() {
    if (gameBoard === null) {
        gameBoard = [];
        
        for (let y = 0; y < BOARD_SIZE; y++) {
            gameBoard[y] = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                gameBoard[y][x] = 0;
            };
        };

        for (let i = 0; i < 2; i++) {
            let x = Math.floor(Math.random() * BOARD_SIZE);
            let y = Math.floor(Math.random() * BOARD_SIZE);
            if (gameBoard[y][x] !== 0) {
                x = Math.floor(Math.random() * BOARD_SIZE);
                y = Math.floor(Math.random() * BOARD_SIZE);
            };
            gameBoard[y][x] = newNumber();
        };
    };
    
    document.getElementById("game-board").innerHTML = "";
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            document.getElementById("game-board").innerHTML += `<span class="square game-board-piece" id="piece${y}${x}"></span>`;
        };
    };
}

function drawGameBoard() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            document.getElementById(`piece${y}${x}`).innerText = (gameBoard[y][x] === 0 ? "" : gameBoard[y][x]);
        };
    };
}

function updateData() {
    if (scores > bestScores) {
        bestScores = scores;
    };
    
    document.getElementById("scores").innerText = scores;
    document.getElementById("best-scores").innerText = bestScores;
    document.getElementById("moves").innerText = moves;
    
    saveGameState();
}

function produceMove(board, boardSize, scores, direction) {
    let newScores = scores;
    
    if (direction === MOVE_UP) {
        for (let x = 0; x < boardSize; x++) {
            for (let y = 1; y < boardSize; y++) {
                if (board[y-1][x] === 0 || board[y-1][x] === board[y][x]) {
                    board[y-1][x] += board[y][x]
                    if (board[y-1][x] === (board[y][x] * 2)) {
                        newScores += board[y-1][x];
                    };
                    board[y][x] = 0;
                };
            };
        };
    } else if (direction === MOVE_DOWN) {
        for (let x = 0; x < boardSize; x++) {
            for (let y = 0; y < boardSize-1; y++) {
                if (board[y+1][x] === 0 || board[y+1][x] === board[y][x]) {
                    board[y+1][x] += board[y][x];
                    if (board[y+1][x] === (board[y][x] * 2)) {
                        newScores += board[y+1][x];
                    };
                    board[y][x] = 0;
                };
            };
        };
    } else if (direction === MOVE_LEFT) {
        for (let y = 0; y < boardSize; y++) {
            for (let x = 1; x < boardSize; x++) {
                if (board[y][x-1] == 0 || board[y][x-1] === board[y][x]) {
                    board[y][x-1] += board[y][x];
                    if (board[y][x-1] === (board[y][x] * 2)) {
                        newScores += board[y][x-1];
                    };
                    board[y][x] = 0;
                };
            };
        };
    } else if (direction === MOVE_RIGHT) {
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize-1; x++) {
                if (board[y][x+1] === 0 || board[y][x+1] === board[y][x]) {
                    board[y][x+1] += board[y][x];
                    if (board[y][x+1] === (board[y][x] * 2)) {
                        newScores += board[y][x+1];
                    };
                    board[y][x] = 0;
                };
            };
        };
    } else {
        return scores;
    };
    
    return newScores;
}

function makeMove(move) {
    let prevBoard = JSON.parse(JSON.stringify(gameBoard));
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        scores = produceMove(gameBoard, BOARD_SIZE, scores, move);
    };
    
    let freeCells = [];
    let boardChanged = false;
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (gameBoard[y][x] === 0) {
                freeCells.push([y, x]);
            };
            if (prevBoard[y][x] !== gameBoard[y][x]) {
                boardChanged = true;
            };
        };
    };
    
    if (boardChanged) {
        moves += 1;
        
        if (freeCells.length > 0) {
            let anyCell = freeCells[Math.floor(Math.random() * freeCells.length)];
            gameBoard[anyCell[0]][anyCell[1]] = newNumber();
        };
        
        drawGameBoard();
        updateData();
    };
}

function saveGameState() {
    window.localStorage.setItem("board", JSON.stringify(gameBoard));
    window.localStorage.setItem("scores", scores);
    window.localStorage.setItem("bestScores", bestScores);
    window.localStorage.setItem("moves", moves);
}

function onKeyUp(e) {
    if (MOVE_KEYS.includes(e.code)) {
        makeMove(MOVE_KEYS.indexOf(e.code) - (e.code.startsWith("Key") ? 4 : 0));
    };
}

function newGame(clearData = false) {
    gameBoard = clearData ? null : gameBoard;
    scores = clearData ? 0 : scores;
    moves = clearData ? 0 : moves;
    initGameBoard();
    drawGameBoard();
    updateData();
}

newGame();

addEventListener("keyup", onKeyUp);