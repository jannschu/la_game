
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

function LaGameField.prototype.makeCandidates(pid1, pid2, nid1, nid2) {

  var candidates = []
  
  if 

}

function LaGameField.prototype.getOcc(candidates) {

  

}
