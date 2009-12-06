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

function V2d(x, y) {
  this.x = x
  this.y = y
}

V2d.prototype.copy = function() { return new V2d(this.x, this.y) };

V2d.prototype.add = function(rhs) {
  this.x += rhs.x
  this.y += rhs.y
  
  return this
}

V2d.prototype.sub = function(rhs) {
  this.x -= rhs.x
  this.y -= rhs.y
  
  return this
}

/**
 * Adds the vector, but the new vector will always be
 * relative to the box
 */
V2d.prototype.addInBox = function(rhs) {
  var xSum = Math.abs(rhs.x + this.x);
  this.x = xSum % 4;
  this.y = Math.abs(rhs.y + this.y + Math.floor(xSum / 4)) % 4;
  return this
}

/**
 * Subtracts the vector, but the new vector will always be
 * relative to the box
 */
V2d.prototype.subInBox = function(rhs) {
  this.addInBox(new V2d(-rhs.x, -rhs.y))
  return this
}

V2d.prototype.isEqual = function(rhs) {
  return this.x == rhs.x && this.y == rhs.y
}

V2d.prototype.isOutOfBox = function() {
  return this.x < 0 || this.y < 0 || this.x > 3 || this.y > 3
}

V2d.prototype.rotateAntiClockwise = function() {
  var tempX = this.x
  this.x = this.y
  this.y = tempX
  
  return this
}

V2d.prototype.condRot = function(rot) {
  
  if (rot == null || rot == 0) {
    return this
  }
  else {
    return this.rotateAntiClockwise()
  }

}

