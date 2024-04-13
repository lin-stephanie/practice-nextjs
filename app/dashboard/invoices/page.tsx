/* Creating the invoices page */

import { Suspense } from 'react';

import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';

/* Adding pagination */
import { fetchInvoicesPages } from '@/app/lib/data';

/* 4. Updating the table */
// Page components accept a prop called searchParams,
// so you can pass the current URL params to the <Table> component.
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  /* Adding pagination */
  // fetchInvoicesPages returns the total number of pages based on the search query.
  // For example, if there are 12 invoices that match the search query, and each page displays 6 invoices,
  // then the total number of pages would be 2.
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* <Search/> allows users to search for specific invoices. */}
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      {/* 4. Updating the table */}
      {/* If you navigate to the <Table> Component, you'll see that the two props, query and currentPage, 
      are passed to the fetchFilteredInvoices() function which returns the invoices that match the query. */}
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination/> allows users to navigate between pages of invoices. */}
        {/* Navigate to the <Pagination/> component and you'll notice that it's a Client Component. 
        You don't want to fetch data on the client as this would expose your database secrets 
        (remember, you're not using an API layer). 
        Instead, you can fetch the data on the server, and pass it to the component as a prop. */}
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
