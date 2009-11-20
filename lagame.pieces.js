
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
  this.cache = []
}

function LPiece.startCache = function() {

  this.caching = true

}

LPiece.rVals = [
  [ new V2d(1,0), new V2d(2,0), new V2d(0,-1) ], // rot 0
  [ new V2d(-1,0), new V2d(0,-1), new V2d(0,-2) ], // rot 1
  [ new V2d(0,1), new V2d(-1,0), new V2d(-2,0) ], // rot 2
  [ new V2d(1,0), new V2d(0,1), new V2d(0,2) ]  // rot 3
]

function LPiece.prototype.realise = function() {
  if (this.cache != []) return this.cache;
  var fields = [ new V2d(this.x, this.y) ]
  var curRVals = LPiece.rVals[this.rot]
  var invMul = 1
  if (this.inv == true) {
    invMul = -1
  }
  
  var curField
  
  for (var c1 = 0; c1 < curRVals.length; c1++) {
    curField = rVals.copy()
    curField.x *= invMul
    curField.add(this.pos)
    fields.push(curField)
  }
  this.cache = fields;
  return fields

}


