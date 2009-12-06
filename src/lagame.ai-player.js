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
  
  me = this.gui
  
  var tempField = this.logic.field.copy();
  
  var hasOptimal = false;
  
  var allPos = this.getAllPositions(this.logic.field, this.playerNumber);
  var tempF = this.logic.field.copy()
  
  var playerNum = makeOpposite(this.playerNumber)
  
  this.logic.field = allPos[7]
  var emptyLs = this.logic.field.getEmptyLs(1, Infinity)
  tempField = this.logic.field.copy()
  tempField.lPieces[1] = this.getCondensedLPieceFor(emptyLs[4], 1)
  emptyNs = tempField.getEmptyNs(0)
  
  console.log("aL:"+emptyLs.length)
  var outp = ""
  for (var d1 = 0; d1 < emptyLs.length; d1++) {
    outp="l"+d1+":\n"
    for (var d2 = 0; d2 < emptyLs[d1].length; d2++) {
      outp+=emptyLs[d1][d2].y+","+emptyLs[d1][d2].x+"\n"
    }
    console.log(outp)
  }
  
  this.getAllPositions(allPos[7], 1)
  this.drawGameBoard()
  
  //return
  
  //return
  
  for (var c1 = 0;  c1 < allPos.length; c1++) {
    console.log("apn:" + c1)
    this.getAllPositions(allPos[c1], playerNum)
  }
  
  console.log("ap:" + allPos.length)
  this.drawAllPos(allPos, 0)
  
  this.logic.field = tempF
  
  
}

LaGameAiPlayer.prototype.drawAllPos = function(allPos, curNum) {
  if (curNum == allPos.length) {
    return
  }
  this.logic.field = allPos[curNum]
  var me = this
  this.drawGameBoard()
  curNum++
  window.setTimeout(function() { me.drawAllPos(allPos, curNum) },600)
  
}


LaGameAiPlayer.prototype.stopMoving = function(notRedraw) {
  if (!notRedraw) this.drawGameBoard();
};

LaGameAiPlayer.prototype.callEndCallback = function(newPiece) {
  var callback = this.endMoveCallback;
  if (callback)
    window.setTimeout(function() { callback(newPiece) }, 0);
};


/* Duplicate code FTW */
LaGameAiPlayer.prototype.getCondensedLPieceFor = function(fields, player) {
  var a = fields[0];
  var b = fields[1];
  var c = fields[2];
  var d = fields[3];
  var isDiagonal = function(a, b) { // a, b instanceof V2d
    return Math.abs(a.x - b.x) == 1 && Math.abs(a.y - b.y) == 1;
  }
  var isPair = function(a, b) {
    return (a.x == b.x && Math.abs(a.y - b.y) == 1) ||
      (a.y == b.y && Math.abs(a.x - b.x) == 1)
  }
  var piece = new LPiece(new V2d(), null, null, player);
  var perms = [[a, b, c, d], [a, c, b, d], [a, d, b, c], [b, c, d, a], [b, d, a, c], [c, d, a, b]];
  var x, y, longTailEnd, shortTailEnd, nr, p;
  for (var i = 0; i < 6; ++i) {
    p = perms[i];
    if (isDiagonal(p[0], p[1])) {
      nr = (isPair(p[2], p[0]) && isPair(p[2], p[1])) ? 2 : 3
      x = p[nr].x
      y = p[nr].y
      longTailEnd = nr == 3 ? p[2] : p[3];
      shortTailEnd = (isPair(longTailEnd, p[0])) ? p[1] : p[0];
      break;
    }
  }
  if (x == undefined) return false;
  piece.pos.x = x;
  piece.pos.y = y;
  if (shortTailEnd.x == piece.pos.x) { // rot 0 or 2
    if (shortTailEnd.y < piece.pos.y) {
      piece.rot = 0;
      piece.inv = longTailEnd.x < piece.pos.x;
    } else {
      piece.rot = 2;
      piece.inv = longTailEnd.x > piece.pos.x;
    }
  } else { // rot 1 or 3
    if (longTailEnd.y < piece.pos.y) {
      piece.rot = 1;
      piece.inv = shortTailEnd.x > piece.pos.x;
    } else {
      piece.rot = 3;
      piece.inv = shortTailEnd.x < piece.pos.x;
    }
  }
  return piece;
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
    tempL = this.getCondensedLPieceFor(emptyLs[c1], player)
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

