
function V2d(x, y) {

  this.x = x
  this.y = y

}


function V2d.prototype.add = function(rhs) {

  this.x += rhs.x
  this.y += rhs.y
  
  return this

}

function V2d.prototype.sub = function(rhs) {

  this.x -= rhs.x
  this.y -= rhs.y
  
  return this

}

function V2d.prototype.isEqual = function (rhs) {

  if (this.x == rhs.x && this.y == rhs.y) {
    return true
  }
  
  return false

}
