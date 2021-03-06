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

/* TODO: DEVELOPMENT NOTES :TODO *
 *      WHAT HAS TO BE DONE
 *
 * - check if player can execute the move regarding this.playerCanMoveL etc. [done]
 * - discuss n piece identifier (necessary somehow) [done, nid]
 * - do this.playerCanMoveX SET && this.curPlayer SWITCH @ end of doMove()
 * - discuss whether the player HAS TO move stuff
 * - _maybe_ some sort of finishMove() function so the player doesn't have
 *   to put a neutral piece in its previous position when he doesn't want to
 *   move one
 * - nid issue in collision checking
 * - player can move npiece only _after_ having moved his lpiece
 * - do stuff
 */


/* ************************************************************************ */

/* INTERFACE */

/* ************************************************************************ */

/**
 * Controls the whole game
 * @param {LaGameGUI} gui The gui the game is displayed
 * @param {LaGamePlayer} playerA input source for player one (or A)
 * @param {LaGamePlayer} playerB input source for player two (or B)
 */
function LaGameLogic(gui, playerA, playerB) {
  this.gui = gui
  
  this.players = new Array(new playerA(0, gui, this), new playerB(1, gui, this))
  this.curPlayer = 0
  
  this.field = new LaGameField()
  
  this.playerCanMoveL = true
  this.playerCanMoveN = true
  
  this.isEnded = false
    
}

LaGameLogic.prototype.stopGame = function() {
  this.players[this.curPlayer].stopMoving();
  this.isEnded = true;
};

LaGameLogic.prototype.getLPieces = function() {
  return this.field.lPieces;
};

LaGameLogic.prototype.getNPieces = function() {
  return this.field.nPieces;
}

LaGameLogic.prototype.initializeGame = function() {
  // TODO place start pieces randomly
  this.gui.drawGameBoard();
  var neutrals = this.getNPieces();
  this.gui.setNPiece(neutrals[0]);
  this.gui.setNPiece(neutrals[1]);
  var l = this.getLPieces();
  this.gui.setLPiece(l[0]);
  this.gui.setLPiece(l[1]);
  
  /* Request move from player */
  this.registerCallback();
};

/**
 * Checks if a move could be executed without actually executing it
 * @param {MoveObject} move Move to check for validity
 * @param {FieldsArray} cachedRealMove Optional realised move (-> fields)
 */
/* FIXME: Implement zero-overhead (realising piece here and in doMove atm) */
LaGameLogic.prototype.isValidMove = function(move, cachedRealMove)
{

  var result
  if (cachedRealMove != null) {
    var realisedMove = cachedRealMove
  }
  else {
    var realisedMove = move.realise()
  }
  
  result = this.checkMoveAtAll(move)
  
  if (result.error != "none") {
    return result
  }
  
  result = this.checkOutOfBounds(realisedMove)
  
  if (result.error != "none") {
    return result
  }
  
  result = this.checkCollisions(move, realisedMove)
  
  if (result.error != "none") {
    return result
  }
  
  return { error:"none" }

}

/**
 * Attempts to execute a move
 * @param {MoveObject} move Move to attempt to do
 */
LaGameLogic.prototype.doMove = function(move) {
  if (this.isEnded) return;
  /* Check if player can execute the move (simple conditions) */
  
  /* L pieces */
  if (move instanceof LPiece) {
    /* Check if the move is "available" */
    if (this.playerCanMoveL == false) {
      return { error:"alreadymovedl" }
    }
  }
  
  /* N pieces */
  if (move instanceof NPiece) {
    if (this.playerCanMoveN == false) {
      return { error:"alreadymovedn" }
    }
    if (this.playerCanMoveL == true) { /* FIXME: discuss! */
      return { error:"lnotmovedyet" }
    }
  }
  
  var result
  
  result = this.isValidMove(move)
  
  if (result.error != "none") {
    return result
  }
  
  /* Actually execute the move, also setting the playerCan* vars */
  if (move instanceof LPiece) {
    this.field.lPieces[this.curPlayer] = move
    this.playerCanMoveL = false
  }
  else if (move instanceof NPiece)
  {
    this.field.nPieces[move.nid] = move
    this.playerCanMoveN = false
  }
  
  this.players[this.curPlayer].stopMoving();
  
  /* If both playerCan* vars are false, it's the other player's turn */
  if (this.playerCanMoveL == false && this.playerCanMoveN == false) {
    this.switchPlayers()
  } else {
    this.registerCallback()
  }
  
  return { error:"none" }
}

LaGameLogic.prototype.registerCallback = function() {
  var n = this.playerCanMoveL ? false : this.playerCanMoveN;
  var logic = this;
  this.players[this.curPlayer].startMoving(
    this.playerCanMoveL, n,
    function(newPiece) { logic.doMove(newPiece) }
  )
}

/**
 * Checks if the current player has won
 */
LaGameLogic.prototype.hasWon = function() {
  var ls = this.field.getEmptyLs(this.curPlayer, 1)
  
  if (ls.length == 0) {
    return true
  }
  
  return false
}

