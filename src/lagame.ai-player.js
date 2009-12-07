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

/*
 * THE PLAN:

0.) increase count variable
1.) get all possible L and N positions
2.) map those to L pieces
3.) create hash and store it somewhere
4.) compare this hash to any hashes so far; if it's equal, stop the current
    branch of execution
5.) if the situation means win, return "win"
6.) if the situation means fail, return "fail"

 * :NALP EHT
 */

function LaGameAiPlayer(playerNumber, gui, logic) {

  this.playerNumber = playerNumber; // public
  this.gui = gui; // public
  this.logic = logic; // public

  this.canMoveL = false; // public
  this.canMoveNeutral = false; // public
  this.endMoveCallback = null;

}

LaGameAiPlayer.prototype.startMoving = function(l, neutral, callback) {

  if (this.gui.getCurrentPlayerForLabel() != this.playerNumber) 
    this.gui.setPlayerLabel("Spieler " + (this.playerNumber + 1) + " (KI) ist dran",
      this.playerNumber
    )

  this.canMoveL = !!l;
  this.canMoveNeutral = !!neutral;
  this.endMoveCallback = callback;
  var oldField = this.logic.field;
  
  var hasOptimal = false
  
  var allPos = this.getAllPositions(this.logic.field, this.playerNumber);

  for (var c1 = 0; c1 < allPos.length; c1++) {
    if (allPos[c1].getEmptyLs(makeOpposite(this.playerNumber), 1).length == 0) {
      this.logic.field = allPos[c1]
      hasOptimal = true
    }
  }
  
  if (!hasOptimal) {
    this.logic.field = allPos[Math.round((allPos.length - 1) * Math.random())]
  }
  var logic = this.logic;
  this.gui.animateMove(oldField, logic.field, function() {
    logic.playerCanMoveN = true
    logic.playerCanMoveL = true
    setTimeout(function() {logic.switchPlayers()}, 0);
  })
}

LaGameAiPlayer.prototype.drawAllPos = function(allPos, curNum) {
  if (curNum == allPos.length) {
    return
  }
  this.logic.field = allPos[curNum]
  var me = this
  this.drawGameBoard()
  curNum++
  window.setTimeout(function() { me.drawAllPos(allPos, curNum) },50)
  
}


LaGameAiPlayer.prototype.stopMoving = function(notRedraw) {
  if (!notRedraw) this.drawGameBoard();
};

LaGameAiPlayer.prototype.callEndCallback = function(newPiece) {
  var callback = this.endMoveCallback;
  if (callback)
    window.setTimeout(function() { callback(newPiece) }, 0);
};

LaGameAiPlayer.prototype.drawGameBoard = function() {
  this.gui.drawGameBoard();
  
  this.gui.setLPiece(this.logic.field.lPieces[0])
  this.gui.setLPiece(this.logic.field.lPieces[1])
  this.gui.setNPiece(this.logic.field.nPieces[0])
  this.gui.setNPiece(this.logic.field.nPieces[1])
  
};


/* AI stuff */

LaGameAiPlayer.prototype.getAllPositions = function(field, player) {

  var allPos = new Array()
  var tempField = field.copy()
  
  var emptyLs = field.getEmptyLs(player, Infinity)
  var emptyNs = 0
  
  var tempL
  
  for (var c1 = 0; c1 < emptyLs.length; c1++) {
    tempL = emptyLs[c1]
    //console.log("curL:"+c1)
    for (var nP = 0; nP < 2; nP++) {
      tempField = field.copy()
      //console.log("nP:"+nP)
      tempField.lPieces[player] = tempL
      emptyNs = tempField.getEmptyNs(nP)
      for (var c2 = 0; c2 < emptyNs.length; c2++) {
        tempField.nPieces[nP] = emptyNs[c2]
        allPos.push(tempField.copy())
      }
    }
  }

  return allPos

}

