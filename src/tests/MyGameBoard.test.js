const { TestWatcher } = require('jest');
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

test('Getting tiles by board position', () => {
    let gameboard = new MyGameBoard();
    expect(gameboard.getTileByPosition(1, 1)).toBe(gameboard.getTile('A1'));
    expect(gameboard.getTileByPosition(1, 7)).toBe(gameboard.getTile('A7'));
    expect(gameboard.getTileByPosition(4, 4)).toBe(gameboard.getTile('D4'));
    expect(gameboard.getTileByPosition(4, 1)).toBe(gameboard.getTile('D1'));
})