/*
 * This file is part of La Game.
 * Copyright 2009 Shahriar Heidrich and Jannik Schürg
 * 
 * La Game is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * La Game is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with La Game.  If not, see <http://www.gnu.org/licenses/>. 
 */

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
  
  /* Cache */
  this.cachedFields = []
  this.cachedVals = {pos: pos, rot: rot, inv: inv}

}

LPiece.prototype.copy = function() {
  var pos = this.pos.copy();
  var copy = new LPiece(pos, this.rot, this.inv, this.player);
  copy.cachedFields = this.cachedFields.copy();
  copy.cachedVals = {pos: pos, rot: this.rot, inv: this.inv};
  return copy;
};

LPiece.rVals = [
  [ new V2d(1,0), new V2d(2,0), new V2d(0,-1) ], // rot 0
  [ new V2d(-1,0), new V2d(0,-1), new V2d(0,-2) ], // rot 1
  [ new V2d(0,1), new V2d(-1,0), new V2d(-2,0) ], // rot 2
  [ new V2d(1,0), new V2d(0,1), new V2d(0,2) ]  // rot 3
]

LPiece.prototype.realise = function() {
  
  if (this.cacheIsUpToDate() == true) {
    return this.cachedFields
  }
  
  var fields = [ new V2d(this.pos.x, this.pos.y) ]
  var curRVals = LPiece.rVals[this.rot]
  var invMul = 1
  if (this.inv == true) {
    invMul = -1
  }
  
  var curField
  
  for (var c1 = 0; c1 < curRVals.length; c1++) {
    curField = curRVals[c1].copy()
    curField.x *= invMul
    curField.add(this.pos)
    fields.push(curField)
  }
  this.cachedFields = fields /* TODO: discuss: copy? */
  return fields

}

LPiece.prototype.realiseRot = function() {
  /* Realise the rot you're saying. Get it? Haha. Incredibly funny. */
  fields = this.realise()
  tempfields = fields.copy()
  for (var c1 = 0; c1 < fields.length; c1++) {
    tempfields[c1].x = fields[c1].y
    tempfields[c1].y = fields[c1].x
  }
  
  return tempfields
  
}

LPiece.prototype.isSame = function(rhs, rot) {

  var lhsFields
  
  if (rot == null || rot == 0) {
    lhsFields = this.realise()
  }
  else {
    console.log("realiserot")
    lhsFields = this.realiseRot()
  }
  
  var rhsFields = rhs
  
  var isRepresented = false
  var allRepresented = true
  
  for (var c1 = 0; c1 < lhsFields.length; c1++) {
    isRepresented = false
    for (var c2 = 0; c2 < rhsFields.length; c2++) {
      if (lhsFields[c1].isEqual(rhsFields[c2]) == true) {
        isRepresented = true
      }
    }
    if (isRepresented == false) {
      allRepresented = false
      break
    }
  }
  
  return allRepresented

}

/* ************************************************************************ */

/* PRIVATE */

/* ************************************************************************ */


LPiece.prototype.cacheIsUpToDate = function() {

  if (this.cachedFields.length == 0) {
    return false
  }
  
  if (
    this.pos != this.cachedVals.pos ||
    this.rot != this.cachedVals.rot ||
    this.inv != this.cachedVals.inv
  ) {
  
    return false
  
  }
  
  return true

}


