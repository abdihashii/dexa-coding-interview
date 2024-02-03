import { useState } from 'react';
import { Form, useNavigation } from '@remix-run/react';

const SearchForm = ({ prevContext }: { prevContext: string }) => {
  const navigation = useNavigation();

  // State that will hold the search query for the form input
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Form
      method="get"
      className="flex flex-col gap-4"
      onSubmit={() => {
        setSearchQuery('');
      }}
    >
      <input
        className="border border-gray-300 rounded-md p-2"
        type="search"
        name="q"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search the web"
        autoFocus={true}
      />

      <input type="hidden" name="prevContext" value={prevContext} />

      <button
        type="submit"
        className="bg-blue-500 text-white font-semibold rounded-md p-2 hover:bg-blue-600 transition-colors duration-300 ease-in-out"
        disabled={
          navigation.state === 'loading' ||
          navigation.state === 'submitting' ||
          searchQuery.length === 0
        }
      >
        Search
      </button>
    </Form>
  );
};

export default SearchForm;
