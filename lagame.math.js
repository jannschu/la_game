
function V2d(x, y) {

  this.x = x
  this.y = y

}


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

/* Field add */
V2d.prototype.fadd = function (rhs) {
  var tempX = this.x + rhs.x
  var modRem = tempX % 4
  var incrX = modRem
  var incrY = (tempX-modRem)/4
  
  this.x += this.x + incrX
  this.y += this.y + rhs.y + incrY
  
  return this
}

/* Field sub */
V2d.prototype.fsub = function (rhs) {
  this.fadd(new V2d(-rhs.x, -rhs.y))
  
  return this
}

V2d.prototype.isEqual = function (rhs) {

  if (this.x == rhs.x && this.y == rhs.y) {
    return true
  }
  
  return false

}

V2d.prototype.isOob = function () {
  
  if (this.x < 0 || this.y < 0 || this.x > 3 || this.y > 3) {
    return true
  }
  
  return false
  
}

