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

Array.prototype.copy = function() {
  var copyArray = [];
  var e;
  for (var i = 0; i < this.length; ++i) {
    e = this[i];
    if (e !== undefined && e !== null) {
      // if (!this[i].copy) console.log(this[i])
      copyArray[i] = e.copy();
    } else {
      copyArray[i] = e;
    }
  }
  return copyArray;
};

var valCopy = function() { return this };

Number.prototype.copy = valCopy;
String.prototype.copy = valCopy;
Boolean.prototype.copy = valCopy;

/* Return the opposite of param (0 if param 1, 1 if param 0) */
function makeOpposite(of) {
  if (of == 1) {
    return 0
  }
  else if (of == 0) {
    return 1
  }
  else {
    console.log(of)
    console.trace()
    throw("wtf are you doing? (calling makeOpposite() with neither 0 nor 1)")
  }
}
