(function(exports) {

    /**
     * constants defining the dimensions of the game board
     */
    const BOARD_COLUMNS = 3;
    const BOARD_ROWS = 3;

    /**
     * the game states
     */
    const STATE_NEW = 'STATE_NEW';
    const STATE_WAITING_FOR_PLAYER_TWO = 'STATE_WAITING_FOR_PLAYER_TWO';
    const STATE_PLAYER_ONE_MOVE = 'PLAYER_ONE_MOVE';
    const STATE_PLAYER_TWO_MOVE = 'PLAYER_TWO_MOVE';
    const STATE_PLAYER_ONE_WINS = 'PLAYER_ONE_WINS';
    const STATE_PLAYER_TWO_WINS = 'PLAYER_TWO_WINS';
    const STATE_STALEMATE = 'STALEMATE';

    /**
     * Constructor
     */
    function GameEngine(gameId) {
        this._gameId = gameId;
        this._board = [[0, 0, 0],
                       [0, 0, 0],
                       [0, 0, 0]];
        this._state = STATE_NEW;
    }

    /**
     * Adds a player to the game
     *
     * Returns the ID of the player that has been added, if that player has
     * been added successfully
     *
     * Throws IllegalStateToAddPlayer if a player cannot be added
     */
    GameEngine.prototype.addPlayer = function() {
        if (this._state == STATE_NEW) {
            console.log(this._gameId + ': player 1 has joined');

            this._state = STATE_WAITING_FOR_PLAYER_TWO;

            return 1;
        } else if (this._state == STATE_WAITING_FOR_PLAYER_TWO) {
            console.log(this._gameId + ': player 2 has joined');

            this._state = STATE_PLAYER_ONE_MOVE;

            return 2;
        } else {
            throw 'IllegalStateToAddPlayer';
        }
    }

    /**
     * Executes a move for a player at a given cell
     *
     * Returns the ID of th player who has won the game if the game has been
     *   has been one, otherwise 0
     *
     * Throws IllegalStateToExecuteMove if the game is not in play
     * Throws IllegalPlayerId if a bad player id has somehow been used
     * Throws IllegalCellId if a bad cell has somehow been used
     * Throws IncorrectPlayerTurn if the wrong player is trying to execute a move
     * Throws CellAlreadyPlayed if the cell has already been used
     * Throws IllegalStateError if the game has somehow changed to an
     *   unexpected state
     */
    GameEngine.prototype.executeMove = function(playerId, cellId) {
        if (this._state != STATE_PLAYER_ONE_MOVE && this._state != STATE_PLAYER_TWO_MOVE) {
            throw 'IllegalStateToExecuteMove';
        }

        if (typeof playerId == 'undefined' || (playerId != 1 && playerId != 2)) { 
            throw 'IllegalPlayerId';
        }

        if (typeof cellId == 'undefined' || (cellId < 0 || cellId > 8)) {
            throw 'IllegalCellId';
        }

        if ((this._state == STATE_PLAYER_ONE_MOVE && playerId != 1) ||
            (this._state == STATE_PLAYER_TWO_MOVE && playerId != 2)) {
            throw 'IncorrectPlayerTurn';
        }

        // translate the cell id to board dimensions
        var row = Math.floor(cellId/BOARD_COLUMNS);
        var column = cellId % BOARD_ROWS;

        if (this._board[row][column] != 0) {
            throw 'CellAlreadyPlayed';
        }

        // execute the move
        console.log(this._gameId + ': executing move for ' + playerId + ' at cell ' + cellId);
        this._board[row][column] = playerId;

        // update state
        if (playerId == 1) {
            this._state = STATE_PLAYER_TWO_MOVE;
        } else if (playerId == 2) {
            this._state = STATE_PLAYER_ONE_MOVE;
        } else {
            throw 'IllegalStateError';
        }

        this._checkForWin();
    }

    /**
     * Checks board to determine if a player has won the game
     */
    GameEngine.prototype._checkForWin = function() {
        console.log(this._gameId + ': checking for win...');

        var winningPlayerId = 0;

        // check all the rows
        for (var rowId = 0; rowId < BOARD_ROWS; rowId++) {
            var playerId = this._checkRowForWin(rowId);

            if (playerId != 0) {
                winningPlayerId = playerId;
                break;
            }
        }

        if (winningPlayerId != 0) {
            this._setStateOnWin(winningPlayerId);
            return;
        }

        // check all the columns
        for (var columnId = 0; columnId < BOARD_COLUMNS; columnId++) {
            var playerId = this._checkColumnForWin(columnId);

            if (playerId != 0) {
                winningPlayerId = playerId;
                break;
            }
        }

        if (winningPlayerId != 0) {
            this._setStateOnWin(winningPlayerId);
            return;
        }

        // check both of the diagonals
        winningPlayerId = this._checkDiagonalsForWin();

        if (winningPlayerId != 0) {
            this._setStateOnWin(winningPlayerId);
            return;
        } else {
            var stalemate = this._checkForStalemate();

            if (!stalemate) {
                console.log(this._gameId + ': game has not been won');
            }
        }
    }

    GameEngine.prototype._setStateOnWin = function(playerId) {
        console.log(this._gameId + ': ' + playerId + ' has won the game');

        if (playerId == 1) {
            this._state = STATE_PLAYER_ONE_WINS;
        } else if (playerId == 2) {
            this._state = STATE_PLAYER_TWO_WINS;
        } else {
            throw 'IllegalStateError';
        }
    }

    GameEngine.prototype._checkForStalemate = function() {
        console.log(this._gameId + ': checking for stalemate...');

        var stalemate = true;

        for (var rowId = 0; rowId < BOARD_ROWS; rowId++) {
            for (var columnId = 0; columnId < BOARD_COLUMNS; columnId++) {
                if (this._board[rowId][columnId] == 0) {
                    stalemate = false;
                    break;
                }
            }

            if (!stalemate) {
                break;
            }
        }

        if (stalemate) {
            console.log(this._gameId + ': no one has won the game');
            this._state = STATE_STALEMATE;
        }

        return stalemate;
    }

    /**
     * Checks a particular row to determine if a player has won that row
     *
     * Returns the ID of th player who has won the row if the row has been
     *   has been one, otherwise 0
     */
    GameEngine.prototype._checkRowForWin = function(rowId) {
        console.log(this._gameId + ': checking row ' + rowId + ' for win...');

        var values = this._board[rowId];

        return this.__checkValuesForWin(values);
    }

    /**
     * Checks a particular column to determine if a player has won that column
     *
     * Returns the ID of th player who has won the column if the column has
     *   been has been one, otherwise 0
     */
    GameEngine.prototype._checkColumnForWin = function(columnId) {
        console.log(this._gameId + ': checking column ' + columnId + ' for win...');

        var values = [];

        for (var rowId = 0; rowId < BOARD_ROWS; rowId++) {
            values.push(this._board[rowId][columnId]);
        }

        return this.__checkValuesForWin(values);
    }

    /**
     * Checks both diagonals to determine if a player has won either
     *
     * Returns the ID of th player who has won the diagonal if the diagonal has
     *   been has been one, otherwise 0
     */
    GameEngine.prototype._checkDiagonalsForWin = function(startingCellId) {
        console.log(this._gameId + ': checking back diagonal for win');

        var values = [];

        values.push(this._board[0][0]);
        values.push(this._board[1][1]);
        values.push(this._board[2][2]);

        var playerId = this.__checkValuesForWin(values);

        if (playerId != 0) {
            return playerId;
        }

        console.log(this._gameId + ': checking forward diagonal for win');

        values = []

        values.push(this._board[0][2]);
        values.push(this._board[1][1]);
        values.push(this._board[2][0]);

        return this.__checkValuesForWin(values);
    }

    /**
     * Checks an array of values to verify if they are all the same and
     *   non-zero (i.e., unused, in the context of this game)
     *
     * Returns the common value in the array, but returns 0 quickly
     *   if any value is 0
     */
    GameEngine.prototype.__checkValuesForWin = function(values) {
        if (values[0] != 0) {
            if (values[0] == values[1] && values[1] == values[2]) {
                return values[0];
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * Returns the state of the game
     */
    GameEngine.prototype.state = function() {
        return this._state;
    }

    /**
     * Returns true if the game is over
     */
    GameEngine.prototype.isOver = function() {
        return this._state == STATE_PLAYER_ONE_WINS || this._state == STATE_PLAYER_TWO_WINS || this._state == STATE_STALEMATE;
    }

    exports.GameEngine = GameEngine;
    return exports;

})(module.exports);

