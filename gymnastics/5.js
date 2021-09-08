import {partial, $} from './3.js'

const then = Symbol()

function pipe(...args) {
	const fnList = []
	nextFunc: for (let i = 0; i < args.length;) {
		let fn = args[i++]
		if (typeof fn !== 'function') throw new TypeError()
		while (i < args.length) {
			let a = args[i++]
			if (typeof a === 'function') {
				fnList.push(fn)
				fn = a
				continue
			}
			if (Array.isArray(a)) {
				fnList.push(partial(fn, a))
				continue nextFunc
			}
			throw new TypeError()
		}
		fnList.push(fn)
	}

	return v => {
		for (const fn of fnList) {
			v = fn(v)
		}
		return v
	}
}

const minus = (a, b) => a - b

const f = pipe(
	Math.max, [...$],
	Math.sqrt,
	minus, [$, 10],
	Math.abs,
)
console.assert(
	f([1, 5, 9]) === 7
)
