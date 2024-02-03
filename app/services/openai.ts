import type { Prompt } from '@dexaai/dexter';
import { ChatModel, Msg, createOpenAIClient } from '@dexaai/dexter';
import { EnvVars } from './env-vars';
import type { SearchResult } from '~/types';

/**
 * Use this to make requests to the OpenAI API.
 * Docs: https://github.com/dexaai/dexter
 */

/** Client for making requests to the OpenAI API. */
const openaiClient = createOpenAIClient({ apiKey: EnvVars.openAI() });

/** Use ChatModel to make requests to the chat completion endpoint. */
const chatModel = new ChatModel({
  client: openaiClient,
  debug: true,
  params: {
    model: 'gpt-3.5-turbo-1106',
    // model: 'gpt-4',
  },
});

/** Summarize Google search results using the OpenAI API. */
export async function summarizeSearchResults(args: {
  query: string;
  searchResults: SearchResult[];
}): Promise<string> {
  // Preprocess the search results to get the text to summarize.
  const searchSummary = args.searchResults
    .map((result, index) => {
      return `${index + 1}. Title: ${result.title}\nSnippet: ${
        result.snippet
      }\nURL: ${result.link}`;
    })
    .join('\n');

  // Start the chat model and have it summarize the search results.
  const messages: Prompt.Msg[] = [
    Msg.user(
      `Summarize the following search results for "${args.query}":\n\n${searchSummary}\n\nPlease be very sure to not repeat the same information even if they are somewhat similar, this is very important! Please skim the content by going to the source URL if the query and snippets are not beneificial. Make sure your response is concise, clear, informative, and friendly! Try to never go past 4 sentences in the response, try your best to compress the information and removing any unneeded information, just try your best to answer the query. Thank you!`
    ),
  ];

  try {
    // Invoke the chat model and have it run the prompt.
    const response = await chatModel.run({
      messages,
    });

    if (!response.message.content) {
      throw new Error('No response from chat model');
    }

    // Return the chat response.
    return response.message.content;
  } catch (error) {
    console.error('Error summarizing search results:', error);
    throw error;
  }
}
