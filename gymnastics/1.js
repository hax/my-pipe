function pipe(...fnList) {
	return v => {
		for (const fn of fnList) {
			v = fn(v)
		}
		return v
	}
}

const double = x => x + x
const negative = x => -x
const f = pipe(Math.sqrt, negative, double, Math.abs)
console.assert(
	f(100) === 20
)
