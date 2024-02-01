import { getJson } from 'serpapi';
import { EnvVars } from './env-vars';
import type { SearchResult } from '~/types';

/**
 * Use this to get the Google search results for a query.
 * Docs: https://github.com/serpapi/serpapi-javascript
 */

/** Search Google for the given query using the SerpApi service. */
export async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const searchResults = await getJson({
      engine: 'google',
      api_key: EnvVars.serpapi(),
      q: query,
    });

    return searchResults['organic_results'];
  } catch (error) {
    console.error('Error searching Google:', error);
    throw error;
  }
}
