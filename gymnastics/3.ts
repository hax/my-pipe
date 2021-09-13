export const $ = Symbol();
export type $ = typeof $;

export const spread$ = Symbol();
export type spread$ = typeof spread$;

export type ValidLengthArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
export type ValidLength = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export type Add<C extends ValidLength> = ValidLengthArray extends [number, ...infer Last] ? C extends keyof Last ? Last[C] : never : never;

type ReduceHelper = [-1, ...ValidLengthArray];
export type Reduce<C extends ValidLength> = C extends keyof ReduceHelper ? ReduceHelper[C] : never;

type IndexsFromZero<C extends ValidLength> = ClipFiniteArray<ValidLengthArray, C>[keyof ClipFiniteArray<ValidLengthArray, C> & number];
type NullArray = [];


type Repeat<T, L extends ValidLength> = RepeatFromArray<T, ClipFiniteArray<ValidLengthArray, L>>;
type RepeatUnion<T, L extends ValidLength> = L extends 0 ? [] : Reduce<L> extends ValidLength ? [T, ...RepeatUnion<T, Reduce<L>>] | RepeatUnion<T, Reduce<L>> : never;

type RepeatFromArray<T, Arr extends any[]> =
  Arr['length'] extends ValidLength ?
  Arr extends [any, ...infer Last] ? [T, ...RepeatFromArray<T, Last>] : []
  : never;

// 工具类型，截取数组的前K项作为元组
export type ClipFiniteArray<Arr extends any[], K extends ValidLength, Current extends any[] = []> =
  Current['length'] extends K ?
  Current :
  Arr extends [infer Head, ...infer Last] ?
  ClipFiniteArray<Last, K, [...Current, Head]>
  : NullArray
  ;

// 工具类型，截取数组的前K项作为元组
export type SliceFiniteArray<Arr extends any[], Begin extends ValidLength, End extends ValidLength> =
  Arr extends [...infer Last, ...ClipFront<Arr, End>,] ? ClipFront<Last, Begin> : never;
;

// 找到数组可数的前、后半段，和中间不可数部分
export type SplitInfiniteArrayFront<Arr extends any[]> = Arr extends [infer head, ...infer Last] ? [head, ...SplitInfiniteArrayFront<Last>] : NullArray;
export type SplitInfiniteArrayBehind<Arr extends any[]> = Arr extends [...infer Last, infer tail] ? [...SplitInfiniteArrayBehind<Last>, tail] : NullArray;
export type SplitInfiniteArrayMiddle<Arr extends any[]> = Arr extends [...SplitInfiniteArrayFront<Arr>, ...infer M, ...SplitInfiniteArrayBehind<Arr>] ? M : NullArray;

// 规定数组的任意元素还可以是$
export type FixedArgList$<Arr extends any[]> = Arr['length'] extends ValidLength ? ChangedArgListFinite<Arr, $> : ChangedArgListInfinite<Arr, $>;

// 规定数组的任意元素还可以是spread$
// export type FixedArgListSpread$<Arr extends any[]> = Arr['length'] extends ValidLength ? ChangedArgListFinite<Arr, spread$> : ChangedArgListInfinite<Arr, spread$>;

// 规定数组的任意子串还可以是spread$
export type FixedArgListSpread$<Arr extends any[]> =
  Arr['length'] extends ValidLength ?
  // 有限
  (
    IndexsFromZero<Add<Arr['length']>> extends infer A ?
    IndexsFromZero<Add<Arr['length']>> extends infer B ?
    A extends ValidLength ?
    B extends ValidLength ?
    A extends IndexsFromZero<B> ?
    [...SliceFiniteArray<Arr, 0, A>, spread$, ...SliceFiniteArray<Arr, B, Arr['length']>]
    : never
    : never
    : never
    : never
    : never
  )
  :
  // 无限
  (
    IndexsFromZero<Add<SplitInfiniteArrayFront<Arr>['length']>> extends infer A ?
    IndexsFromZero<Add<SplitInfiniteArrayBehind<Arr>['length']>> extends infer B ?
    A extends ValidLength ?
    B extends ValidLength ?
    SplitInfiniteArrayMiddle<Arr>[0] extends infer T ?
    [
      ...SliceFiniteArray<SplitInfiniteArrayFront<Arr>, 0, A>,
      ...RepeatUnion<T, 10>,
      spread$,
      ...RepeatUnion<T, 10>,
      ...SliceFiniteArray<SplitInfiniteArrayBehind<Arr>, B, SplitInfiniteArrayBehind<Arr>['length']>]
    : never
    : never
    : never
    : never
    : never
  );

export type ChangedArgListInfinite<Arr extends any[], Flag> = [
  ...ChangedArgListFinite<SplitInfiniteArrayFront<Arr>, Flag>,
  ...(SplitInfiniteArrayMiddle<Arr>[0] | Flag)[],
  ...ChangedArgListFinite<SplitInfiniteArrayBehind<Arr>, Flag>
];
export type ChangedArgListFinite<Arr extends readonly any[], Flag> = Arr['length'] extends ValidLength ?
  Arr extends [infer Head, ...infer Last] ? [Head | Flag, ...ChangedArgListFinite<Last, Flag>] : []
  : never;

