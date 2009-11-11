/* INTERFACE */

/**
 * Controls the whole game
 * @param {LaGameGUI} gui The gui the game is displayed
 * @param {LaGamePlayer} playerA input source for player one (or A)
 * @param {LaGamePlayer} playerB input source for player two (or B)
 */
function LaGameLogic(gui, playerA, playerB) {
  this.gui = gui
  
  this.players = new Array(playerA, playerB)
  this.curPlayerIndex = 0
  
  this.lPieces = new Array (
    { type:"l", x:0, y:2, rot:0 },
    { type:"l", x:3, y:1, rot:2 }
  )
  
  this.nPieces = new Array (
    { type:"n", x:0, y:0 },
    { type:"n", x:3, y:3 }
  )
  
  this.isEnded = false
  
  this.field = new Array(16)
  
  var realisedP
  
  for (var c1 = 0; c1 < this.lPieces.length; c1++) {
  
    realisedP = realise(this.lPieces[c1])
  
    for (var c2 = 0; c2 < realisedP.length; c2++) {
      
      this.field[ mapCToA(realisedP) ] = {
        type:this.lPieces[c1].type, player:c1
      }
    
    }
  
  }
};

/**
 * Attempts to do a move
 * @param {MoveObject} move Move to attempt to do
 */
LaGameLogic.prototype.doMove = function(move) {
  /*
   * I wrote this, then wrote something else, and now I have forgotten why I
   * need this stuff.
   * So I'll just keep it until I know what to do.
   */
  if (this.curPlayer == 0) {
    oppPlayer = 1
  }
  else {
  {
    oppPlayer = 0
  }
  
  var realisedP = realise(move)
  
  /*
   * FIXME: One has to wonder though: WTF? The effort it takes to check _all
   * of the f-ing field is _necessarily_ more than the one you had when
   * just checking pieces. F. I'll fix it tomorrow.
   */  
  
};

/* PRIVATE */

/* FIXME: L Piece Arrangements as array of some sort -> elegance++ */

LPArrs = new Array (
 new Array({ x:0, y:-1 }, { x:1, y:0 }, { x:2, y:0 }),
 new Array({ x:-1, y:0 }, { x:0, y:-1}, { x:0, y:-2}),
 new Array({ x:0, y:1 }, { x:-1, y:0 }, { x:-2, y:0 }),
 new Array({ x:1, y:0 }, { x:0, y:1 }, { x:0, y:2 })
)

/* British English */
function realisePiece(obj) {
  var retArr = new Array({ x:obj.x, y:obj.y })
  switch (obj.type) {
    case "n":
      return retArr
      break
    case "l": /* This should've been done in another way */
      return retArr.concat(LPArrs[obj.rot])
      break
  }
}

/* Map coords to array index */
function mapCToA(obj) {
  return obj.y*4 + obj.x
}


