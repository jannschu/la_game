/* 
 * Fields for all possible L-Piece positions
 * @see LaGameGUI#setLPiece
 * Reference point is always the edge of the L-Piece
 */
LPArrs = [
  [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y:-1 }], // 1. pos
  [{ x:-1, y: 0 }, { x: 0, y:-1 }, { x: 0, y:-2 }], // 2. pos
  [{ x: 0, y: 1 }, { x:-1, y: 0 }, { x:-2, y: 0 }], // 3. pos
  [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]  // 4. pos
]

/* British English */
function realisePiece(obj) {
  var retArr = new Array({ x:obj.x, y:obj.y })
  switch (obj.type) {
    case "n":
      return retArr
      break
    case "l": /* This should've been done in another way */
      for (var c1 = 0; c1 < LPArrs[obj.inv].length; c1++) {
        retArr.push (
          { x:LPArrs[obj.inv][obj.rot].x+obj.x,
            y:LPArrs[obj.inv][obj.rot].y+obj.y }
        )
      }
      return retArr /* FIXME: Need to add the LPArr vals to the obj.x/y vals [SHOULDWORKNOW] */
      break
  }
}

/* Map coords to array index */
function mapCToA(obj) {
  return obj.y*4 + obj.x
}

