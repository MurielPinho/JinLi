const MyGameBoard = require('../game/MyGameBoard')

test('Initializing gameboard', () => {
    let gameboard = new MyGameBoard();
    expect(gameboard.gameState).toEqual({
        "board": {
            1: ["r", "empty", "empty", "empty", "empty", "empty", "y"],
            2: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            3: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            4: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            5: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            6: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            7: ["r", "empty", "empty", "empty", "empty", "empty", "y"]
        },
        "stones": [10, 10],
        "scores": [0, 0]
    })

})

test('Valid Drops for gamestate', () => {
    let gameboard = new MyGameBoard();
    let gameState = {
        "board": {
            1: ["stone", "empty", "empty", "empty", "empty", "empty", "stone"],
            2: ["empty", "empty", "empty", "y", "empty", "stone", "empty"],
            3: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            4: ["empty", "empty", "empty", "r", "empty", "empty", "empty"],
            5: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            6: ["empty", "stone", "r", "empty", "y", "empty", "empty"],
            7: ["empty", "empty", "empty", "empty", "empty", "empty", "stone"]
        },
        "stones": [7, 8],
        "scores": [0, 0]
    }
    expect(gameboard.validDrops(gameState)).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 5],
        [2, 7],
        [3, 1],
        [3, 2],
        [3, 3],
        [3, 4],
        [3, 5],
        [3, 6],
        [3, 7],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 5],
        [4, 6],
        [4, 7],
        [5, 1],
        [5, 2],
        [5, 3],
        [5, 4],
        [5, 5],
        [5, 6],
        [5, 7],
        [6, 1],
        [6, 4],
        [6, 6],
        [6, 7],
        [7, 1],
        [7, 2],
        [7, 3],
        [7, 4],
        [7, 5],
        [7, 6]
    ])
})

test('Move points simulator', () => {
    let gameboard = new MyGameBoard();
    let gameState = {
        "board": {
            1: ["stone", "empty", "empty", "empty", "empty", "empty", "stone"],
            2: ["empty", "empty", "empty", "y", "empty", "stone", "empty"],
            3: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            4: ["empty", "empty", "empty", "r", "empty", "empty", "empty"],
            5: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            6: ["empty", "stone", "r", "empty", "y", "empty", "empty"],
            7: ["empty", "empty", "empty", "empty", "empty", "empty", "stone"]
        },
        "stones": [7, 8],
        "scores": [0, 0]
    }
    let initialPosition = [6, 3];
    let possiblePositions = [
        [5, 4],
        [6, 4],
        [7, 4],
        [7, 3],
        [7, 2],
        [6, 1],
        [5, 2],
        [5, 3]
    ]
    let moveResults = []
    for (const currPosition of possiblePositions) {
        moveResults.push(gameboard.simulateMove([initialPosition, currPosition], gameState)[2])
    }
    expect(moveResults).toEqual([
        2, 1, 1, 0,
        0, 0, 0, 1
    ])

})
test('Best move evaluator', () => {
    let gameboard = new MyGameBoard();
    let gameState = {
        "board": {
            1: ["stone", "empty", "empty", "empty", "empty", "empty", "stone"],
            2: ["empty", "empty", "empty", "y", "empty", "stone", "empty"],
            3: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            4: ["empty", "empty", "empty", "r", "empty", "empty", "empty"],
            5: ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            6: ["empty", "stone", "r", "empty", "y", "empty", "empty"],
            7: ["empty", "empty", "empty", "empty", "empty", "empty", "stone"]
        },
        "stones": [7, 8],
        "scores": [0, 0]
    }
    let possibleMoves = [
        [
            [6, 3],
            [6, 4]
        ],
        [
            [6, 3],
            [7, 4]
        ],
        [
            [6, 3],
            [7, 3]
        ],
        [
            [6, 3],
            [7, 2]
        ],
        [
            [6, 3],
            [6, 1]
        ],
        [
            [6, 3],
            [5, 2]
        ],
        [
            [6, 3],
            [5, 3]
        ],
        [
            [6, 3],
            [5, 4]
        ],

    ]
    let bestMove = gameboard.bestMove(possibleMoves, gameState)[0];
    expect(bestMove).toEqual(possibleMoves[7])

})