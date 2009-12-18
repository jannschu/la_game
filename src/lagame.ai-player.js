/*
 * This file is part of La Game.
 * Copyright 2009 Shahriar Heidrich and Jannik Schürg
 * 
 * La Game is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * La Game is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with La Game.  If not, see <http://www.gnu.org/licenses/>. 
 */

function LaGameAiPlayer(playerNumber, gui, logic) {
  
  this.playerNumber = playerNumber; // public
  this.gui = gui; // public
  this.logic = logic; // public
  
  this.endMoveCallback = null;
  
  this.bestMove = null;
}

LaGameAiPlayer.prototype.startMoving = function(l, neutral, callback) {
  if (this.gui.getCurrentPlayerForLabel() != this.playerNumber) 
    this.gui.setPlayerLabel("Spieler " + (this.playerNumber + 1) + " (KI) ist dran",
      this.playerNumber);
  this.movesLeft = false;
  var player = this;
  setTimeout(function() {
    if (l && !neutral) {
      player.bestMove = player.getBestMove();
      player.gui.setMovesLeft(player.movesLeft);
    }
    
    player.endMoveCallback = callback;
    
    var move;
    var moveField = player.logic.field.copy();
    if (l) {
      move = player.bestMove.lPieces[player.playerNumber];
      moveField.lPieces[player.playerNumber] = move;
    }
    else {
      var i = player.bestMove.nPieces[0].isSame(player.logic.field.nPieces[0]) ? 1 : 0;
      move = player.bestMove.nPieces[i];
      if (move.isSame(moveField.nPieces[i])) {
        player.callEndCallback(move);
        return;
      }
      moveField.nPieces[i] = move;
    }
    player.gui.animateMove(player.logic.field, moveField, function() {
      player.callEndCallback(move);
    });
  }, 0);
}

LaGameAiPlayer.prototype.stopMoving = function() {};

LaGameAiPlayer.prototype.getBestMove = function() {
  var startField = this.logic.field.copy();
  
  var getMyMoves = this.getMovesFor(startField, this.playerNumber);
  var oppPlayer = makeOpposite(this.playerNumber);
  
  var myMoves;
  var last;
  var notLoseMoves = [];
  var bestWinMove, bestLoseMove, winMoveCount = Infinity, loseMoveCount = 0, c;
  while(myMoves = getMyMoves()) {
    var myMove;
    for (var i = 0; i < myMoves.length; ++i) { myMove = myMoves[i];
      last = myMove;
      if (myMove.getEmptyLs(oppPlayer).length == 0) return myMove;
      if ((c = this.isLosingPosition(myMove, oppPlayer)) && c < winMoveCount) {
        winMoveCount = c;
        bestWinMove = myMove;
      }
      var getOppPlayerMoves = this.getMovesFor(myMove, oppPlayer);
      var oppMoves, oppMove, possibleMoves;
      var lost = false;
      while (oppMoves = getOppPlayerMoves()) {
        for (var j = 0; j < oppMoves.length; ++j) { oppMove = oppMoves[j]; c = false;
          possibleMoves = oppMove.getEmptyLs(this.playerNumber).length
          if (possibleMoves == 0 || (c = this.isLosingPosition(oppMove))) {
            if (c && c > loseMoveCount) {
              loseMoveCount = c;
              bestLoseMove = myMove;
            }
            lost = true; break;
          }
        }
        if (lost) break;
      }
      if (!lost) notLoseMoves.push(myMove);
    }
  }
  if (!last) return startField; // already lost :-(
  if (bestWinMove) {
    this.movesLeft = winMoveCount;
    return bestWinMove;
  } else if (notLoseMoves.length > 0) {
    var min = Infinity;
    var move, c;
    for (var i = 0; i < notLoseMoves.length; ++i) {
      c = notLoseMoves[i].getEmptyLs(oppPlayer).length;
      if (c < min || (c == min && Math.random() < 0.6)) {
        min = c;
        move = notLoseMoves[i];
      }
      return move;
    }
  } else return (bestLoseMove ? bestLoseMove : last);
};

LaGameAiPlayer.losingPositions = [
  [12621112, 12621179, 14733758], [12621180, 12621182, 12871751],
  [12621116, 12621118, 12609591, 12621115, 12621111],
  [12621246, 12902766, 12902767]
]

LaGameAiPlayer.prototype.isLosingPosition = function(field, forPlayer) {
  if (forPlayer === undefined) forPlayer = this.playerNumber;
  var fieldHash = field.hashCode(forPlayer);
  for (var i = 0; i < LaGameAiPlayer.losingPositions.length; ++i) {
    for (var j = 0; j < LaGameAiPlayer.losingPositions[i].length; ++j) {
      if (fieldHash == LaGameAiPlayer.losingPositions[i][j]) return i + 1;
    }
  }
  return false;
};

LaGameAiPlayer.prototype.getMovesFor = function(field, player) {
  var currentPlayer = player;
  var emptyLs = field.getEmptyLs(currentPlayer);
  var current = 0;
  var end = emptyLs.length;
  return function() {
    if (current == end) return false;
    var moves = []
    var lField = field.copy();
    lField.lPieces[currentPlayer] = emptyLs[current];
    moves.push(lField)
    var emptyNs = lField.getEmptyNs();
    var retField;
    for (var j = 0; j < emptyNs.length; ++j) {
      retField = lField.copy();
      retField.nPieces[0] = new NPiece(emptyNs[j], retField.nPieces[0].nid);
      moves.push(retField);
      retField = lField.copy();
      retField.nPieces[1] = new NPiece(emptyNs[j].copy(), retField.nPieces[1].nid);
      moves.push(retField);
    }
    ++current;
    return moves;
  }
};

LaGameAiPlayer.prototype.callEndCallback = function(newPiece) {
  var callback = this.endMoveCallback;
  if (callback)
    window.setTimeout(function() { callback(newPiece) }, 0);
};
