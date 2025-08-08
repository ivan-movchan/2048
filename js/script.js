const VERSION = "v1.1";

const BOARD_SIZE = 4;
const EMPTY_PIECE_SIGN = "&times;";

const REDRAW_DELAY = 200;

const MOVE_UP = 0;
const MOVE_LEFT = 1;
const MOVE_DOWN = 2;
const MOVE_RIGHT = 3;
const MOVE_KEYS = [ "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD" ];

let scores, bestScores, moves, gameBoard = null;

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
}

function drawGameBoard(hidden = false) {
    if (document.getElementById("game-board").innerHTML === "") {
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                document.getElementById("game-board").innerHTML += `<span class="square piece" id="piece${y}${x}"></span>`;
            };
        };
    };
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            var piece = document.getElementById(`piece${y}${x}`);
            
            if ((gameBoard[y][x] === parseInt(piece.innerHTML)) || ((gameBoard[y][x] === 0 && piece.innerHTML === EMPTY_PIECE_SIGN))) {
                continue;
            };
            
            piece.style.backgroundColor = (gameBoard[y][x] !== 0 ? 'var(--piece-bg)' : 'var(--bg)');
            
            if (hidden) {
                piece.style.color = 'transparent';
            } else {
                piece.innerHTML = (gameBoard[y][x] === 0 ? EMPTY_PIECE_SIGN : gameBoard[y][x]);
                piece.style.backgroundColor = (gameBoard[y][x] !== 0 ? 'var(--piece-bg)' : 'var(--bg)');
                piece.style.color = (gameBoard[y][x] !== 0 ? 'var(--piece-fg)' : 'var(--fg)');
                
                if (!piece.classList.contains("piece-empty") && gameBoard[y][x] === 0) {
                    piece.classList.add("piece-empty");
                };
                
                if (piece.classList.contains("piece-empty") && gameBoard[y][x] !== 0) {
                    piece.classList.remove("piece-empty");
                };
            };
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
    let deltaX = (direction === MOVE_LEFT ? -1 : (direction === MOVE_RIGHT ? 1 : 0));
    let deltaY = (direction === MOVE_UP ? -1 : (direction === MOVE_DOWN ? 1 : 0));
    let startX = (deltaX === -1 ? 1 : 0);
    let startY = (deltaY === -1 ? 1 : 0);
    let endX = (boardSize - (deltaX === 1 ? 1 : (deltaX === -1 ? 0 : 0)));
    let endY = (boardSize - (deltaY === 1 ? 1 : (deltaY === -1 ? 0 : 0)));
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            let targetX = x + deltaX;
            let targetY = y + deltaY;
            if (board[targetY][targetX] === 0 || board[targetY][targetX] === board[y][x]) {
                board[targetY][targetX] += board[y][x];
                newScores += ((board[targetY][targetX] === (board[y][x] * 2)) ? board[targetY][targetX] : 0);
                board[y][x] = 0;
            };
        };
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
        
        drawGameBoard(true);
        setTimeout(drawGameBoard, REDRAW_DELAY);
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
    if (clearData) {
        drawGameBoard(true);
    };
    
    gameBoard = clearData ? null : gameBoard;
    scores = clearData ? 0 : scores;
    moves = clearData ? 0 : moves;
    
    setTimeout(() => {
        initGameBoard();
        drawGameBoard();
        updateData();
    }, REDRAW_DELAY);
}

function initApp() {
    document.getElementById("version").innerHTML = VERSION;
    
    scores = (window.localStorage.getItem("scores") === null) ? 0 : parseInt(window.localStorage.getItem("scores"));
    bestScores = (window.localStorage.getItem("bestScores") === null) ? 0 : parseInt(window.localStorage.getItem("bestScores"));
    moves = (window.localStorage.getItem("moves") === null) ? 0 : parseInt(window.localStorage.getItem("moves"));
    
    gameBoard = null;
    
    if (moves > 0) {
        gameBoard = (window.localStorage.getItem("board") === null) ? null : JSON.parse(window.localStorage.getItem("board"));
    };
    
    newGame();
    
    addEventListener("keyup", onKeyUp);
}

initApp();