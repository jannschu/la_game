
/* ************************************************************************ *
 *  YOU     ARE     ENTERING     THE     REALM     OF     CHAOS             *
 *                                                                          *
 *                           BE PREPARED...                                 *
 * ************************************************************************ */

function LaGameField() {

  this.lPieces = [
    new LPiece(new V2d(0,2), 0, false, 0),
    new LPiece(new V2d(3,1), 2, false, 1)
  ]
  
  this.nPieces = [
    new NPiece(new V2d(0,0), 0),
    new NPiece(new V2d(3,3), 1)
  ]
  
  this.cachedOcc = []

}

/* TODO: cache those as well */
/* TODO: maybe just delta-modification instead of always re-initialization */
/**
 * Get occupied fields.
 * @param {PieceArray} candidates The pieces to include in estimating stuff
 */
LaGameField.prototype.getOcc = function(candidates) {

  var field = []
  
  for (var c1 = 0; c1 < 4; c1++) {
    field.push(new Array(4))
    for (var c2 = 0; c2 < 4; c2++) {
      field[c1][c2] = 0
    }
  }
  
  var curPieceFields = []
  var allPieceFields = []
  
  for (var c1 = 0; c1 < candidates.length; c1++) {
    curPieceFields = candidates[c1].realise()
    allPieceFields = allPieceFields.concat(curPieceFields)
  }
  
  for (var c1 = 0; c1 < allPieceFields.length; c1++) {
  
    field[allPieceFields[c1].x][allPieceFields[c1].y] = 1
  
  }
  
  return field

}

LaGameField.prototype.lStubs = [
  new V2d(0,-1), new V2d(0,1),
  new V2d(2,-1), new V2d(2,1)
]

LaGameField.prototype.getEmptyLs = function(excludeLid, stopAfter) {

  var candidates = [ this.lPieces[makeOpposite(excludeLid)] ]
  candidates = candidates.concat(this.nPieces)
  
  var field = this.getOcc(candidates)
  
  /* TODO: sth with rotation, checking for stopAfter == 0, ... dunno */
  
  /* TODO: improve efficiency by using an alternate method regarding
   * rotation;
   * suggestion: function like: fieldAccess(v1, v2, mode) where mode is either
   * horizontal or vertical
   */
  
  var incr = new V2d(1,0)
  
  /* Current position being checked */
  var curPos = new V2d(0,0)
  
  /* L candidates which have to be checked for equality to the excluded one */
  var lCands = new Array()
  
  /* Ls found so far */
  var foundLs = new Array()
  
  /* Will store the current found bar's first piece */
  var curBar = new V2d(0,0)
  
  for (var rot = 0; rot < 2; rot++) {
    /* If it shalt be rotated, switch x and y positions */
    if (rot == 1) {
      var tempRot = field.copy;
      for (var c1 = 0; c1 < 4; c1++) {
        for (var c2 = 0; c2 < 4; c2++) {
          field[c2][c1] = tempRot[c1][c2]
        }
      }
    } /* End of rotation code */
    
    /* Actual shite starts here */
    /* There can't be a bar anymore if it's at 4|2 */
    while (curPos.y < 4 && curPos.x < 3) {
      curBar = this.findHBar(field, curPos)
      /* FIXME: barStart only sux, see below, fix! */
      
      lCands = this.checkBarLs(field, curBar[0], 5) /* 4! */
      
      for (var c1 = 0; c1 < lCands.length; lCands++) {
        if (!this.lPieces[excludeLid].isSame(lCands[c1])) {
          foundLs.push(lCands[c1])
          if (foundLs.length == stopAfter) {
            return foundLs
          }
        }
      }
      
      curPos.fadd(incr)
    }
    
  }
  
  return foundLs

}

LaGameField.prototype.findHBar = function(occField, startAt) {

  var empty = new Array()
  
  /* Vertical loop */
  for (var vC = startAt.y; vC < 4; vC++) {
    
    /* Reset empty once entering a new line since bars aren't multi-line */
    empty = new Array()
    
    /* Horizontal loop */
    for (var hC = startAt.x; hC < 4; hC++) {
    
      if (occField[vC][hC] == 0) {
        empty.push(new V2d(vC,hC))
      }
      else {
        empty = new Array()
      }
      
      if (empty.length == 3) {
        return empty /* FIXME FIXED'AH! */
      }
    
    }
    
  }
  
  return 0

}

LaGameField.prototype.checkBarLs = function(occField, barStart, stopAfter) {

  lStubs = LaGame.lStubs
  var curPos = new V2d()
  
  var matchLStubs = new Array()
  
  for (var c1 = 0; c1 < lStubs.length; c1++) {
    curPos = barStart.copy()
    curPos.add(lStubs[c1])
    if (curPos.isOob) {
      continue
    }
    
    if (occField[curPos.y][curPos.x] == 0) {
      matchLStubs.push({stub:curPos})
      if (matchLStubs.length == stopAfter) {
        break
      }
    }
  }
  
  return foundLs;

}

