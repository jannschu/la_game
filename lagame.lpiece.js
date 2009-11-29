
/**
 * Represents an L piece in the game
 * @param {V2d} pos The piece's base field's position
 * @param {RotVal} rot The piece's rotation (0 for no, 1 for 90°, ...)
 * @param {Boolean} inv Whether the piece is inverted
 * @param {PlayerVal} player The piece's "owner"
 */
function LPiece(pos, rot, inv, player) {

  this.pos = pos
  this.rot = rot
  this.inv = inv
  this.player = player
  
  /* Cache */
  this.cachedFields = []
  this.cachedVals = {pos: pos, rot: rot, inv: inv}

}

LPiece.rVals = [
  [ new V2d(1,0), new V2d(2,0), new V2d(0,-1) ], // rot 0
  [ new V2d(-1,0), new V2d(0,-1), new V2d(0,-2) ], // rot 1
  [ new V2d(0,1), new V2d(-1,0), new V2d(-2,0) ], // rot 2
  [ new V2d(1,0), new V2d(0,1), new V2d(0,2) ]  // rot 3
]

LPiece.prototype.realise = function() {
  
  if (this.cacheIsUpToDate() == true) {
    return this.cachedFields
  }
  
  var fields = [ new V2d(this.pos.x, this.pos.y) ]
  var curRVals = LPiece.rVals[this.rot]
  var invMul = 1
  if (this.inv == true) {
    invMul = -1
  }
  
  var curField
  
  for (var c1 = 0; c1 < curRVals.length; c1++) {
    curField = curRVals[c1].copy()
    curField.x *= invMul
    curField.add(this.pos)
    fields.push(curField)
  }
  this.cachedFields = fields /* TODO: discuss: copy? */
  return fields

}

LPiece.prototype.isSame = function(rhs) {

  var lhsFields = this.realise()
  var rhsFields = rhs.realise()
  
  var isRepresented = false
  var allRepresented = true
  
  for (var c1 = 0; c1 < lhsFields.length; c1++) {
    isRepresented = false
    for (var c2 = 0; c2 < rhsFields.length; c2++) {
      if (lhsFields[c1].isEqual(rhsFields[c2]) == true) {
        isRepresented = true
      }
    }
    if (isRepresented == false) {
      allRepresented = false
    }
  }
  
  return allRepresented

}

/* ************************************************************************ */

/* PRIVATE */

/* ************************************************************************ */


LPiece.prototype.cacheIsUpToDate = function() {

  if (this.cachedFields.length == 0) {
    return false
  }
  
  if (
    this.pos != this.cachedVals.pos ||
    this.rot != this.cachedVals.rot ||
    this.inv != this.cachedVals.inv
  ) {
  
    return false
  
  }
  
  return true

}


