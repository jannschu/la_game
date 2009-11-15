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
  
  this.lPieces = new Array (
    { player: 0, type:"l", x:0, y:2, rot:0, inv:false },
    { player: 1, type:"l", x:3, y:1, rot:2, inv:false }
  )
  
  this.nPieces = new Array (
    { type:"n", nid:0, x:0, y:0 },
    { type:"n", nid:1, x:3, y:3 }
  )
  
  this.playerCanMoveL = true
  this.playerCanMoveN = true
  
  this.isEnded = false
    
}

LaGameLogic.prototype.getLPieces = function() {
  return this.lPieces;
};

LaGameLogic.prototype.getNPieces = function() {
  return this.nPieces;
}

LaGameLogic.prototype.initializeGame = function() {
  // TODO place start pieces randomly
  this.gui.drawGameBoard();
  var neutrals = this.getNPieces();
  this.gui.setNeutral(neutrals[0].x, neutrals[0].y);
  this.gui.setNeutral(neutrals[1].x, neutrals[1].y);
  var l = this.getLPieces();
  var l0 = l[0];
  this.gui.setLPiece(l0.x, l0.y, l0.rot, l0.inv, 0);
  var l1 = l[1];
  this.gui.setLPiece(l1.x, l1.y, l1.rot, l1.inv, 1);
  
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
    var realisedMove = realisePiece(move)
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

  /* Check if player can execute the move (simple conditions) */
  
  /* L pieces */
  if (move.type == "l") {
    /* Check if the move is "available" */
    if (this.playerCanMoveL == false) {
      return { error:"alreadymovedl" }
    }
  }
  
  /* N pieces */
  if (move.type == "n") {
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
  if (move.type == "l") {
    this.lPieces[this.curPlayer] = move
    this.playerCanMoveL = false
  }
  else if (move.type == "n")
  {
    this.nPieces[move.nid] = move
    this.playerCanMoveN = false
  }
  
  this.players[this.curPlayer].stopMoving();
  
  if (!this.playerCanMoveL && this.playerCanMoveN) {
    this.gui.setCanFinishTurn(true);
  }
  
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

  /*if (this.playerCanMoveL != false) {
    return "lnotmovedyet"
  }*/
  
  /* FIXME: build function out of this */
  /* Actual check starts here */
  
  /* Realise all of the pieces except for the player's L piece */
  /* FIXME: Implement zero-overhead */
  var realisedFields = new Array()
  realisedFields = realisedFields.concat(
    realisePiece(this.lPieces[makeOpposite(this.curPlayer)])
  )
  realisedFields = realisedFields.concat(this.nPieces[0])
  realisedFields = realisedFields.concat(this.nPieces[1])
  
  /* Fill a field containing all those fields */
  var field = new Array()
  
  /* Initialize that field */
  for (var c1 = 0; c1 < 4; c1++) {
    field[c1] = new Array()
    for (var c2 = 0; c2 < 4; c2++) {
      field[c1][c2] = 0
    }
  }
  
  /* Set the piece-occupied fields to 1 */
  for (var c1 = 0; c1 < realisedFields.length; c1++) {
    field[realisedFields[c1].y][realisedFields[c1].x] = 1
  }
  
  /* FIXME: Debug code */
  var outp = ""
  for (var c1 = 0; c1 < field.length; c1++) {
    for (var c2 = 0; c2 < field[c1].length; c2++) {
      outp += field[c1][c2] + " "
    }
    outp += "\n"
  }    
  
  /* Empty horizontal fields */
  var hempty = new Array()
  
  /* Empty vertical fields */
  var vempty = new Array()
  
  /* Will contain the complete Ls found */
  var completeL = new Array()
  
  /* Stub positions relative to the 1st L field for horizontal alignment */
  var stubX = [ { x:0, y:-1 }, { x:0, y:1 },
                 { x:2, y:-1 }, { x:2, y:1 } ]
  
  /* Stub positions relative to the 1st L field for vertical alignment */
  var stubY = [ { x:-1, y:0 }, { x:1, y:0 },
                 { x:-1, y:2 }, { x:1, y:2 } ]
  
  /* TODO: Restructure;
   * Remark: though of course it would be nicer, 
   * the effort one has to take
   * in order to do it all in one
   * is worth doing it in two loops.
   */
  
  /* Horizontal check */
  /* Vertical loop */
  for (var c1 = 0; c1 < 4; c1++) {
    /* Horizontal loop */
    hempty = new Array() /* has to be reset to avoid multiline lines */
    for (var c2 = 0; c2 < 4; c2++) {
      if (field[c1][c2] == 0) {
        /* If found an empty position, add that position to the empty lists */
        hempty.push({ y:c1, x:c2 })
      }
      else if (field[c1][c2] == 1) {
        /* If found an occupied position before a list's len > 3, remove */
        hempty = new Array()
      }
      if (hempty.length == 3) { /* horizontal candidates found */
        /* Go through all the stubs */
        for (var c3 = 0; c3 < stubX.length; c3++) {
          if (hempty[0].y+stubX[c3].y < 0 || hempty[0].y+stubX[c3].y > 3
          || hempty[0].x+stubX[c3].x < 0 || hempty[0].x+stubX[c3].x > 3) {
            continue;
          }
          if (field[hempty[0].y+stubX[c3].y][hempty[0].x+stubX[c3].x] == 0) {
            /* Stub empty as well; complete L found! */
            completeL = completeL.concat(hempty)
            completeL.push({
              x:hempty[0].x+stubX[c3].x,
              y:hempty[0].y+stubX[c3].y
            })
            /* Now check if the complete L equals the own L piece */
            if (isSameL(this.lPieces[this.curPlayer], completeL) == false) {
              /* No winrar */
              return false
            }
            completeL = new Array()
            
          }
        }
        hempty = new Array()
        /* Go back one step in case it's like [ 0 0 0 0 ] */
        c2--
      } /* end of horizontal candidate */

    }
  }
  
  /* Vertical check */
  /* Horizontal loop */
  for (var c1 = 0; c1 < 4; c1++) {
    /* Vertical loop */
    vempty = new Array() /* has to be reset to avoid multiline lines */
    for (var c2 = 0; c2 < 4; c2++) {
      if (field[c2][c1] == 0) {
        /* If found an empty position, add that position to the empty lists */
        vempty.push({ y:c2, x:c1 })
      }
      else if (field[c2][c1] == 1) {
        /* If found an occupied position before a list's len > 3, remove */
        vempty = new Array()
      }

      if (vempty.length == 3) { /* vertical candidates found */
        /* Go through all the stubs */
        for (var c3 = 0; c3 < stubX.length; c3++) {
          if (vempty[0].y+stubY[c3].y < 0 || vempty[0].y+stubY[c3].y > 3
          || vempty[0].x+stubY[c3].x < 0 || vempty[0].x+stubY[c3].x > 3) {
            continue;
          }
          if (field[vempty[0].y+stubY[c3].y][vempty[0].x+stubY[c3].x] == 0) {
            /* Stub empty as well; complete L found! */
            completeL = completeL.concat(vempty)
            completeL = completeL.push({
              x:vempty[0].x+stubX[c3].x,
              y:vempty[0].y+stubX[c3].y
            })
            /* Now check if the complete L equals the own L piece */
            if (isSameL(this.lPieces[this.curPlayer], completeL) == false) {
              /* No winrar */
              return false
            }
            completeL = new Array()
          }
        }
        c2--
        vempty = new Array()
      } /* end of vertical candidate */

    }
  }

  return true

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
  move.x == this.lPieces[this.curPlayer].x &&
  move.y == this.lPieces[this.curPlayer].y &&
  move.rot == this.lPieces[this.curPlayer].rot &&
  move.inv == this.lPieces[this.curPlayer].inv
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
  
  if (move.type == "l") {
    /* 
     * If it's a L piece, it could collide with the opponent's L piece and
     * both N pieces.
     */
    
    /* We'll need that */
    var oppPlayer = makeOpposite(this.curPlayer)
    
    candidates = candidates.concat(realisePiece(this.lPieces[oppPlayer]))
    candidates = candidates.concat(this.nPieces)
    
  }
  else if (move.type == "n") {
    /*
     * If it's a N piece, it could collide with both L pieces and the other
     * N piece.
     */
    
    /* We'll need that */
    var otherN = makeOpposite(move.nid)
    
    candidates = candidates.concat(realisePiece(this.lPieces[0]))
    candidates = candidates.concat(realisePiece(this.lPieces[1]))
    candidates.push(this.nPieces[otherN])
    
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
    alert("Sie (Spieler Numero " + (this.curPlayer+1) + ") haben verloren.")
  } else {
    this.registerCallback();
  }
  
}

