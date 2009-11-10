/**
 * Object representing the gui
 * All drawing is done here
 * @param {HTMLCanvasElement} canvas
 * @constructor
 */
function LaGameGUI(canvas) {
  
};

/*****************************************************************************/
/*                                DRAWING                                    */
/*****************************************************************************/

/**
 * Places a neutral game piece
 * @param {Number} x Horizontal position from top left
 * @param {Number} y Vertical position from top left
 * @param {Number} player The player: 1 or 2
 * @param {Boolean} choosing true if it should print the L-Piece in the 'user 
 * chooses a positon' mode (maybe transparent)
 */
LaGameGUI.prototype.setNeutral = function(x, y, player, choosing) {
  
};

/**
 * @param {Number} x Horizontal position from top left
 * @param {Number} y Vertical position from top left
 */
LaGameGUI.prototype.unsetNeutral = function(x, y) {
  
};

/**
 * @see #setNeutral
 * @param {Number} position Can be 0, 1, 2, 3
 * Starting by 0 and then rotated anti-clockwise:
 * 0: #    1:  #  2: ###  3: ##
 *    ###      #       #     #
 *            ##             #
 * @param {Boolean} inversed true if the above should be flipped horizontal
 */
LaGameGUI.prototype.setLPiece = function(x, y, position, inversed, player, choosing) {
  
};
/**
 * @see #setLPiece
 * @see #unsetNeutral
 */
LaGameGUI.prototype.unsetLPiece = function(x, y, position, inversed) {
  
};

/**
 * Draws the basic game board with its borders and lines
 */
LaGameGUI.prototype.drawGameBoard = function() {
  
};