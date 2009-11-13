/**
 * Object representing the gui
 * All drawing is done here
 * @param {HTMLCanvasElement} canvas
 * @constructor
 */
function LaGameGUI(canvas) {
  this.canvas = canvas;
  this.border = 4;
  
  if (canvas.width != canvas.height) alert('Canvas should be quadratic');
  
  this.boardSize = canvas.width;
  this.fieldSize = (this.boardSize - 5 * this.border) / 4;

  this.lColor = ['red', 'blue', 'white'];
};

/*****************************************************************************/
/*                                DRAWING                                    */
/*****************************************************************************/

/**
 * Places a neutral game piece
 * @param {Number} x Horizontal position from top left
 * @param {Number} y Vertical position from top left
 * @param {Boolean} choosing true if it should print the L-Piece in the 'user 
 * chooses a positon' mode (maybe transparent)
 */
LaGameGUI.prototype.setNeutral = function(x, y, choosing) {
  var canX = (this.border + this.fieldSize) * x + this.fieldSize / 2 + this.border;
  var canY = (this.border + this.fieldSize) * y + this.fieldSize / 2 + this.border;
  var ctx = this.canvas.getContext('2d');
  ctx.beginPath();
  var alpha = choosing ? '0.4' : '1';
  ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
  ctx.arc(canX, canY, this.fieldSize / 2, 0, Math.PI * 2, true);
  ctx.fill();
};

/**
 * @param {Number} x Horizontal position from top left
 * @param {Number} y Vertical position from top left
 */
LaGameGUI.prototype.unsetNeutral = function(x, y) {
  var canX = (this.border + this.fieldSize) * x + this.border;
  var canY = (this.border + this.fieldSize) * y + this.border;
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(canX, canY, this.fieldSize, this.fieldSize);
};

/**
 * @see #setNeutral
 * @param {Number} rotation Can be 0, 1, 2, 3
 * Starting by 0 and then rotated anti-clockwise:
 * 0: #    1:  #  2: ###  3: ##
 *    ###      #       #     #
 *            ##             #
 * @param {Boolean} inversed true if the above should be flipped horizontal
 */
LaGameGUI.prototype.setLPiece = function(x, y, rotation, inversed, player, choosing) {
  var fields = realisePiece({x:x, y:y, rot:rotation, inv:inversed, type:"l"});
  
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = this.lColor[player - 1];
  
  var canX, canY;
  for(var i = 0; i < fields.length; ++i) {
    canX = (this.border + this.fieldSize) * fields[i].x + this.border;
    canY = (this.border + this.fieldSize) * fields[i].y + this.border;
    ctx.fillRect(canX, canY, this.fieldSize, this.fieldSize);
  }
};
/**
 * @see #setLPiece
 * @see #unsetNeutral
 */
LaGameGUI.prototype.unsetLPiece = function(x, y, rotation, inversed) {
  this.setLPiece(x, y, rotation, inversed, 3);
};

/**
 * Draws the basic game board with its borders and lines
 */
LaGameGUI.prototype.drawGameBoard = function() {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, this.boardSize, this.boardSize);
  ctx.fillStyle = 'black';
  var pos;
  for (var i = 0; i < 5; ++i) {
    pos = (this.border + this.fieldSize) * i;
    ctx.fillRect(pos, 0, this.border, this.boardSize);
    ctx.fillRect(0, pos, this.boardSize, this.border);
  }
};

/*****************************************************************************/
/*                                PRIVATE                                    */
/*****************************************************************************/

// See lagame.tools.js for new version of this function
// just keep this one temporary
LaGameGUI.getFieldsForL = function(xx, yy, rotation, inversed) {
  var fields = [{x:xx, y:yy}, {x:xx, y:yy-1}, {x:xx+1, y: yy}, {x:xx+2, y: yy}];
  return fields;
}
