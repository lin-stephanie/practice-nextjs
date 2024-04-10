/* Creating the dashboard page */

import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';

import { lusitana } from '@/app/ui/fonts';

/* Fetching Data */
// Page is an async component. This allows you to use await to fetch data.
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from '@/app/lib/data';

export default async function Page() {
  /* request waterfalls */
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* To fetch data for the <RevenueChart /> component, 
        import the fetchRevenue function from data.ts and call it inside your component */}
        <RevenueChart revenue={revenue} />

        {/* For the <LatestInvoices /> component, we need to get the latest 5 invoices, sorted by date. */}
        {/* You could fetch all the invoices and sort through them using JavaScript. 
        This isn't a problem as our data is small, but as your application grows, it can significantly increase 
        the amount of data transferred on each request and the JavaScript required to sort through it. */}
        {/* Instead of sorting through the latest invoices in-memory, you can use an SQL query to fetch only the last 5 invoices.  */}
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
