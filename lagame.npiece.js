
function LPiece(pos, nid) {

  this.pos = pos
  this.nid = nid

}

function LPiece.prototype.realise = function() {

  return [ this.pos.copy() ]

}

/* TODO: discuss: nid? */
function LPiece.prototype.isSame = function(rhs) {

  if (this.pos.isEqual(rhs.pos) == true) {
    return true
  }
  
  return false

}
