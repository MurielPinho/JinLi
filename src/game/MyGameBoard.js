/*
* Stores the set of tiles that composes the entire game board
Methods:
	* Create a gameboard instance
	* Add piece to a given tile
	* Remove piece from a given tile
	* Get piece on a given tile
	* Get tile given a piece
	* Get tile by board coordinate system (A..H;1..8 on chess or 0..7;0..7)
	* Move piece (piece, starting tile, destination tile)
	* Display the gameboard (render). Calls display of tiles and of pieces.
*/
class MyGameBoard {
    constructor() {
        this.tiles = [];
        this.pieces = [];
        this.red_stones = [];
        this.placed_red_stones = [];
        this.yellow_stones = [];
        this.placed_yellow_stones = [];
        this.gameState = {
            "board": {
                7: ["r", "empty", "empty", "empty", "empty", "empty", "y"],
                6: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                5: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                4: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                3: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                2: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                1: ["r", "empty", "empty", "empty", "empty", "empty", "y"]
            },
            "stones": [10, 10],
            "scores": [0, 0]
        };

    }

    redefineStones(red_stones, yellow_stones) {
        for (let i = 0; i < this.red_stones.length; i++) {
            this.red_stones[i] = red_stones[i];
        }
        for (let i = 0; i < this.placed_red_stones.length; i++) {
            red_stones[this.red_stones.length + i].tile = this.placed_red_stones[i].tile;
            this.placed_red_stones[i] = red_stones[this.red_stones.length + i];
        }

        for (let i = 0; i < this.yellow_stones.length; i++) {
            this.yellow_stones[i] = yellow_stones[i];
        }
        for (let i = 0; i < this.placed_yellow_stones.length; i++) {
            yellow_stones[this.yellow_stones.length + i].tile = this.placed_yellow_stones[i].tile;
            this.placed_yellow_stones[i] = yellow_stones[this.yellow_stones.length + i];
        }


    }

    redefinePieces(pieces) {
        for (let index in this.pieces) {
            let id = this.pieces[index].tile.id;

            this.tiles[id].piece = pieces[index];
            pieces[index].tile = this.tiles[id];
            pieces[index].angle = this.pieces[index].angle;
        }
        this.pieces = pieces;
    }

    resetPosition() {
        this.red_stones = [...this.red_stones, ...this.placed_red_stones];
        this.placed_red_stones = [];

        for (let index in this.red_stones) {
            this.red_stones[index].tile = null;
        }

        this.yellow_stones = [...this.yellow_stones, ...this.placed_yellow_stones];
        this.placed_yellow_stones = [];

        for (let index in this.yellow_stones) {
            this.yellow_stones[index].tile = null;
        }

        for (let piece of this.pieces) {
            this.tiles[piece.originalTile].piece = piece
            piece.tile = this.tiles[piece.originalTile];
        }
    }

    dropStone(currPlayer, tile) {
        this.gameState["board"][tile.line][tile.column - 1] = "stone"
        if (currPlayer == 'r') {
            let stone = this.red_stones.pop();
            this.placed_red_stones.push(stone);
            stone.tile = tile;
            stone.animator = null;
            this.gameState["stones"][0]--;
            tile.stone = stone;
        } else {
            let stone = this.yellow_stones.pop();
            this.placed_yellow_stones.push(stone);
            stone.tile = tile;
            stone.animator = null;
            this.gameState["stones"][1]--;
            tile.stone = stone;

        }
    }

    isShowingSelected() {
        for (let id in this.tiles) {
            if (this.tiles[id].selected)
                return true;
        }
        return false;
    }

    removeStoneAnimator(currPlayer) {
        if (currPlayer == 'r') {
            this.red_stones[this.red_stones.length - 1].animator = null;
        } else {
            this.yellow_stones[this.yellow_stones.length - 1].animator = null;
        }
    }

