
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

LaGameField.prototype.copy = function() {
  var copy = new LaGameField();
  copy.lPieces = this.lPieces.copy();
  copy.nPieces = this.nPieces.copy();
  copy.cachedOcc = this.cachedOcc.copy();
  return copy;
};

LaGameField.prototype.hashCode = function() {
  // first make player one's l-piece have a vertical long tail
  var hashField = this.copy();
  var refLPiece = hashField.lPieces[0];
  if (refLPiece.rot == 0 || refLPiece.rot == 2) hashField.rotateField();
  // now make the long tail show downwards
  if (refLPiece.rot == 1) hashField.inverseFieldVertically();
  // now make shure it is not horizontally inversed
  if (refLPiece.inv) hashField.inverseFieldHorizontally();
  // if (refLPiece.inv != false || refLPiece.rot != 3) {
  //   console.error("it's not right")
  //   console.log(refLPiece)
  // }
  var lPieceHash = function(piece) {
    return "" + piece.pos.x + piece.pos.y + piece.rot + piece.inv ? "1" : "0" + piece.player
  };
  var nPieceHash = function(n) {
    return "" + n.pos.x + n.pos.y;
  };
  var code = lPieceHash(hashField.lPieces[0]) + lPieceHash(hashField.lPieces[1]) +
    nPieceHash(hashField.nPieces[0]) + nPieceHash(hashField.nPieces[1]);
  return Number(code).toString(36);
};

LaGameField.prototype.inverseFieldHorizontally = function() {
  var n = this.nPieces;
  n[0].pos.x = 3 - n[0].pos.x;
  n[1].pos.x = 3 - n[1].pos.x;
  var l = this.lPieces;
  l[0].pos.x = 3 - l[0].pos.x;
  l[1].pos.x = 3 - l[1].pos.x;
  l[0].inv = !l[0].inv;
  l[1].inv = !l[1].inv;
};

LaGameField.prototype.inverseFieldVertically = function() {
  var n = this.nPieces;
  n[0].pos.y = 3 - n[0].pos.y;
  n[1].pos.y = 3 - n[1].pos.y;
  var l = this.lPieces;
  l[0].pos.y = 3 - l[0].pos.y;
  l[1].pos.y = 3 - l[1].pos.y;
  if ((l[0].rot += 2) >= 4) l[0].rot -= 4
  if ((l[1].rot += 2) >= 4) l[1].rot -= 4
  l[0].inv = !l[0].inv;
  l[1].inv = !l[1].inv;
};

LaGameField.prototype.rotateField = function() {
  var rotateNPiece = function(n) {
    var x0 = n.pos.x;
    n.pos.x = n.pos.y;
    n.pos.y = 3 - x0;
    return n;
  };
  var rotateLPiece = function(l) {
    var x0 = l.pos.x;
    l.pos.x = l.pos.y;
    l.pos.y = 3 - x0;
    if (++l.rot == 4) l.rot = 0;
    return l;
  };
  this.nPieces[0] = rotateNPiece(this.nPieces[0]);
  this.nPieces[1] = rotateNPiece(this.nPieces[1]);
  this.lPieces[0] = rotateLPiece(this.lPieces[0]);
  this.lPieces[1] = rotateLPiece(this.lPieces[1]);
};

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
  
    //field[allPieceFields[c1].x][allPieceFields[c1].y] = 1
    field[allPieceFields[c1].x] = 1
  
  }
  
  return field

}

LaGameField.lStubs = [
  new V2d(0,-1), new V2d(0,1),
  new V2d(2,-1), new V2d(2,1)
]

LaGameField.prototype.getEmptyLs = function(excludeLid, stopAfter) {

  var candidates = new Array( this.lPieces[makeOpposite(excludeLid)] )
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
          foundLs.push({stub:lCands[c1],barStart:curBar[0]})
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

  lStubs = LaGameField.lStubs
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
  
  return matchLStubs

}

