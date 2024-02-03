import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import { searchGoogle } from '../services/serpapi';
import { createNewQuery, summarizeSearchResults } from '~/services/openai';
import { LibrarySquare, Loader2, TextSearch } from 'lucide-react';
import { cache } from '~/services/cache';
import SourceCard from '~/components/SourceCard';
import { useEffect, useState } from 'react';
import SearchForm from '~/components/SearchForm';

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview | Haji' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Uses zodix to parse the query string and grabs the "q" parameter
  const { q, prevContext } = zx.parseQuery(args.request, {
    q: z.string().optional(),
    prevContext: z.string().optional(),
  });

  // If there's no search query, return an empty response
  if (!q) {
    return json({ q: '', searchResults: [], summary: '' });
  }

  // Create a new cache key for the search query and the previous context
  const cacheKey = JSON.stringify({
    query: q,
    context: prevContext,
  });

  // Check if the query is already in the cache
  if (cache.has(cacheKey)) {
    const data = cache.get(cacheKey);

    if (data) {
      return json({
        q,
        searchResults: data.searchResults,
        summary: data.summary,
      });
    }
  }

  // Decode the previous content if it exists
  let previousContext;
  try {
    previousContext = prevContext
      ? JSON.parse(decodeURIComponent(prevContext))
      : null;
  } catch (error) {
    console.error('Error parsing previous context', error);
  }

  if (previousContext) {
    // Using OpenAI, create a new search query based on the previous context and the current search query
    const newQuery = await createNewQuery({
      query: q,
      previousContext,
    });

    // Create a new cache key for the new query and the previous context
    const newCacheKey = JSON.stringify({
      query: newQuery,
      context: prevContext,
    });

    // Check if the new query is in the cache, we need this check in case the LLM creates the same query
    if (cache.has(newCacheKey)) {
      const data = cache.get(newCacheKey);

      if (data) {
        return json({
          q: newQuery,
          searchResults: data.searchResults,
          summary: data.summary,
        });
      }
    }

    // Get the search results for the new query
    const newSearchResults = await searchGoogle(newQuery);

    // Use Dextar to summarize the search results
    const newSummary = await summarizeSearchResults({
      query: newQuery,
      searchResults: newSearchResults,
      previousContext,
    });

    return json({ q, searchResults: newSearchResults, summary: newSummary });
  }

  // If there's a search query, search Google and return the results
  const searchResults = await searchGoogle(q);

  // Use Dextar to summarize the search results
  const summary = await summarizeSearchResults({
    query: q ?? '',
    searchResults,
    previousContext,
  });

  // Cache the results and summary to in memory cache using the cache service
  await cache.set(cacheKey, { searchResults, summary });

  return json({ q, searchResults, summary });
}

export default function Index() {
  const { q, searchResults, summary } = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  const [prevContext, setPrevContext] = useState('');

  // When new data is loaded, updated the prevContext
  useEffect(() => {
    if (q && summary) {
      const newContext = {
        query: q,
        summary,
      };

      setPrevContext(encodeURIComponent(JSON.stringify(newContext)));
    }
  }, [q, summary]);

  return (
    <main className="flex flex-col h-screen items-center justify-center bg-slate-200 gap-8">
      <section className="w-11/12 lg:w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-b-slate-400 pb-4">
          <h1 className="text-2xl font-medium">
            Welcome to the Dexa coding interview!
          </h1>
          <p className="text-sm text-gray-600">
            See the readme for instructions.
          </p>
        </div>

        {/* Summary & Sources */}
        <div>
          <h2 className="text-3xl mb-6">{q}</h2>

          {/* Sources */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mb-6">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <LibrarySquare />
                Sources
              </h3>

              <ul className="flex flex-row gap-2 overflow-x-scroll">
                {searchResults.map((result) => (
                  <SourceCard
                    key={result.link}
                    title={result.title}
                    link={result.link}
                  />
                ))}
              </ul>
            </div>
          )}

          <div aria-live="polite">
            {navigation.state === 'loading' ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12" />
              </div>
            ) : (
              summary && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-medium flex flex-row items-center gap-2">
                    <TextSearch />
                    Answer
                  </h3>

                  <p className="text-gray-600">{summary}</p>
                </div>
              )
            )}
          </div>
        </div>

        <SearchForm prevContext={prevContext} />
      </section>
    </main>
  );
}
