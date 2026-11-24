import SearchResults from './SearchResults';

// /search?q=jake - full results for the navbar search box
export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  return <SearchResults q={typeof q === 'string' ? q : ''} />;
}
