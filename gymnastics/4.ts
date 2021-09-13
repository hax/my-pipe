import { $, spread$, ValidLength, FixedArgList$, FixedArgListSpread$, partialReturn } from './3'


export type AnalysePipeLinkedCall<T extends any[], LastFunc extends (...args: any) => any = () => Parameters<T[0]>, R extends ((...args: any) => any)[] = [], LastReturn extends any = ReturnType<LastFunc>> =
	T['length'] extends ValidLength ?
	(
		T extends [infer Head, ...infer Last] ?
		(
			Head extends (...args: infer Args) => infer HR ?
			(
				/**
				 * 先尝试取出下一个参数，看是不是数组参数，再决定怎么做
				 */
				(Last extends [infer WantArr, ...any[]] ? WantArr extends readonly any[] ? true : false : false) extends true ?
				(
					// 下一个参数是数组
					Last extends [infer Arr, ...infer NextT] ?
					Arr extends readonly any[] ?
					[...Arr] extends FixedArgList$<Parameters<Head>> | FixedArgListSpread$<Parameters<Head>> ?
					AnalysePipeLinkedCall<NextT, partialReturn<Args, [...Arr], HR>, [...R, partialReturn<Args, [...Arr], HR>]>
					: 1
					: 2
					: 3
				)
				:
				(
					//下一个参数是函数或者已经是T末尾
					[LastReturn] extends Args ?
					AnalysePipeLinkedCall<Last, Head, [...R, Head]>
					: never
				)
			)
			:
			never
		)
		:
		R
	)
	:
	never
	;

type pipeReturn<T extends any[]> =
	AnalysePipeLinkedCall<T> extends infer Funcs ?
	Funcs extends [infer First, ...((...args: any) => any)[], infer Last] ?
	First extends (...args: any) => any ?
	Last extends (...args: any) => any ?
	(arg: Parameters<First>) => ReturnType<Last>
	: never
	: never
	: never
	: never;

function pipe<T extends any[]>(...args: T): pipeReturn<T> {
	return {} as pipeReturn<T>;
	// const fnList = []
	// nextFunc: for (let i = 0; i < args.length;) {
	// 	let fn = args[i++]
	// 	if (typeof fn !== 'function') throw new TypeError()
	// 	while (i < args.length) {
	// 		let a = args[i++]
	// 		if (typeof a === 'function') {
	// 			fnList.push(fn)
	// 			fn = a
	// 			continue
	// 		}
	// 		if (Array.isArray(a)) {
	// 			fnList.push(partial(fn, a))
	// 			continue nextFunc
	// 		}
	// 		throw new TypeError()
	// 	}
	// 	fnList.push(fn)
	// }

	// return v => {
	// 	for (const fn of fnList) {
	// 		v = fn(v)
	// 	}
	// 	return v
	// }
}

const minus = (a, b) => a - b

// (arg: number[]) => number
const f = pipe(
	Math.max, [spread$] as const,
	Math.sqrt,
	minus, [$, 10] as const,
	Math.abs,
)
console.assert(
	f([1, 5, 9]) === 7
)