// 验证数组中有且只有一个spread$
export type AssertOnlyOneSpread$<T extends readonly any[], Result extends readonly any[] = T> = T['length'] extends ValidLength ?
  T extends [infer C, ...infer Last] ? C extends spread$ ? (spread$ extends Last[keyof Last] ? never : Result) : AssertOnlyOneSpread$<Last, Result> : never
  : never;

/**
 * 使用$的对应参数列表
 */
export type ReturnType$<Args extends any[], T extends any[], C extends ValidLength = 0, Return extends any[] = []> =
  T['length'] extends ValidLength ?
  C extends T['length'] ? Return :
  (
    C extends (keyof T & keyof Args) ?
    (
      ReturnType$<Args, T, Add<C>, T[C] extends $ ? [...Return, Args[C]] : Return>
    )
    : never
  )
  : never;

export type ReturnTypeSpread$<Args extends any[], T extends any[]> =
  T['length'] extends 0 ? never :
  T['length'] extends ValidLength ?
  T extends [spread$] ? Args :
  (
    T[0] extends spread$ ? ReturnTypeCloseBehind<Args, T> : ReturnTypeSpread$<ClipFront<Args>, ClipFront<T>>
  ) : never;

// 将拆除后面的单独提出来，防止递归过深
type ReturnTypeCloseBehind<Args extends any[], T extends any[]> =
  T['length'] extends ValidLength ?
  T extends [spread$] ? Args :
  (
    ReturnTypeCloseBehind<ClipBehind<Args>, ClipBehind<T>>
  ) : never;

export type ClipFront<Args extends any[], N extends number = 1> = N extends ValidLength ? N extends 0 ? Args : Args extends [infer Head, ...infer Last] ? Reduce<N> extends ValidLength ? ClipFront<Last, Reduce<N>> : never : Args : never;

export type ClipBehind<Args extends any[], N extends number = 1> = N extends ValidLength ? N extends 0 ? Args : Args extends [...infer Last, infer Tail] ? Reduce<N> extends ValidLength ? ClipBehind<Last, Reduce<N>> : never : Args : never;

export type NoSpread$Tuple<T extends any[]> = T['length'] extends ValidLength ?
  spread$ extends T[keyof T] ? never : T
  : never;

export function partial<Args extends any[], T extends FixedArgList$<Args>, R extends any>(fn: (...args: Args) => R, argList: T & NoSpread$Tuple<T>):
  (...args: ReturnType$<Args, T>) => R;

export function partial<Args extends any[], T extends FixedArgList$<Args>, R extends any>(fn: <P extends Args>(...args: P) => R, argList: T & NoSpread$Tuple<T>):
  (...args: ReturnType$<Args, T>) => R;

export function partial<Args extends any[], T, R extends any>(fn: (...args: Args) => R, argList: T):
  T extends readonly [...FixedArgListSpread$<Args>] ?
  T extends readonly [...AssertOnlyOneSpread$<[...T]>] ?
  (...args: ReturnTypeSpread$<Args, [...T]>) => R : never : never;
export function partial<Args extends any[], T, R extends any>(fn: (...args: Args) => R, argList: T) {
  // 具体实现先注释掉
  // @ts-ignore
  // return x => {
  //   let args = []
  //   for (const arg of argList) {
  //     if (arg === $) args.push(x)
  //     else if (arg === spread$) args.push(...x)
  //     else args.push(arg)
  //   }
  //   return fn(...(args as K))
  // }
  return {} as any;
}

// export interface partialReturn<Args extends any[], T extends FixedArgList$<Args> | FixedArgListSpread$<Args>, R extends any>

export type partialReturn<Args extends any[], T extends FixedArgList$<Args> | FixedArgListSpread$<Args>, R extends any> =
  T extends NoSpread$Tuple<T> ?
  (...args: ReturnType$<Args, T>) => R :
  T extends AssertOnlyOneSpread$<T> ?
  (...args: ReturnTypeSpread$<Args, T>) => R :
  never;


type b1 = partialReturn<[a: number, b: string, c: boolean], [spread$, boolean], symbol>;
type b2 = partialReturn<[boolean, string, ...number[], symbol], [boolean, spread$], 1>;

// (args_0: number, args_1: number, args_2: string) => number
const r1 = partial((a: number, b: number, c: number, d: string) => 1, [$, $, 2, $]);

// (args_0: number) => number
const r2 = partial((...args: number[]) => 1, [1, $, 2]);

// (b: number) => number
const r3 = partial((a: number, b: number, c: number) => 1, [1, spread$, 2] as const);

// (...args: number[]) => number
const r4 = partial((...args: number[]) => 1, [spread$, 2] as const);

// (args_0: any) => any
const r5 = partial(<T>(...args: T[]) => void 0, ['begin', $, 'end']);

// (args_0: any) => unknown[]
const r6 = partial(Array.of, ['begin', $, 'end']);

// (...args: any[]) => any[]
const r7 = partial(Array.of, ['begin', spread$, 'end'] as const);

//  (a: number, b: number) => number
const r8 = partial((a: number, b: number, c: number) => 1, [spread$, 2] as const);

//  (...args: any[]) => any[]
const wrapArray = partial(Array.of, ['begin', spread$, 'end'] as const);
const a = wrapArray([1, 2, 3])

console.assert(
  a.join(' ') === 'begin 1 2 3 end'
)