    setStoneAnimator(scene, initialMoment, currPlayer, dropTile) {

        let start = {
            translation: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };

        let stone_position = this.getStonePosition(currPlayer);

        let middle = {
            translation: {
                x: (stone_position[0] + ((dropTile.line - 1) * 3.85)) / 2,
                y: 30,
                z: (stone_position[2] - ((dropTile.column - 1) * 3.85)) / 2
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };


        let end = {
            translation: {
                x: stone_position[0] + ((dropTile.line - 1) * 3.85),
                y: 0,
                z: stone_position[2] - ((dropTile.column - 1) * 3.85)
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };

        let frames = [];
        frames[initialMoment] = start;
        frames[initialMoment + 0.3] = middle;
        frames[initialMoment + 0.6] = end;

        let animator = new KeyframeAnimator(frames, scene);

        if (currPlayer == 'r') {
            this.red_stones[this.red_stones.length - 1].animator = animator;
        } else {
            this.yellow_stones[this.yellow_stones.length - 1].animator = animator;
        }
    }

    animateStone(currPlayer, time) {
        if (currPlayer == 'r') {
            this.red_stones[this.red_stones.length - 1].animator.update(time);
            return !this.red_stones[this.red_stones.length - 1].animator.ended;

        }
        this.yellow_stones[this.yellow_stones.length - 1].animator.update(time);

        return !this.yellow_stones[this.yellow_stones.length - 1].animator.ended;
    }

    getStonePosition(currPlayer) {
        if (currPlayer == 'r')
            return [-(-4.9 + (this.red_stones.length) * 3), 0, -6];

        return [-(-4.9 + (this.yellow_stones.length) * 3), 0, 29];
    }

    getTileByPosition(line, column) {
        let id = String.fromCharCode(64 + line) + column
        return this.tiles[id];
    }

    getTile(ID) {
        return this.tiles[ID];
    }

    setTiles(tiles) {

        for (let id in tiles) {
            tiles[id].gameboard = this;
        }
        this.tiles = tiles;
    }

    setPieces(pieces) {
        this.pieces = pieces;
        for (let piece of this.pieces) {
            if (this.tiles[piece.tile]) {
                this.tiles[piece.tile].piece = piece
                piece.tile = this.tiles[piece.tile];
            }
        }
    }

    selectTiles(positions) {
        for (let position of positions) {
            let id = String.fromCharCode(64 + position[0]) + position[1];
            this.tiles[id].select();
        }

    }

    increaseScore(toTile, currPlayer) {
        let result = 0;
        for (let lineIndex = -1; lineIndex < 2; lineIndex++) {
            for (let columnIndex = -1; columnIndex < 2; columnIndex++) {
                let tile = this.getTileByPosition(toTile.line + lineIndex, toTile.column + columnIndex);
                if (tile && tile.piece && lineIndex + columnIndex != 0) {
                    result++;
                }
            }
        }
        if (currPlayer === 'r') {
            this.gameState['scores'][0] += result;
        } else {
            this.gameState['scores'][1] += result;
        }
    }


    movePiece(fromTile, toTile, currPlayer) {
        let board = this.gameState["board"]
        let piece = board[fromTile.line][fromTile.column - 1]
        board[toTile.line][toTile.column - 1] = piece;
        board[fromTile.line][fromTile.column - 1] = "empty"
        fromTile.piece.tile = toTile;
        toTile.piece = fromTile.piece;
        fromTile.piece = null;
        this.increaseScore(toTile, currPlayer);

    }

    movePieceBot(fromTile, toTile, currPlayer) {
        let board = this.gameState["board"]
        let piece = board[fromTile.line][fromTile.column - 1]
        board[toTile.line][toTile.column - 1] = piece;
        board[fromTile.line][fromTile.column - 1] = "empty"
        this.increaseScore(toTile, currPlayer);

    }

    removeStone(scene, currPlayer, time) {
        if (currPlayer == 'y') {

            let stone = this.placed_yellow_stones.pop();
            stone.tile = null;
            this.yellow_stones.push(stone);
        } else {
            let stone = this.placed_red_stones.pop();
            stone.tile = null;
            this.red_stones.push(stone);
        }

        this.removeStoneAnimator(currPlayer);
        this.animateStone(currPlayer, time);
    }

    unselectAllTiles() {
        for (let id in this.tiles) {
            this.tiles[id].select(false);
        }
    }

    getTile(stringPosition) {
        if (this.tiles[stringPosition] != -1)
            return this.tiles[stringPosition];
        return false;
    }

    getScore() {
        return this.gameState['scores'];
    }

    gameEnded() {
        if (this.gameState['scores'][0] >= 10) {
            return 1;
        } else if (this.gameState['scores'][1] >= 10) {
            return 2;
        }
        return 0;
    }

    moveType(fromTile, toTile) {
        let maxTiles = Math.max(Math.abs(fromTile.line - toTile.line), Math.abs(fromTile.column - toTile.column))
        return maxTiles === 2 ? "jump" : "walk"
    }

    validMoves(pieceLine, pieceColumn) {
        var adjacent = [];
        for (let lineIndex = -1; lineIndex < 2; lineIndex++) {
            for (let columnIndex = -1; columnIndex < 2; columnIndex++) {
                let tile = this.getTileByPosition(pieceLine + lineIndex, pieceColumn + columnIndex);
                if (tile) {
                    if (!tile.piece && !tile.stone) {
                        adjacent.push([pieceLine + lineIndex, pieceColumn + columnIndex])
                    } else if (tile.stone) {
                        let nextTile = this.getTileByPosition(pieceLine + lineIndex * 2, pieceColumn + columnIndex * 2);
                        if (nextTile && !nextTile.piece && !nextTile.stone)
                            adjacent.push([pieceLine + lineIndex * 2, pieceColumn + columnIndex * 2])
                    }
                }
            }
        }
        return adjacent;
    }

    validDrops(gameState) {
        let emptyTiles = [];
        for (let line = 1; line <= 7; line++) {
            for (let column = 1; column <= 7; column++) {
                if (gameState["board"][line][column - 1] === "empty") emptyTiles.push([line, column])
            }
        }
        return emptyTiles;
    }

    getBotMove(difficulty, currPlayer) {
        let moves = [],
            pieces;
        pieces = this.pieces.filter(piece => (piece.color === currPlayer))
        for (const piece of pieces) {
            this.validMoves(piece.tile.line, piece.tile.column).forEach(move => moves.push([
                [piece.tile.line, piece.tile.column], move
            ]));
        }
        let choosenMove, points, choosenDrop, tmpMove, tmpDrop, tmpPoints, tmp, dasd
        if (!difficulty) {
            points = 0;
            moves.forEach((currentMove) => {
                [tmpMove, tmpDrop, tmpPoints, tmp] = this.simulateMove(currentMove)
                if (tmpPoints >= points) {
                    choosenMove = tmpMove;
                    choosenDrop = tmpDrop;
                    points = tmpPoints;
                    dasd = tmp
                }
            });
        } else {
            choosenMove = moves[Math.floor(Math.random() * moves.length)];
            [choosenMove, choosenDrop, points] = this.simulateMove(choosenMove)
        }
        let maxTiles = Math.max(Math.abs(choosenMove[0][0] - choosenMove[1][0]), Math.abs(choosenMove[0][1] - choosenMove[1][1]))
        let moveType = (maxTiles < 2) ? "walk" : "jump";
        return [moveType, choosenMove, choosenDrop]
    }

    simulateMove(move) {
        let tmpGameState = JSON.parse(JSON.stringify(this.gameState));
        tmpGameState["board"][move[1][0]][move[1][1] - 1] = tmpGameState["board"][move[0][0]][move[0][1] - 1];
        tmpGameState["board"][move[0][0]][move[0][1] - 1] = "empty";
        let points = 0;
        let fromLine = move[1][0]
        let fromColumn = move[1][1]
        let toLine = move[0][0]
        let toColumn = move[0][1]
        for (let columnIndex = -1; columnIndex < 2; columnIndex++) {
            for (let lineIndex = -1; lineIndex < 2; lineIndex++) {
                if (lineIndex + fromLine <= 0 || lineIndex + fromLine >= 8 || columnIndex + fromColumn <= 0 || columnIndex + fromColumn >= 8 || (lineIndex === 0 && columnIndex == 0) || (fromLine === toLine && toColumn === fromColumn)) continue;
                let tile = tmpGameState["board"][lineIndex + fromLine][columnIndex + fromColumn - 1];
                if (tile == 'r' || tile == 'y') {
                    points++
                }
            }

        }
        let drops = this.validDrops(tmpGameState);
        let choosenDrop = drops[Math.floor(Math.random() * drops.length)]
        return [move, choosenDrop, points, tmpGameState]

    }
}