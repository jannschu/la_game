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
  
  if (l && !neutral) this.bestMove = this.getBestMove();
  
  this.endMoveCallback = callback;
  
  var move;
  var moveField = this.logic.field.copy();
  if (l) {
    move = this.bestMove.lPieces[this.playerNumber];
    moveField.lPieces[this.playerNumber] = move;
  }
  else {
    var i = this.bestMove.nPieces[0].isSame(this.logic.field.nPieces[0]) ? 1 : 0;
    move = this.bestMove.nPieces[i];
    if (move.isSame(moveField.nPieces[i])) {
      this.callEndCallback(move);
      return;
    }
    moveField.nPieces[i] = move;
  }
  
  var player = this;
  this.gui.animateMove(this.logic.field, moveField, function() {
    player.callEndCallback(move);
  })
}

LaGameAiPlayer.prototype.stopMoving = function() {};

LaGameAiPlayer.prototype.getBestMove = function() {
  var startField = this.logic.field.copy();
  
  var getMyMoves = this.getMovesFor(startField, this.playerNumber);
  var oppPlayer = makeOpposite(this.playerNumber);
  
  var myMoves;
  var last;
  var notLoseMoves = [];
  while(myMoves = getMyMoves()) {
    var myMove;
    for (var i = 0; i < myMoves.length; ++i) { myMove = myMoves[i];
      last = myMove;
      if (myMove.getEmptyLs(oppPlayer).length == 0) return myMove;
      var getOppPlayerMoves = this.getMovesFor(myMove, oppPlayer);
      var oppMoves, oppMove;
      var lost = false;
      while (oppMoves = getOppPlayerMoves()) {
        for (var j = 0; j < oppMoves.length; ++j) { oppMove = oppMoves[j];
          if (oppMove.getEmptyLs(this.playerNumber).length == 0) {
            lost = true; break;
          }
        }
        if (lost) break;
      }
      if (!lost) notLoseMoves.push(myMove);
    }
  }
  if (!last) return startField;
  var rand = function() {
    return Math.round((notLoseMoves.length - 1) * Math.random());
  }
  return notLoseMoves.length > 0 ? notLoseMoves[rand()] : last;
};

LaGameAiPlayer.prototype.getMovesFor = function(field, player) {
  var currentPlayer = player;
  var emptyLs = field.getEmptyLs(currentPlayer);
  var moves = [];
  var current = 0;
  var end = emptyLs.length;
  return function() {
    if (current == end) {
      // if (arg == "res") current = 0;
      // else return false;
      delete emptyLs;
      return false;
    }
    // console.log(current, end)
    var moves = []
    var lField = field.copy();
    lField.lPieces[currentPlayer] = emptyLs[current];
    var emptyNs = lField.getEmptyNs(0).concat(lField.getEmptyNs(1));
    var half = emptyNs.length / 2;
    var retField;
    for (j = 0; j < emptyNs.length; ++j) {
      retField = lField.copy();
      retField.nPieces[j < half ? 0 : 1] = emptyNs[j];
      moves.push(retField);
    }
    delete lField, emptyNs, retField;
    ++current;
    return moves;
  }
};

LaGameAiPlayer.prototype.callEndCallback = function(newPiece) {
  var callback = this.endMoveCallback;
  if (callback)
    window.setTimeout(function() { callback(newPiece) }, 0);
};
