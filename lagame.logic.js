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
  
  this.players = new Array(playerA, playerB)
  this.curPlayer = 0
  
  this.lPieces = new Array (
    { player: 0, type:"l", x:0, y:3, rot:0, inv:false },
    { player: 1, type:"l", x:2, y:2, rot:1, inv:true  }
  )
  
  this.nPieces = new Array (
    { type:"n", nid:0, x:0, y:1 },
    { type:"n", nid:1, x:1, y:2 }
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
};

/**
 * Checks if a move could be executed without actually executing it
 * @param {MoveObject} move Move to check for validity
 */
/* FIXME: Implement zero-overhead (realising piece here and in doMove atm) */
LaGameLogic.prototype.isValidMove = function(move)
{

  var result
  var realisedMove = realisePiece(move)
  
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
    /* Check if it is, in fact, a move (i.e. not copying the old position) */
    if (this.lPieces[this.curPlayer] == move) {
      return { error:"nomove" }
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
    this.lPieces[curPlayer] = move
    this.playerCanMoveL = false
  }
  else if (move.type == "n")
  {
    this.nPieces[move.nid] = move
    this.playerCanMoveN = false
  }
  
  /* If both playerCan* vars are false, it's the other player's turn */
  if (this.playerCanMoveL == false && this.playerCanMoveN == false) {
    this.switchPlayers()
  }

  return { error:"none" } /* FIXME: MAYBE 0, DISCUSS */
  
};

/**
 * Attempts to finish the current player's turn
 */
LaGameLogic.prototype.finishTurn = function() {

  if (this.playerCanMoveL == true) {
    return { error:"lnotmovedyet" }
  }
  
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
  for (var c1 = 0; v1 < fields.length; c1++) {
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
    oppPlayer = makeOpposite(this.curPlayer)
    
    candidates.concat(realisePiece(this.lPieces[oppPlayer]))
    candidates.concat(this.nPieces)
  }
  else if (move.type == "n") {
    /*
     * If it's a N piece, it could collide with both L pieces and the other
     * N piece.
     */
    
    /* We'll need that */
    otherN = makeOpposite(move.nid)
    
    candidates.concat(this.lPieces[0])
    candidates.concat(this.lPieces[1])
    candidates.push(this.nPieces[otherN])
    
  }
  
  /* This neat array will store all colliding fields */
  var collidingFields = new Array()
  
  /* Now go through the fields and candidates, checking for collisions. */
  for (var c1 = 0; c1 < fields.length; c1++) {
    for (var c2 = 0; c2 < candidates.length; c2++) {
    
      if (fields.x == candidates[c1].x && fields.y == candidates[c1].y) {
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
  
  this.playerCanMoveL = true
  this.playerCanMoveN = true

}

