const $ = Object.freeze(Object.create(null))

function partial(fn, argList) {
	return x => {
		const args = argList.map(arg => arg === $ ? x : arg)
		return fn(...args)
	}
}

const minus = (a, b) => a - b
const f1 = partial(minus, [$, 1])
const f2 = partial(minus, [1, $])

console.assert(
	f1(10) === 9
)
console.assert(
	f2(10) === -9
)
