
const gameboard = function() {
    const board = [];

    let counter = 0;

    let tie = false;

    let moved = false;

    const winCondition = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

    for (let i = 0; i < 9; i++) {
        board[i] = square();
    }

    const playMove = function(index, player) {
        if (!board[index].getMove()) {
            counter++;
            board[index].addMove(player);
            moved = true;
        } else {
            moved = false;
        }

        if (counter === 9 && !checkWinner()) {
            tie = true;
        }
        return moved;
    };

    const getTieStatus = function() {
        return tie;
    };

    const displayBoard = function() {

        console.log(`${board[0].getMove()} ${board[1].getMove()} ${board[2].getMove()}`);
        console.log(`${board[3].getMove()} ${board[4].getMove()} ${board[5].getMove()}`);
        console.log(`${board[6].getMove()} ${board[7].getMove()} ${board[8].getMove()}`);
    }

    const checkWinner = function() {
        for (const condition of winCondition) {
            const firstStrike = board[condition[0]].getMove();
            const secondStrike = board[condition[1]].getMove();
            const thirdStrike = board[condition[2]].getMove();

            if (!firstStrike || !secondStrike || !thirdStrike) {
                continue;
            }

            if (firstStrike === secondStrike && firstStrike === thirdStrike) {
                return firstStrike;
            }
        }
        return false;
    }

    return {
        playMove,
        displayBoard,
        checkWinner,
        getTieStatus
    };
}

const square = function() {
    let value = 0;

    const addMove = function(player) {
        value = player;
    };

    const getMove = function() {
        return value;
    };

    return {
        addMove,
        getMove
    };
}

const ticTacToe = function(playerOne = "Player One", playerTwo = "Player Two") {
    const board = gameboard();
    const players = [
        { name: playerOne, mark: 1 },
        { name: playerTwo, mark: 2 }
    ];

    const gameAlerts = document.querySelector("div.game-alerts");
    const gameAlertsP1 = gameAlerts.firstElementChild;
    const gameAlertsP2 = gameAlerts.lastElementChild;

    const crossOutline = document.createElement("img");
    crossOutline.src = "./cross-outline.svg";
    const circleOutline = document.createElement("img");
    circleOutline.src = "./circle-outline.svg";

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.displayBoard();
        gameAlertsP2.textContent = `${getActivePlayer().name}'s turn...`;
    };

    const playRound = (index) => {
        const isMoved = board.playMove(index, getActivePlayer().mark);

        if (isMoved) {
            gameAlertsP1.textContent = `${getActivePlayer().name} has played their turn.`;
            const winner = board.checkWinner();
            const tie = board.getTieStatus();

            if (winner || tie) {
                if (winner) {
                    const winningPlayer = players[winner - 1];
                    gameAlertsP1.textContent = `${winningPlayer.name} has won the match.`;
                    gameAlertsP2.textContent = "Game over. Press start to play again.";
                }
                if (tie) {
                    gameAlertsP1.textContent = "It's a draw.";
                    gameAlertsP2.textContent = "Game over. Press start to play again.";
                }

                gameGrid.removeEventListener("mouseover", showPreMove);
                gameGrid.removeEventListener("mouseout", hidePreMove);

                return { isMoved, winner, tie };
            }
            switchPlayerTurn();
        }
        printNewRound();
        return { isMoved };
    };

    const showPreMove = (event) => {
        const square = event.target.closest(".grid-square");
        if (!square || square.classList.contains("taken")) return;
        if (!square.contains(event.relatedTarget)) {
            const preMoveSymbol = (activePlayer.mark === 1) ? crossOutline : circleOutline;
            square.appendChild(preMoveSymbol);
        }
    };

    const hidePreMove = (event) => {
        const square = event.target.closest(".grid-square");
        if (!square || square.classList.contains("taken")) return;
        if (!square.contains(event.relatedTarget)) {
            const preMoveSymbol = (activePlayer.mark === 1) ? crossOutline : circleOutline;
            if (square.contains(preMoveSymbol)) {
                square.removeChild(preMoveSymbol);
            }
        }
    };

    const gameGrid = document.querySelector("div.game-grid");
    gameGrid.addEventListener("mouseover", showPreMove);
    gameGrid.addEventListener("mouseout", hidePreMove);

    printNewRound();

    const cleanup = () => {
        gameGrid.removeEventListener("mouseover", showPreMove);
        gameGrid.removeEventListener("mouseout", hidePreMove);
    };

    return {
        playRound,
        getActivePlayer,
        cleanup
    };
};

const displayController = (function () {
    const gameGrid = document.querySelector("div.game-grid");
    const gameAlerts = document.querySelector("div.game-alerts");
    const gameAlertsP1 = gameAlerts.firstElementChild;
    const gameAlertsP2 = gameAlerts.lastElementChild;

    let game = null;
    let playMove = null;

    const startGame = function (event) {
        event.preventDefault();

        resetGame();

        if (playMove) gameGrid.removeEventListener("click", playMove);
        if (game && game.cleanup) game.cleanup();

        const cross = document.createElement("img");
        cross.src = "./cross.svg";
        const circle = document.createElement("img");
        circle.src = "./circle.svg";

        const playerForm = document.querySelector("form.player-form");
        const playerFormData = new FormData(playerForm);
        const player1 = playerFormData.get("player1-name") || "Player One";
        const player2 = playerFormData.get("player2-name") || "Player Two";

        game = ticTacToe(player1, player2);

        playMove = function (event) {
            const activePlayer = game.getActivePlayer();
            const square = event.target.closest(".grid-square");
            if (!square || !event.currentTarget.contains(square) || square.classList.contains("taken")) return;

            const index = parseInt(square.id) - 1;
            const roundStatus = game.playRound(index);

            if (roundStatus.isMoved) {
                square.classList.add("taken");
                square.innerHTML = "";
                const moveSymbol = (activePlayer.mark === 1) ? cross.cloneNode() : circle.cloneNode();
                square.appendChild(moveSymbol);

                if (roundStatus.tie || roundStatus.winner) {
                    gameGrid.removeEventListener("click", playMove);
                }
            }
        };

        gameGrid.addEventListener("click", playMove);
    };

    const resetGame = function () {
        gameAlertsP1.textContent = "";
        gameAlertsP2.textContent = "";

        const allSquares = document.querySelectorAll("div.grid-square");
        allSquares.forEach((square) => {
            square.classList.remove("taken");
            square.innerHTML = "";
        });
    };

    const startButton = document.querySelector("button.start-button");
    startButton.addEventListener("click", startGame);
})();