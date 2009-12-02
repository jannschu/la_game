function NPiece(pos, nid) {

  this.pos = pos
  this.nid = nid

}

NPiece.prototype.copy = function() {
  return new NPiece(this.pos.copy(), this.nid)
};

NPiece.prototype.realise = function() {

  return [ this.pos.copy() ]

}

/* TODO: discuss: nid? */
NPiece.prototype.isSame = function(rhs) {

  if (this.pos.isEqual(rhs.pos) == true) {
    return true
  }
  
  return false

}
