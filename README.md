ndarray-stencil
===============
Stencil iterators for [ndarrays](https://github.com/mikolalysenko/ndarray).  This code can be used to implement things like cellular automata or various PDE operations on ndarrays.

## Example

```javascript
var zeros = require("zeros")

var points = [[-1, 0], [1, 0], [0,-1], [0, 1]]

var diffuse = require("ndarray-stencil")(points, function(a, b, c, d) {
  return 0.25 * (a + b + c + d)
})

var x = zeros([5,5])
var y = zeros([5,5])

x.set(2,2,1)

diffuse(y, x)

//Now:
//
// y =[ [ 0, 0,    0,    0,    0 ],
//      [ 0, 0,    0.25, 0,    0 ],
//      [ 0, 0.25, 0,    0.25, 0 ],
//      [ 0, 0,    0.25, 0,    0 ],
//      [ 0, 0,    0,    0,    0 ] ]
```

## Install

```sh
npm install ndarray-stencil
```

### `require("ndarray-stencil")(points, stencil_func[, options])`
Creates a stencil operator for an ndarray.  

* `points` is a list of points that the stencil will be evaluated on
* `stencil_func(...)` is a function that takes in n arguments, where `n` is the number points to evaluate the stencil on, and returns the new value of the grid on the given point.
* `options` is an object containing a list of optional properties:
    + `useIndex` If this flag is set, add an extra index parameter as the last argument to `stencil_func`.  (Default `false`)
    + `sameOutput` if set, then the output is not sliced and instead the result of the stencil operation is applied directly to output

**Returns** A function that applies the stencil to two arrays.  The first argument is the output array, and the second is the input.

## Credits
(c) 2013 Mikola Lysenko. MIT License