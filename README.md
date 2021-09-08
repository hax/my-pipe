# my-pipe
 Just another JS library for pipe functions

## Basic Usage

`pipe.of()` create a pipeline of function invokings so that `pipe.of(a, b, c)` create a function which have same behavior with `x => c(b(a(x)))`

```js
function doubleSay(str, sep = ", ") {
	return str + sep + str
}
function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
}
function exclaim(str) {
	return str + '!'
}

import {pipe} from 'my-pipe'

let f = pipe.of(
	doubleSay,
	exclaim,
	capitalize,
) // x => capitalize(exclaim(doubleSay(x)))

f('hello') // "Hello, hello!"
```

## Extensions Usage

`pipe` could be used as extensions method as [Extensions and `::` notation proposal](https://github.com/tc39/proposal-extensions).

```js
import ::{pipe} from 'my-pipe'

'hello'::pipe(
	doubleSay,
	exclaim,
	capitalize,
) // "Hello, hello!"
```

Note, features of extensions and `::` are only in stage 1 as TC39 process. Currently you could use:

```js
import {pipe} from 'my-pipe'

pipe.apply('hello', [
	doubleSay,
	exclaim,
	capitalize,
]) // "Hello, hello!"
```

## Usage with `$` topic variable

```js
import {pipe, $} from 'my-pipe'

pipe.apply('hello', [
	doubleSay, [$, ' ~ '], // x => doubleSay(x, ' ~ ')
	exclaim,
	capitalize,
]) //=> "Hello ~ hello!"
```

## Use `$` as `this` argument for methods

```js
import {pipe, $} from 'my-pipe'

pipe.apply('hello', [
	doubleSay, [$, ' ~ '],
	$.concat, ['!'], // x => x.concat('!')
	capitalize,
]) //=> "Hello ~ hello!"
```

```js
pipe.apply(' hello ', [
	$.trim, // x => x.trim()
	capitalize,
	$[0], // x => x[0]
]) // 'H'
```

Note, if `$.foo` is a method, it will always be invoked even no argument list was given.
In the rare case you want to get a function object, use `Reflect.get, [$, 'foo']`.

Also support reusing other methods.
```js
pipe.apply(document.all, [
	$, Array.prototype.slice, [0, 10], // x => Array.prototype.slice.apply(x, [0, 10])
])
```

## Use of `then`

```js
import {pipe, $} from 'my-pipe'

pipe.apply(promise, [
	`then`,
	doubleSay, [$, ' ~ '],
	capitalize,
	exclaim,
	x => stream.write(x),
	`then`,
	console.log,
])
```

It could be seen the sugar of
```js
promise.then(pipe.of(
	doubleSay, [$, ' ~ '],
	capitalize,
	exclaim,
	x => stream.write(x),
))
.then(pipe.of(
	console.log,
))
```
