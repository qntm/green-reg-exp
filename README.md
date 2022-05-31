# green-reg-exp

This is a small library for parsing and manipulating regular expressions as objects, which I built mainly for my own use.

## Installation

```bash
npm install green-reg-exp
```

## Example

```js
import { intersection } from 'green-reg-exp'

console.log(intersection('abc...', '...def')) // 'abcdef'
```

## API

`greenRegExp` has the following methods:

### parse(string)

Parse a string and return an object representing the regular expression expressed by the string. Burrow around in the rest of this module's code to find things you can do with that object, if you care.

### intersection(...strings)

Parse all the strings as regular expressions, compute their intersection and return it as a new regular expression string.

### reduce(string)

Parse a string as a regular expression, apply some reduction heuristics to it to make it simpler, and return the result as a new string. Not as fully-featured as my old Python 3 project `greenery` was, yet.

### deAnchor(string)

All the regular expressions described so far are **implicitly anchored at the beginning and end** e.g. the regular expression `a` matches only a single string `'a'`, it does not match `'aa'` or `'cbabc'`. This is true of both inputs and outputs.

If your regular expression is not implicitly anchored in this way, pass it to this function to see it de-anchored. This typically involves introducing `.*` at the beginning and end of the expression. If your string contains anchors for the **beginning of the input** (`^`) or the **end of the input** (`$`), these will be handled correctly. Anchors for the beginning and end of lines cannot be handled this way.

```js
console.log(deAnchor('abc|^def$')) // '.*abc.*|def'
```

The result can then be used by the rest of `green-reg-exp`.
