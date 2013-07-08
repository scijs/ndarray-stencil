"use strict"

var dup = require("dup")
var cwise = require("cwise")

function generateCWiseLoop(n, d, func, options) {
  var body_args = []
  var args = ["scalar", "array"]
  for(var i=0; i<n; ++i) {
    args.push("array")
    body_args.push("a"+i)
  }
  
  if(options.useIndex) {
    body_args.push("idx")
    args.push("index")
  }
  body_args.push(["out=func(",body_args.join(),")"].join(""))
  body_args.unshift("out")
  body_args.unshift("func")
  
  var loop = cwise({
    args: args,
    body: Function.apply(undefined, body_args),
    funcName: (func.name || "anon")+"_stencil",
    printCode: !!options.debug
  })
  
  return loop.bind(undefined, func)
}

function createSlice(name, lo, hi, point) {
  var noffset = [name + "_o"]
  for(var i=0; i<lo.length; ++i) {
    var offset = point[i]-lo[i]
    if(offset === 1) {
      noffset.push([name, "_s[", i, "]"].join(""))
    } else if(offset > 1) {
      noffset.push([name, "_s[", i, "]*",offset].join(""))
    } else if(offset < 0) {
      throw new Error("This should never happen")
    }
  }
  return ["new ", name, "_c(", name, "_d,nshape,", name, "_s,(", noffset.join("+"),")|0)"].join("")
}

function generateWrapper(points, lo, hi, loop, funcName, debug) {
  var n = points.length
  var d = lo.length
  var code = ["'use strict'"]
  var vars = ["s=out.shape,out_c=out.constructor,inp_c=inp.constructor,out_s=out.stride,inp_s=inp.stride,out_d=out.data,inp_d=inp.data,out_o=out.offset,inp_o=inp.offset"]
  var nshape = []
  for(var i=0; i<d; ++i) {
    vars.push(["s", i, "=s[", i, "]|0"].join(""))
    nshape.push(["(s", i, "-",hi[i]-lo[i], ")|0"].join(""))
  }
  vars.push(["nshape=[", nshape.join(), "]"].join(""))
  
  
  code.push(["return function ", funcName, "_stencil_wrapper(out,inp){"].join(""))
  code.push("var " + vars.join())
  
  var funcArgs = [ createSlice("out", lo, hi, dup(d)) ]
  for(var i=0; i<points.length; ++i) {
    funcArgs.push(createSlice("inp", lo, hi, points[i]))
  }
  code.push(["func(", funcArgs.join(), ")"].join(""))
  code.push("}")
  
  if(debug) {
    console.log("Generated stencil wrapper:\n\n", code.join("\n"))
  }
  
  var proc = new Function("func", code.join("\n"))
  return proc(loop)
}

function stencilOp(points, func, options) {
  options = options || {}
  if(points.length === 0) {
    throw new Error("ndarray-stencil: Need to specify at least one point for stencil")
  }
  var n = points.length
  var d = points[0].length
  var lo = dup(d)
  var hi = dup(d)
  for(var i=0; i<n; ++i) {
    var p = points[i]
    for(var j=0; j<d; ++j) {
      lo[j] = Math.min(lo[j], p[j])
      hi[j] = Math.max(hi[j], p[j])
    }
  }
  var cwiseLoop = generateCWiseLoop(n, d, func, options)
  return generateWrapper(points, lo, hi, cwiseLoop, options.funcName || func.name, options.debug)
}

module.exports = stencilOp