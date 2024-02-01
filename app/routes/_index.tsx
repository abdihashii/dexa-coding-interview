import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import { zx } from 'zodix';
import { searchGoogle } from '../services/serpapi';
import { summarizeSearchResults } from '~/services/openai';
import { Loader2, TextSearch } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Dexa Coding Interview | Haji' }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Uses zodix to parse the query string and grabs the "q" parameter
  const { q } = zx.parseQuery(args.request, {
    q: z.string().optional(),
  });

  // If there's a search query, search Google and return the results
  const searchResults = q?.length ? await searchGoogle(q) : [];

  const summary = q?.length
    ? await summarizeSearchResults({
        query: q ?? '',
        searchResults,
      })
    : '';

  return json({ q, searchResults, summary });
}

export default function Index() {
  const { q, searchResults, summary } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <main className="flex flex-col h-screen items-center justify-center bg-slate-200 gap-8">
      <section className="w-1/2 bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
        <div className="text-center space-y-2 border-b border-b-slate-400 pb-4">
          <h1 className="text-2xl font-medium">
            Welcome to the Dexa coding interview!
          </h1>
          <p className="text-sm text-gray-600">
            See the readme for instructions.
          </p>
        </div>

        {/* Summary */}
        <section className="space-y-2">
          <h2 className="text-xl font-medium flex flex-row items-center gap-2">
            <TextSearch />
            Answer
          </h2>

          <p>{summary ? <p>{summary}</p> : null}</p>
        </section>

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

      {/* Search Results */}
      <section>
        {navigation.state === 'loading' ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <p>Please wait while we load the search results :)</p>
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        ) : (
          <ul className="space-y-4">
            {searchResults.map((result) => (
              <li
                key={result.title}
                className="text-blue-500 underline hover:text-blue-300"
              >
                <a href={result.link} target={'_blank'} rel="noreferrer">
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
