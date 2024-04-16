/* Creating an invoice */
/* 1. Create a Dynamic Route Segment with the invoice id */
// Next.js allows you to create Dynamic Route Segments
// when you don't know the exact segment name and want to create routes based on data.
// You can create dynamic route segments by wrapping a folder's name in square brackets.
// For example, [id], [post] or [slug].

import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

/* Handling 404 errors with the notFound function */
import { notFound } from 'next/navigation';

/* 2. Read the invoice id from page params */
// Notice how it's similar to your /create invoice page,
// except it imports a different form (from the edit-form.tsx file).

// This form should be pre-populated with a defaultValue for the customer's name,
// invoice amount, and status. To pre-populate the form fields, you need to fetch the specific invoice using id.

// In addition to searchParams, page components also accept a prop called params which you can use to access the id.
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  console.log('[id]', id);

  /* 3. Fetch the specific invoice */
  // You can use Promise.all to fetch both the invoice and customers in parallel
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  /* Handling 404 errors with the notFound function */
  // you can use a conditional to invoke notFound if the invoice doesn't exist.
  //  <Page> will now throw an error if a specific invoice is not found. To show an error UI to the user.

  // That's something to keep in mind, notFound will take precedence over error.tsx,
  // so you can reach out for it when you want to handle more specific errors!

  // For example, visit http://localhost:3000/dashboard/invoices/2e94d1ed-d220-449f-9f11-f0bbceed9645/edit. to test
  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
