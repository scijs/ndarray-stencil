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


  var addIdx = createStencil([[-1, 0], [1,0], [0,-1], [0,1]], function(a,b,c,d, i) {
    return 0.25*(a+b+c+d) + i[0]*10 + i[1]
  }, { useIndex: true })
  
  addIdx(y, x)
  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 1.25, 2, 0],
    [0, 10.25, 11, 12.25, 0],
    [0, 20, 21.25, 22, 0],
    [0, 0, 0, 0, 0]])


  t.end()
})