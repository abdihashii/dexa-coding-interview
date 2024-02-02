import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import { searchGoogle } from '../services/serpapi';
import { summarizeSearchResults } from '~/services/openai';
import { LibrarySquare, Loader2, TextSearch } from 'lucide-react';
import { cache } from '~/services/cache';
import SourceCard from '~/components/SourceCard';
import { v4 as uuidv4 } from 'uuid';

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview | Haji' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Uses zodix to parse the query string and grabs the "q" parameter
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  // If there's no search query, return an empty response
  if (!q) {
    return json({ q: '', searchResults: [], summary: '' });
  }

  // Check if the query is already in the cache
  if (cache.has(q)) {
    const data = cache.get(q);

    if (data) {
      return json({
        q,
        searchResults: data.searchResults,
        summary: data.summary,
      });
    }
  }

  // If there's a search query, search Google and return the results
  const searchResults = await searchGoogle(q);

  // Use Dextar to summarize the search results
  const summary = await summarizeSearchResults({
    query: q ?? '',
    searchResults,
  });

  // Cache the results and summary to in memory cache using the cache service
  await cache.set(q, { searchResults, summary });

  return json({ q, searchResults, summary });
}

export default function Index() {
  const { q, searchResults, summary } = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  return (
    <main className="flex flex-col h-screen items-center justify-center bg-slate-200 gap-8">
      <section className="w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
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
                    key={uuidv4()}
                    title={result.title}
                    link={result.link}
                  />
                ))}
              </ul>
            </div>
          )}

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

        <Form method="get" className="flex flex-col gap-4">
          <input
            className="border border-gray-300 rounded-md p-2"
            type="search"
            name="q"
            id="search"
            defaultValue={q ?? ''}
            placeholder="Search the web"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold rounded-md p-2 hover:bg-blue-600 transition-colors duration-300 ease-in-out"
          >
            Search
          </button>
        </Form>
      </section>
    </main>
  );
}
