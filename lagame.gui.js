/**
 * Object representing the gui
 * All drawing is done here
 * @param {HTMLCanvasElement} canvas
 * @constructor
 */
function LaGameGUI(canvas, playerLabel) {
  this.canvas = canvas;
  this.playerLabel = playerLabel;
  this.border = 4;
  
  if (canvas.width != canvas.height) alert('Canvas should be quadratic');
  
  this.boardSize = canvas.width; // public
  this.fieldSize = (this.boardSize - 5 * this.border) / 4; // public

  this.lColor = ['red', 'blue', 'white'];
};

LaGameGUI.prototype.setPlayerLabel = function(text, player) {
  this.playerLabel.innerHTML = text;
  this.playerLabel.style.color = this.lColor[player];
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
  ctx.fillStyle = choosing ? 'rgba(0, 0, 0, 0.6)' : 'black';
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
  ctx.fillStyle = this.lColor[player];
  if (choosing) ctx.globalAlpha = 0.5
  var canX, canY;
  for(var i = 0; i < fields.length; ++i) {
    canX = (this.border + this.fieldSize) * fields[i].x + this.border;
    canY = (this.border + this.fieldSize) * fields[i].y + this.border;
    ctx.fillRect(canX, canY, this.fieldSize, this.fieldSize);
  }
  ctx.globalAlpha = 1;
};
/**
 * @see #setLPiece
 * @see #unsetNeutral
 */
LaGameGUI.prototype.unsetLPiece = function(x, y, rotation, inversed) {
  this.setLPiece(x, y, rotation, inversed, 2);
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