/**
 * Attempts to finish the current player's turn
 */
LaGameLogic.prototype.finishTurn = function() {

  if (this.playerCanMoveL == true) {
    return { error:"lnotmovedyet" }
  }
  
  /* So I said: "We don't need your so-called elegance [...]" */
  this.players[this.curPlayer].stopMoving()
  
  this.switchPlayers()
  
  return { error:"none" }

}

/* ************************************************************************ */

/* PRIVATE */

/* ************************************************************************ */

/**
 * Checks if any of the fields are out of bounds and returns those which are
 * @param {FieldArray} fields The fields you want to check
 */
LaGameLogic.prototype.checkOutOfBounds = function(fields) {

  var overLapFields = new Array()
  /* FIXME maybe: what if both x and y are screwed up? -> duplicate entry */
  for (var c1 = 0; c1 < fields.length; c1++) {
    if (fields.x > 3 || fields.x < 0) {
      retVal.overLapFields.push({ where:"x", x:fields.x, y:fields.y })
    }
    if (fields.y > 3 || fields.y < 0) {
      retVal.overLapFields.push({ where:"y", x:fields.x, y:fields.y })
    }    
  }

  if (overLapFields.length != 0) {
    return { error:"outofbounds", fields:overLapFields }
  }
  
  return { error:"none" }

}

/**
 * Checks if a given L piece move actually changes its position
 * @param {MoveObject} move The L piece move to check for validity
 */
LaGameLogic.prototype.checkMoveAtAll = function(move) {

  if (
  move.pos.x == this.field.lPieces[this.curPlayer].pos.x &&
  move.pos.y == this.field.lPieces[this.curPlayer].pos.y &&
  move.rot == this.field.lPieces[this.curPlayer].rot &&
  move.inv == this.field.lPieces[this.curPlayer].inv
  ) {
  
    return { error:"nomove" }
  }
  
  return { error:"none" }

}

/**
 * Checks if the given fields collide with anything on the field
 * @param {MoveObject} move The piece's object representation
 * @param {FieldsArray} fields The piece's fields representation
 */
LaGameLogic.prototype.checkCollisions = function(move, fields) {

  /* First determine the fields with which the moved piece could collide. */
  var candidates = new Array();
  
  if (move instanceof LPiece) {
    /* 
     * If it's a L piece, it could collide with the opponent's L piece and
     * both N pieces.
     */
    
    /* We'll need that */
    var oppPlayer = makeOpposite(this.curPlayer)
    
    candidates = candidates.concat(this.field.lPieces[oppPlayer].realise())
    candidates.push(this.field.nPieces[0].realise())
    candidates.push(this.field.nPieces[1].realise())
    
  }
  else if (move instanceof NPiece) {
    /*
     * If it's a N piece, it could collide with both L pieces and the other
     * N piece.
     */
    
    /* We'll need that */
    var otherN = makeOpposite(move.nid)
    
    candidates = candidates.concat(this.field.lPieces[0].realise())
    candidates = candidates.concat(this.field.lPieces[1].realise())
    candidates.push(this.field.nPieces[otherN].realise())
    
  }

  /* This neat array will store all colliding fields */
  var collidingFields = new Array()
  
  /* Now go through the fields and candidates, checking for collisions. */
  for (var c1 = 0; c1 < fields.length; c1++) {
    for (var c2 = 0; c2 < candidates.length; c2++) {
    
      if (fields[c1].x == candidates[c2].x && fields[c1].y == candidates[c2].y) {
        collidingFields.push(fields[c1])
      }
    
    }
  }
  
  
  if (collidingFields.length != 0) {
    return { error:"collision", fields:collidingFields }
  }
  
  return { error:"none" }

}
/* 
 * FIXME: Development note: before this function gets called, you have to
 * check for winning situation etc. since afterwards the turn will be over.
 * Just sayin'.
 */
LaGameLogic.prototype.switchPlayers = function() {
  if (this.isEnded) return;
  /*
   * FIXME: ADD ERRCHECK HERE (e.g. if player hasn't moved L piece yet -> fail
   *
   * ...
   *
   * NOPE! Since you just have to check for playerCanMoveL == false and
   * playerCanMoveN == false (not moving neutral piece -> put it where it
   * was ) just before calling this function; that solves it. No extra 
   * checking of any kind necessary.
   */
  this.gui.setMoveCounter(this.gui.moveCounter + 1);
  if (this.curPlayer == 0) {
    this.curPlayer = 1
  }
  else
  {
    this.curPlayer = 0
  }
  
  this.gui.setCanFinishTurn(false);
  
  this.playerCanMoveL = true
  this.playerCanMoveN = true
  
  if (this.hasWon() == true) {
    var msg = "Spieler " + (makeOpposite(this.curPlayer) + 1) + " hat gewonnen";
    this.gui.setPlayerLabel(msg, makeOpposite(this.curPlayer));
  } else {
    this.registerCallback();
  }
  
}

