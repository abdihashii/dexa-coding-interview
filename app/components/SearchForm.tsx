import { useEffect, useState } from 'react';
import { Form, useNavigation } from '@remix-run/react';
import { v4 as uuidv4 } from 'uuid';

const SearchForm = ({ prevContext }: { prevContext: string }) => {
  const navigation = useNavigation();

  // State that will hold the search query for the form input
  const [searchQuery, setSearchQuery] = useState('');

  const [inputKey, setInputKey] = useState(`input-key`);

  // Reset the forms search input
  useEffect(() => {
    if (navigation.state === 'idle' && inputKey !== 'input-key') {
      setInputKey('input-key'); // Reset the key to force-clear the input field
    }
  }, [navigation.state, inputKey]);

  return (
    <Form
      method="get"
      className="flex flex-col gap-4"
      onSubmit={() => {
        setInputKey(`input-key-${uuidv4()}`);
      }}
    >
      <input
        key={inputKey}
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
