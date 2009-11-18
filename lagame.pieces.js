
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

}

function LPiece.startCache = function() {

  this.caching = true

}

function LPiece.rVals = [
  [ new V2d(1,0), new V2d(2,0), new V2d(0,-1) ], // rot 0
  [ new V2d(-1,0), new V2d(0,-1), new V2d(0,-2) ], // rot 1
  [ new V2d(0,1), new V2d(-1,0), new V2d(-2,0) ], // rot 2
  [ new V2d(1,0), new V2d(0,1), new V2d(0,2) ]  // rot 3
]

function LPiece.prototype.realise = function() {

  var fields = [ new V2d(this.x, this.y) ]

}
