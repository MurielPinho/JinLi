const MyGameBoard = require('../game/MyGameBoard')
test('initialing gameboard', () => {
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