// function applyTo<V, R>(v: V, f: (v: V) => R) {
// 	return f(v)
// }

function applyTo(v, f) {
	return f(v)
}

console.assert(
	applyTo(42, x => x) === 42
)
