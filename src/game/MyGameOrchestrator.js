/*
Manages the entire game:
    • Load of new scenes
    • Manage gameplay (game states)
    • Manages undo•Manages movie play
    • Manage object selection
*/

class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.animator = new MyAnimator();
        this.gameboard = new MyGameBoard();
        this.gameSequence = new MyGameSequence(this.gameboard);

        this.theme = new MySceneGraph('lake.xml', scene);

        this.displayMenu = false;
        this.initGame = false;
        this.level = 1;
        this.mode = 'Player vs. Player';
        this.ambient = 1;
        this.menu = new Menu(this, scene, this.level, this.mode);
        this.score = new ScoreClock(this.scene, this.level);
        this.gameMove;
        this.winningScore = 10;
        this.currentCamera = 'Overview';

        this.redPlayerMode = 'Human';
        this.yellowPlayerMode = 'Human';

        this.state = 'start';
        this.currPlayer = 'r';
        this.currAction;

        this.firstLoad = true;
    }

    onGraphLoaded() {
        if ((this.theme.filename == 'mountain.xml' || this.theme.filename == 'lake.xml') && this.firstLoad) {
            this.state = 'start';
            this.gameboard.setTiles(this.theme.tiles);
            this.gameboard.setPieces(this.theme.pieces);
            this.score.setLevel(this.level);
            this.gameboard.red_stones = this.theme.red_stones;
            this.gameboard.yellow_stones = this.theme.yellow_stones;
            this.gameSequence.moveStack = [];
            this.gameStateStack = [];
            this.firstLoad = false;
        } else if ((this.theme.filename == 'mountain.xml' || this.theme.filename == 'lake.xml') && !this.firstLoad) {
            this.gameboard.setTiles(this.theme.tiles);
            this.gameboard.redefinePieces(this.theme.pieces);
            this.gameboard.redefineStones(this.theme.red_stones, this.theme.yellow_stones);
        }

    }

    changeAmbient() {
        if (this.ambient != this.menu.ambient) {
            if (this.menu.ambient == 1) {
                this.theme = new MySceneGraph('lake.xml', this.scene);
                this.ambient = 1;
            } else if (this.menu.ambient == 2) {
                this.theme = new MySceneGraph('mountain.xml', this.scene);
                this.ambient = 2;
            } else {
                this.theme = new MySceneGraph('lake.xml', this.scene);
                this.ambient = 1;
            }
        }

    }

    start() {
        this.initialTime = this.lastTime;
        this.initGame = true;
        this.displayMenu = false;
        this.scene.selectedView = this.theme.defaultViewId;
        this.scene.changeCamera();
        this.scene.interface.setInterface();
    }

    setMode(level, game_mode) {


        if (game_mode == 'Player vs. Player') {
            this.redPlayerMode = 'Human';
            this.yellowPlayerMode = 'Human';
            this.level = level;
            this.mode = 'Player vs Player';
        } else if (game_mode == 'Player vs. CPU') {
            this.mode = 'Player vs CPU';
            this.level = level;
            if (this.level == 1) {
                this.redPlayerMode = 'Human';
                this.yellowPlayerMode = 'Easy';
            } else {
                this.redPlayerMode = 'Human';
                this.yellowPlayerMode = 'Hard';
            }

        } else if (game_mode == 'CPU vs. CPU') {
            this.mode = 'CPU vs CPU';
            this.level = level;
            if (this.level == 1) {
                this.redPlayerMode = 'Easy';
                this.yellowPlayerMode = 'Easy';
            } else {
                this.redPlayerMode = 'Hard';
                this.yellowPlayerMode = 'Hard';
            }
        } else {
            this.redPlayerMode = 'Human';
            this.yellowPlayerMode = 'Human';
            this.level = 1;
            this.mode = 'Player vs Player';
        }

    }

    update(time) {

        this.initialTime = this.initialTime || time;
        this.lastTime = this.lastTime || 0;
        this.deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.secsFromStart = (time - this.initialTime) / 1000;

        switch (this.state) {
            case 'start':
                this.displayMenu = true;
                this.gameStateStack.push(this.gameboard.gameState);
                this.state = 'waiting to start';
                break;

            case 'waiting to start':
                this.state = this.initGame ? 'waiting select piece' : 'waiting to start';
                break;

            case 'waiting select piece':
                {
                    let playerMode = this.currPlayer == 'r' ? this.redPlayerMode : this.yellowPlayerMode;
                    if (playerMode != 'Human') {
                        this.state = 'waiting move bot results';
                    }
                    break;
                }

            case 'waiting move tile':

                break;

            case 'waiting move result':
                this.fromTile.piece.setAnimator(this.toTile, this.fromTile, this.secsFromStart);
                this.state = 'animating moving';
                break;

            case 'animating moving':
                if (!this.fromTile.piece.animate(this.secsFromStart))
                    this.state = 'move piece';
                break;

            case 'move piece':
                this.fromTile.piece.animator = null;
                let gameState = new MyGameState(this.gameboard.gameState);
                this.gameMove = new MyGameMove(this.scene, this.fromTile.piece, this.fromTile, this.toTile);
                this.gameSequence.addMove(this.gameMove);
                this.gameboard.movePiece(this.fromTile, this.toTile, this.currPlayer);
                this.currAction = this.gameboard.moveType(this.fromTile, this.toTile);
                this.gameStateStack.push(gameState);
                this.score.updateScore(this.gameboard.getScore());
                this.state = 'waiting move tile';

                if (this.currAction == 'walk' && gameState.getStones(this.currPlayer) > 0) {
                    this.gameboard.selectTiles(this.gameboard.validDrops(this.gameboard.gameState));
                    this.state = 'waiting drop tile click';
                } else {
                    this.state = 'set camera to rotate';
                }

                if (this.gameboard.gameEnded()) {
                    this.state = 'game over';

                }
                break;

            case 'waiting drop tile click':
                if (!this.gameboard.isShowingSelected())
                    this.gameboard.selectTiles(this.prolog.parsedResult);
                break;

            case 'waiting drop stone result':
                this.gameboard.setStoneAnimator(this.scene, this.secsFromStart, this.currPlayer, this.dropTile);
                this.state = 'animating drop';
                break;

            case 'animating drop':
                if (!this.gameboard.animateStone(this.currPlayer, this.secsFromStart))
                    this.state = 'drop stone';
                break;

            case 'drop stone':
                let stone;
                if (this.currPlayer == 'r') {
                    stone = this.gameboard.red_stones[this.gameboard.red_stones.length - 1]
                } else {
                    stone = this.gameboard.yellow_stones[this.gameboard.yellow_stones.length - 1]
                }
                this.gameMove = new MyGameMove(this.scene, stone, null, this.dropTile);
                this.gameSequence.addMove(this.gameMove);
                this.gameboard.dropStone(this.currPlayer, this.dropTile);
                this.gameStateStack.push(new MyGameState(this.gameboard.gameState));

                this.state = 'set camera to rotate';
                break;

            case 'set camera to rotate':
                this.rotationTime = 0;
                this.Camerarotation = 0;
                this.state = 'next turn';
                if (this.currentCamera == 'Main Camera') {
                    this.state = 'rotating camera';
                }
                break;

            case 'rotating camera':
                let endRotationTime = 2;
                if (this.rotationTime < endRotationTime) {
                    this.Camerarotation += Math.PI / endRotationTime * this.deltaTime / 1000;
                    this.scene.camera.orbit([0, 1, 0], Math.PI / endRotationTime * this.deltaTime / 1000);
                    this.rotationTime += this.deltaTime / 1000;
                } else {
                    this.scene.camera.orbit([0, 1, 0], Math.PI - this.Camerarotation);
                    this.state = 'next turn';
                }
                break;
            case 'undo move':
                let nGameState = this.gameStateStack.length;
                this.gameMove = this.gameSequence.undoMove();
                this.gameStateStack.pop();
                this.gameboard.gameState = this.gameStateStack[nGameState - 2];
                if (this.gameMove.movedPiece instanceof MyPiece) {
                    let [angle, _angMultX] = this.gameMove.movedPiece.calculateAngle(this.gameMove.originTile, this.gameMove.DestinationTile);
                    this.gameMove.movedPiece.angle = angle;
                    this.gameboard.movePiece(this.gameMove.DestinationTile, this.gameMove.originTile);
                    this.gameboard.unselectAllTiles();
                    this.state = 'waiting select piece';
                    let playerMode = this.currPlayer == 'r' ? this.redPlayerMode : this.yellowPlayerMode;
                    if (playerMode != 'Human') {
                        this.state = 'undo move';
                    }
                } else {
                    this.currPlayer = this.currPlayer == 'r' ? 'y' : 'r';
                    this.scene.camera.orbit([0, 1, 0], Math.PI);
                    this.gameboard.removeStone(this.scene, this.currPlayer, this.secsFromStart);
                    let playerMode = this.currPlayer == 'r' ? this.redPlayerMode : this.yellowPlayerMode;

                    if (playerMode != 'Human') {
                        this.state = 'undo move';
                    } else {
                        this.gameboard.validDrops(this.gameboard.gameState);
                        this.state = 'waiting drop tiles result';
                    }

                }
                let score = this.gameboard.getScore();
                if (score != null)
                    this.score.updateScore(this.gameboard.getScore());
                break;
            case 'next turn':
                this.currPlayer = this.currPlayer == 'r' ? 'y' : 'r';
                let playerMode = this.currPlayer == 'r' ? this.redPlayerMode : this.yellowPlayerMode;
                if (playerMode == 'Human')
                    this.state = 'waiting select piece';
                else {
                    this.state = 'waiting move bot results';
                }
                break;

            case 'waiting move bot results':

                let botMove = this.gameboard.getBotMove(this.level, this.currPlayer);
                let gameStateBot = new MyGameState(this.gameboard.gameState);
                this.gameStateStack.push(gameStateBot);
                let botPieceMove = botMove[1];
                this.fromTile = this.gameboard.getTileByPosition(botPieceMove[0][0], botPieceMove[0][1]);
                this.toTile = this.gameboard.getTileByPosition(botPieceMove[1][0], botPieceMove[1][1]);
                this.gameMove = new MyGameMove(this.scene, this.fromTile.piece, this.fromTile, this.toTile);
                this.gameSequence.addMove(this.gameMove);
                this.gameboard.movePieceBot(this.fromTile, this.toTile);
                this.currAction = botMove[0];
                this.score.updateScore(this.gameboard.getScore());
                let dropPosition = botMove[2];
                this.dropTile = null
                if (this.currAction === 'walk') {
                    if ((this.currPlayer == 'r' && this.gameboard.red_stones.length) || (this.currPlayer == 'y' && this.gameboard.yellow_stones.length)) {

                        this.dropTile = this.gameboard.getTileByPosition(dropPosition[0], dropPosition[1])
                    }
                }
                let stoneBot
                if (this.dropTile != null) {
                    if (this.currPlayer == 'r') {
                        if (this.gameboard.red_stones.length) {
                            stoneBot = this.gameboard.red_stones[this.gameboard.red_stones.length - 1]
                        }
                    } else {
                        if (this.gameboard.yellow_stones.length) {
                            stoneBot = this.gameboard.yellow_stones[this.gameboard.yellow_stones.length - 1]
                        }
                    }
                    this.gameMove = new MyGameMove(this.scene, stoneBot, null, this.dropTile);
                    this.gameSequence.addMove(this.gameMove);
                    this.gameStateStack.push(gameStateBot);

                }

                this.fromTile.piece.setAnimator(this.toTile, this.fromTile, this.secsFromStart);


                this.state = 'animating bot move';
                if (this.gameboard.gameEnded()) {
                    this.state = 'game over';

                }

                break;

            case 'animating bot move':
                if (!this.fromTile.piece.animate(this.secsFromStart)) {
                    this.fromTile.piece.animator = null;
                    this.gameboard.increaseScoreBot(this.toTile, this.currPlayer);
                    let scoreBot = this.gameboard.getScore();
                    if (scoreBot != null)
                        this.score.updateScore(this.gameboard.getScore());
                    this.fromTile.piece.tile = this.toTile;
                    this.toTile.piece = this.fromTile.piece;
                    this.fromTile.piece = null;
                    if (this.dropTile == null) {
                        this.state = 'set camera to rotate';
                    } else {
                        this.gameboard.setStoneAnimator(this.scene, this.secsFromStart, this.currPlayer, this.dropTile);
                        this.state = 'animating bot drop';
                    }
                }
                break;

            case 'animating bot drop':
                if (!this.gameboard.animateStone(this.currPlayer, this.secsFromStart)) {
                    this.gameboard.dropStone(this.currPlayer, this.dropTile);
                    this.state = 'set camera to rotate';
                }
                break;

            case 'showing moves':
                if (!this.gameSequence.showAnimation(this.secsFromStart)) {
                    this.state = this.lastState;
                }
                break;

            case 'game over':
                alert((this.gameboard.gameEnded() == 1 ? 'Red Player' : 'Yellow Player') + ' won!!');
                this.state = 'reload';
                break;

            case 'reload':
                window.location.reload();
                this.state = 'reloading';
                break;

            case 'reloading':
                sleep(100)
                break;

        }

        if (!this.displayMenu) {
            this.score.updateTime(this.deltaTime, this.currPlayer);
        }
        this.theme.update(time);
        this.checkKeys();
    }



    display() {
        this.theme.displayScene();
        this.score.display();
        if (this.displayMenu) {
            this.menu.display();
        } else {
            this.managePick(this.scene.pickMode, this.scene.pickResults);
        }
    }

    checkKeys() {
        if (this.scene.gui.isKeyPressed("Escape") || this.scene.gui.isKeyPressed("KeyM")) {
            if (this.state != 'rotating camera')
                this.menu.toggleMenu();
        }
    }

    managePick(mode, results) {
        if (mode == false)
            if (results != null && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var obj = results[i][0];
                    if (obj) {
                        var uniqueId = results[i][1]
                        this.onObjectSelected(obj, uniqueId);
                    }
                }
                results.splice(0, results.length);
            }
    }


    onObjectSelected(obj, id) {
        if (obj instanceof MyPiece) {
            switch (this.state) {
                case 'waiting select piece':
                    if (obj.color == this.currPlayer) {
                        let tiles = this.gameboard.validMoves(obj.tile.line, obj.tile.column);
                        this.gameboard.unselectAllTiles();

                        this.gameboard.selectTiles(tiles);
                        this.state = 'waiting move tile';
                        this.fromTile = obj.tile;
                    }
                    break;

                case 'waiting move tile':
                    this.gameboard.unselectAllTiles();
                    this.state = 'waiting select piece';
                    break;
            }

        } else if (obj instanceof MyTile) {
            switch (this.state) {
                case 'waiting select piece':
                    if (obj.hasPlayer(this.currPlayer)) {
                        let tiles = this.gameboard.validMoves(obj.line, obj.column);
                        this.gameboard.unselectAllTiles();
                        this.gameboard.selectTiles(tiles);
                        this.state = 'waiting move tile';
                        this.fromTile = obj;
                    }
                    break;

                case 'waiting move tile':
                    if (obj.selected) {
                        this.toTile = obj;
                        this.gameboard.unselectAllTiles();
                        this.currAction = 'walk'
                        this.state = 'waiting move result';
                    } else {
                        this.gameboard.unselectAllTiles();
                        this.state = 'waiting select piece';
                    }
                    break;

                case 'waiting drop tile click':
                    if (obj.selected) {
                        this.dropTile = obj;
                        this.gameboard.unselectAllTiles();
                        this.state = 'waiting drop stone result';
                    }
                    break;
            }
        } else {
            // console.log("Picked object of type: " + obj.constructor.name + ", with pick id " + id);
            // console.log(obj);
        }
    }



}