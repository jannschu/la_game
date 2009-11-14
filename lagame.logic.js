/* INTERFACE */

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
 * - do stuff
 */

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
    { type:"l", x:0, y:3, rot:0, inv:false },
    { type:"l", x:2, y:2, rot:1, inv:true  }
  )
  
  this.nPieces = new Array (
    { type:"n", nid:0, x:0, y:1 },
    { type:"n", nid:1, x:1, y:2 }
  )
  
  this.playerCanMoveL = true
  this.playerCanMoveN = true
  
  this.isEnded = false
  
  /* WARNING: HERE BE DRAGONS */
  /*this.field = new Array(16)
  
  var realisedP
  
  for (var c1 = 0; c1 < this.lPieces.length; c1++) {
  
    realisedP = realisePiece(this.lPieces[c1])
  
    for (var c2 = 0; c2 < realisedP.length; c2++) {
      
      this.field[ mapCToA(realisedP) ] = {
        type:this.lPieces[c1].type, player:c1
      }
    
    }
  
  }*/
  
  this.realLPieces = new Array (
    realisePiece(this.lPieces[0]),
    realisePiece(this.lPieces[1])
  )
  
  
  
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
 * Attempts to do a move
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
  if (move.type == "n" && this.playerCanMoveN == false) {
    return { error:"alreadymovedn" }
  }

  /*
   * I wrote this, then wrote something else, and now I have forgotten why I
   * need this stuff.
   * So I'll just keep it until I know what to do.
   *
   * Found it :) (see below)
   */
  if (this.curPlayer == 0) {
    oppPlayer = 1
  }
  else {
    oppPlayer = 0
  }
  
  var realP = realisePiece(move)
  
  /* Out of bounds check */
  /*for (var c1 = 0; c1 < realP.length; c1++) {
    if (realP[c1].x < 0 || realP[c1].x > 3) {
      return { error:"outofbounds", x:realP[c1].x }
    }
    if (realP[c1].y < 0 || realP[c1].y > 3) {
      return { error:"outofbounds", y:realP[c1].y }
    }
  }*/
  
  /* Collision check */
  for (var c1 = 0; c1 < realP.length; c1++) {
    
    /*
     * FIXME: CRITICAL :FIXME
     *
     * Needs restructuring; nid not taken into consideration.
     * Completely screwed up. Outrageous.
     *
     */
    /* Neutral pieces */
    for (var c2 = 0; c2 < this.nPieces.length; c2++) {
      if (realP[c1].x == this.nPieces[c2].x &&
      realP[c1].y == this.nPieces[c2].y) {
        return { error:"collision", x:realP[c1].x, y:realP[c1].y }
      }
    }
    
    /* Opponent L piece */
    for (var c2 = 0; c2 < this.realLPieces[oppPlayer].length; c2++) {
      if (realP[c1].x == this.realLPieces[oppPlayer][c2].x &&
      realP[c1].y == this.realLPieces[oppPlayer][c2].y) {
        return { error:"collision", x:realP[c1].x, y:realP[c1].y }
      }
    }
    
    /* 
     * ONLY IF A NEUTRAL PIECE IS BEING MOVED:
     * Perform check for collision with _own L piece _
     */
    
    if (move.type == "n") {
    
      for (var c2 = 0; c2 < this.realLPieces[this.curPlayer].length; c2++) {
        if (realP[c1].x == this.realLPieces[this.curPlayer][c2].x &&
        realP[c1].y == this.realLPieces[this.curPlayer][c2].y) {
          return { error:"collision", x:realP[c1].x, y:realP[c1].y }
        }
      }
      
    }
    
  }
  
  /* Realise move */
  
  if (move.type == "l") {
    this.lPieces[this.curPlayer] = move
    this.realLPieces[this.curPlayer] = realisePiece(move)
    
    this.playerCanMoveL = false
  }
  else if (move.type == "n") {
    this.nPieces[move.nid] = move
    
    this.playerCanMoveN = false
  }
  
  /* If the player can't move pieces anymore, it's the other player's turn */
  if (this.playerCanMoveL == false && this.playerCanMoveN == false) {
    this.switchPlayers()
  }
  
  return { error:"none" } /* FIXME: MAYBE 0, DISCUSS */
  
  /*
   * FIXME: One has to wonder though: WTF? The effort it takes to check _all
   * of the f-ing field is _necessarily_ more than the one you had when
   * just checking pieces. F. I'll fix it tomorrow.
   *
   * [FIXED, I guess]
   */
  
};

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

