const spread$ = Object.freeze(Object.create(null))
export const $ = Object.create(null)
$[Symbol.iterator] = function *() { yield spread$ }
Object.freeze($)

export function partial(fn, argList) {
	return x => {
		let args = []
		for (const arg of argList) {
			if (arg === $) args.push(x)
			else if (arg === spread$) args.push(...x)
			else args.push(arg)
		}
		return fn(...args)
	}
}

const wrapArray = partial(Array.of, ['begin', ...$, 'end'])
const a = wrapArray([1, 2, 3])

console.assert(
	a.join(' ') === 'begin 1 2 3 end'
)
