//  This is a Client Component, which means you can use event listeners and hooks.
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

/* Best practice: Debouncing */
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  console.log('searchParams', searchParams);

  const pathname = usePathname();
  console.log('pathname', pathname);

  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    // function handleSearch(term: string) {
    console.log(`Searching... ${term}`); // paid

    /* 2. Update the URL with the search params */
    // A new URLSearchParams instance using your new searchParams variable.
    // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters.
    // Instead of creating a complex string literal, you can use it to get the params string like ?page=1&query=a.
    const params = new URLSearchParams(searchParams);
    console.log('params1', params); // params1 URLSearchParams {size: 1}

    // Next, set the params string based on the user’s input. If the input is empty, you want to delete it
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    /* Adding pagination */
    // When the user types a new search query, you want to reset the page number to 1.
    //  You can do this by updating the handleSearch function in your <Search> component
    params.set('page', '1');

    console.log('params2', params); // params2 URLSearchParams {size: 1}

    // ${pathname} is the current path, in your case, "/dashboard/invoices".
    // As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
    // replace(${pathname}?${params.toString()}) updates the URL with the user's search data.
    // For example, /dashboard/invoices?query=lee if the user searches for "Lee".
    // The URL is updated without reloading the page, thanks to Next.js's client-side navigation
    replace(`${pathname}?${params.toString()}`);

    console.log('pathname', pathname); // pathname /dashboard/invoices
    console.log('params.toString()', params.toString()); // params.toString() query=paid
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        /* 1. Capture the user's input */
        onChange={(e) => handleSearch(e.target.value)}
        /* 3. Keeping the URL and input in sync */
        // To ensure the input field is in sync with the URL and will be populated when sharing,
        // you can pass a defaultValue to input by reading from searchParams
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
