# lnwatch

[![Build Status](https://travis-ci.org/necccc/lnwatch.svg?branch=master)](https://travis-ci.org/necccc/lnwatch)

Small utility for node, to watch symlink changes.

---

### Usage

```
var lnw = require('../lnwatch.js')

lnw.on('change', function (data) {
	console.log('LINK CHANGED', data);
})

lnw.add([
	'./foo',
	'./qux',  // nonexistent link, ignored
	'./bar'
])

```

### Methods

##### lnwatch.add(links)

Add links to watch, can be a single link path string, or several in an array.
Nonexistent links will be ignored.

##### lnwatch.remove([links])

Remove watched links, can be a single link path string, or several in an array.
Nonexistent links will be ignored.

##### lnwatch.removeAll()

Remove all watched links.

### Events

##### lnw.on('change', callback)

Fired when one of the watched link changes target. Receives data about what changed:

- which link, 
- from what target, 
- to which target 

**Example:**


```

lnw.on('change', function (data) {
	console.log(data);
})

/* 

outputs:

{ 
  link: '/Users/nec/github/lnwatch/tests/bar',
  from: '/Users/nec/github/lnwatch/tests/two',
  to: '/Users/nec/github/lnwatch/tests/three' 
}

*/

```

