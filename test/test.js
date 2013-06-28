"use strict"

var zeros = require("zeros")
var unpack = require("ndarray-unpack")
var createStencil = require("../stencil.js")

require("tape")("ndarray-stencil", function(t) {

  var diffuse = createStencil([[-1, 0], [1,0], [0,-1], [0,1]], function(a,b,c,d) {
    return 0.25*(a+b+c+d)
  })

  var x = zeros([5,5])
  x.set(2,2,1)
  
  var y = zeros([5,5])
  diffuse(y, x)

  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0.25, 0, 0.25, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0, 0, 0, 0]])

  t.end()
})