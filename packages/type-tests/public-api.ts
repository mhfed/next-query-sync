import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'next-query-sync';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

const [primitiveCount, setPrimitiveCount] = useQueryState('count', 0);
type PrimitiveCountIsNumber = Expect<Equal<typeof primitiveCount, number>>;
setPrimitiveCount(2);
setPrimitiveCount((current) => current + 1);
// @ts-expect-error primitive defaults produce a non-null setter contract
setPrimitiveCount(null);

const [defaultedPage, setDefaultedPage] = useQueryState(
  'page',
  parseAsInteger.withDefault(1)
);
type DefaultedPageIsNumber = Expect<Equal<typeof defaultedPage, number>>;
setDefaultedPage(2);
setDefaultedPage((current) => current + 1);
// @ts-expect-error ParserWithDefault values cannot be cleared with null
setDefaultedPage(null);

const [nullableQuery, setNullableQuery] = useQueryState('q', parseAsString);
type NullableQueryIsNullable = Expect<Equal<typeof nullableQuery, string | null>>;
setNullableQuery('hello');
setNullableQuery(null);
setNullableQuery((current) => current?.toUpperCase() ?? null);

const [params, setParams] = useQueryStates({
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});

type MultiPageIsNumber = Expect<Equal<typeof params.page, number>>;
type MultiQueryIsNullable = Expect<Equal<typeof params.q, string | null>>;

setParams({ page: 2 });
setParams({ page: (current) => current + 1 });
setParams({ q: null });
setParams({ q: (current) => current?.trim() ?? null });
// @ts-expect-error defaulted parser setters must remain non-null in useQueryStates
setParams({ page: null });

void primitiveCount;
void defaultedPage;
void nullableQuery;
