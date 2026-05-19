
// Create chess board
var board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDrop: onDrop
});

// Start Stockfish engine
var engine = new Worker("https://cdn.jsdelivr.net/npm/stockfish/stockfish.js");

// Handle move
function onDrop(source, target) {

    let move = source + target;

    // Send move to Stockfish
    engine.postMessage("position startpos moves " + move);
    engine.postMessage("go depth 10");

}

// Get best move from engine
engine.onmessage = function(event) {
    if (event.data.includes("bestmove")) {
        console.log("AI move:", event.data);
    }
};

engine.onmessage = function(event) {
    if (event.data.includes("bestmove")) {
        document.getElementById("aiMove").textContent =
            "Best move: " + event.data;
    }
};