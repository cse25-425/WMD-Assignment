let board;
let game = new Chess();
let puzzleList = [];
let engine;

fetch("js/puzzles.fen")
  .then((response) => response.text())
  .then((text) => {
    puzzleList = text.split("\n");
    console.log("Puzzles loaded:", puzzleList.length);
  })
  .catch((error) => console.error("Error loading puzzles:", error));

document.addEventListener("DOMContentLoaded", function () {
  board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme: "images/wikipedia/{piece}.png",
    onDrop: handleMove,
    onMouseoverSquare: showMoves,
    onMouseoutSquare: removeHighlights,
  });

  engine = new Worker("https://cdn.jsdelivr.net/npm/stockfish/stockfish.js");
 
  engine.postMessage("uci");
engine.postMessage("isready");
 
  engine.onmessage = function (event) {
    console.log("Engine says:", event.data); // For debugging
    if (event.data.includes("bestmove")) {
      let move = event.data.split(" ")[1];

      if (move === "(none)") return; // No moves available (game over)

      let from = move.substring(0, 2);
      let to = move.substring(2, 4);

      game.move({ from: from, to: to });
      board.position(game.fen());
    }
  };
});

function handleMove(source, target) {
  let move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) {
    return "snapback";
  }
  // After player's move, ask engine for response
  if (engine) {
    engine.postMessage("position fen " + game.fen());
    engine.postMessage("go depth 10");
  }
}

function showMoves(square) {
  let moves = game.moves({ square: square, verbose: true });

  if (moves.length === 0) return;

  let squares = moves.map((m) => m.to);
  squares.push(square);

  highlightSquares(moves, squares);
}

function highlightSquares(moves, source) {
  // highlight selected square
  let sourceEl = document.querySelector(".square-" + source);
  if (sourceEl) {
    sourceEl.classList.add("highlight-selected");
  }

  // highlight moves
  moves.forEach((move) => {
    let squareEl = document.querySelector(".square-" + move.to);
    if (!squareEl) return;

    // check if capture
    if (move.captured) {
      squareEl.classList.add("highlight-capture");
    } else {
      squareEl.classList.add("highlight-move");
    }
  });
}

function removeHighlights() {
  document
    .querySelectorAll(
      ".highlight-move, .highlight-capture, .highlight-selected",
    )
    .forEach((el) => {
      el.classList.remove(
        "highlight-move",
        "highlight-capture",
        "highlight-selected",
      );
    });
}

function startEngine() {
  game.reset();
  board.position("start");

  document.getElementById("status").textContent =
    "Engine started. Play your first move.";
}
function startTraining() {
  // Example puzzle position (basic checkmate idea)
  let puzzleFEN =
    "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";

  game.load(puzzleFEN);
  board.position(puzzleFEN);

  alert("Puzzle loaded! Find the best move.");
}
function loadPuzzle() {
  if (puzzleList.length === 0) {
    alert("Puzzles still loading...");
    return;
  }

  // Pick random puzzle
  let randomPuzzle = puzzleList[Math.floor(Math.random() * puzzleList.length)];

  // Clean the line (remove extra junk if needed)
  randomPuzzle = randomPuzzle.trim();

  //  Load onto board
  game.load(randomPuzzle);
  board.position(randomPuzzle);

  alert("Puzzle loaded!");
}
function joinClub(event) {
    event.preventDefault();

    document.getElementById("joinMessage").textContent =
        "You have successfully joined the club!";
}