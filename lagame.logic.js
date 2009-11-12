/* INTERFACE */

/* FIXME: DEVELOPMENT NOTES :FIXME *
 *      WHAT HAS TO BE DONE
 *
 * - check if player can execute the move regarding this.playerCanMoveL etc. [done]
 * - discuss n piece identifier (necessary somehow) [done, nid]
 * - do this.playerCanMoveX SET && this.curPlayer SWITCH @ end of doMove()
 * - discuss whether the player HAS TO move stuff
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
    { type:"l", x:0, y:2, rot:0, inv:0 },
    { type:"l", x:3, y:1, rot:2, inv:0 }
  )
  
  this.nPieces = new Array (
    { type:"n", nid:0, x:0, y:0 },
    { type:"n", nid:1, x:3, y:3 }
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

/**
 * Attempts to do a move
 * @param {MoveObject} move Move to attempt to do
 */
LaGameLogic.prototype.doMove = function(move) {

  /* Check if player can execute the move */
  if (move.type == "l" && this.playerCanMoveL == false) {
    return { error:"alreadymovedl" }
  }
  else if (move.type == "n" && this.playerCanMoveN == false) {
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
  
  /* FIXME: Implement collision check + _OUT OF BOUNDS CHECK_ :FIXME */
  
  /* Out of bounds check */
  for (var c1 = 0; c1 < realP.length; c1++) {
    if (realP[c1].x < 0 || realP[c1].x > 3) {
      return { error:"outofbounds", x:realP[c1].x }
    }
    if (realP[c1].y < 0 || realP[c1].y > 3) {
      return { error:"outofbounds", y:realP[c1].y }
    }
  }
  
  /* Collision check */ /* FIXME: NEUTRAL PIECES TOO */
  for (var c1 = 0; c1 < realP.length; c1++) {
    
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
      realP[c1].y = this.realLPieces[oppPlayer][c2].y) {
        return { error:"collision", x:realP[c1].x, y:realP[c1].y }
      }
    }
    
    /* 
     * ONLY IF A NEUTRAL PIECE IS BEING MOVED:
     * Perform check for collision with _own L piece _
     */
    /* FIXME: COND [FIXED] */
    
    if (move.type == "n") {
    
      for (var c2 = 0; c2 this.realLPieces[this.curPlayer].length; c2++) {
        if (realP[c1].x == this.realLPieces[this.curPlayer][c2].x &&
        realP[c1].y == this.realLPieces[this.curPlayer][c2].y) {
          return { error:"collision", x:realP[c1].x, y:realP[c1].y }
        }
      }
      
    }
    
  } /* FIXME: IMPLEMENT SHITE FOR N PIECES (CHECKS FOR OWN L PIECE AS WELL) [FIXED] */
  
  /* Realise move */
  
  if (move.type == "l") {
    this.lPieces[this.curPlayer] = move
    this.realLPieces[this.curPlayer] = realisePiece(move)
    
    this.playerCanMoveL = false
  } /* FIXME: ADD ROUTINE FOR N PIECES [INPROGRESS] */
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

LaGameLogic.prototype.switchPlayers = function() {

  /* FIXME: ADD ERRCHECK HERE (e.g. if player hasn't moved L piece yet -> fail */
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

/* PRIVATE */

/* FIXME: L Piece Arrangements as array of some sort -> elegance++ [FIXED] */

LPArrs = new Array (
 new Array (
  new Array({ x:0, y:-1 }, { x:1, y:0 }, { x:2, y:0 }),
  new Array({ x:-1, y:0 }, { x:0, y:-1}, { x:0, y:-2}),
  new Array({ x:0, y:1 }, { x:-1, y:0 }, { x:-2, y:0 }),
  new Array({ x:1, y:0 }, { x:0, y:1 }, { x:0, y:2 })
 ),
 new Array (
  new Array({ x:0, y:1 }, { x:1, y:0 }, { x:2, y:0 }),
  new Array({ x:-1, y:0 }, { x:0, y:1 }, { x:0, y:2 }),
  new Array({ x:0, y:-1 }, { x:-1, y:0 }, { x:-2, y:0 }),
  new Array({ x:-1, y:0 }, { x:0, y:-1 }, { x:0, y:-2 })
 )
)

/* British English */
function realisePiece(obj) {
  var retArr = new Array({ x:obj.x, y:obj.y })
  switch (obj.type) {
    case "n":
      return retArr
      break
    case "l": /* This should've been done in another way */
      for (var c1 = 0; c1 < LPArrs[obj.inv].length; c1++) {
        retArr.push (
          { x:LPArrs[obj.inv][obj.rot].x+obj.x,
            y:LPArrs[obj.inv][obj.rot].y+obj.y }
        )
      }
      return retArr /* FIXME: Need to add the LPArr vals to the obj.x/y vals [SHOULDWORKNOW] */
      break
  }
}

/* Map coords to array index */
function mapCToA(obj) {
  return obj.y*4 + obj.x
}


