/* 
 * Fields for all possible L-Piece positions
 * @see LaGameGUI#setLPiece
 * Reference point is always the edge of the L-Piece
 */
LPArrs = [
  [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y:-1 }], // 0. pos
  [{ x:-1, y: 0 }, { x: 0, y:-1 }, { x: 0, y:-2 }], // 1. pos
  [{ x: 0, y: 1 }, { x:-1, y: 0 }, { x:-2, y: 0 }], // 2. pos
  [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]  // 3. pos
]

/**
 * Returns all fields for a game piece
 * @param {Object} point The Description of the point
 * with property type as 'n' or 'l' for neutral and L-Piece and 'x' and 'y'.
 * Set property 'inv' to inverse and 'rot' for different positions 
 */
function realisePiece(piece) {
  var pointsForPiece = [{ x:piece.x, y:piece.y }]
  switch (piece.type) {
    case "n":
      return pointsForPiece;
    case "l":
      var relativePoints = LPArrs[piece.rot];
      var inv = piece.inv ? -1 : 1;
      var point;
      for (var i = 0; i < relativePoints.length; ++i) {
        point = {
          x: inv * relativePoints[i].x + piece.x, 
          y: relativePoints[i].y + piece.y
        }
        pointsForPiece.push(point);
      }
      return pointsForPiece;
  }
}

/**
 * Checks if the L piece specified will form the fields specified
 * @param {Piece} lPiece L piece
 * @param {Fields} fields Fields to compare the L piece to
 */
function isSameL(lPiece, fields) {

  var realP = realisePiece(lPiece)
  
  var isRepresented = true
  var allRepresented = true
  
  /* We can't ensure the order is the same in both; sucks, I know */
  for (var c1 = 0; c1 < realP.length; c1++) {
    isRepresented = false
    for (var c2 = 0; c2 < fields.length; c2++) {
      if (realP[c1].x == fields[c2].x && realP[c1].y == fields[c2].y) {
        isRepresented = true
      }
    }
    if (isRepresented != true) {
      allRepresented = false
    }
  }
  
  return allRepresented

}

/* Return the opposite of param (0 if param 1, 1 if param 0) */
function makeOpposite(of) {
  if (of == 1) {
    return 0
  }
  else if (of == 0) {
    return 1
  }
  else {
    throw("wtf are you doing? (calling makeOpposite() with neither 0 nor 1)")
  }
}

/* Map coords to array index */
function mapCToA(obj) {
  return obj.y*4 + obj.x
}

