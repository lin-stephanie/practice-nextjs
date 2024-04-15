/* 2. Create a Server Action */
// By adding the 'use server', you mark all the exported functions within the file as server functions.
// These server functions can then be imported into Client and Server components, making them extremely versatile.

// You can also write Server Actions directly inside Server Components by adding "use server" inside the action.
// But for this course, we'll keep them all organized in a separate file.
'use server';

/* 4. Validate and prepare the data */
import { z } from 'zod';

/* 5. Inserting the data into your database */
import { sql } from '@vercel/postgres';

/* 6. Revalidate and redirect */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// import Zod and define a schema that matches the shape of your form object.
// This schema will validate the formData before saving it to a database.
// The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
// This is because input elements with type="number" actually return a string, not a number!
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// create a new async function that accepts formData
// you'll need to extract the values of formData, there are a couple of methods
export async function createInvoice(formData: FormData) {
  console.log('formData:', formData);

  /* formData: FormData {
  [Symbol(state)]: [
    {
      name: 'customerId',
      value: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9'
    },
    { name: 'amount', value: '100' },
    { name: 'status', value: 'pending' }
  ]
} */

  /* 3. Extract the data from formData */
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  /* 4. Validate and prepare the data */
  // It's usually good practice to store monetary values in cents in your database to
  // eliminate JavaScript floating-point errors and ensure greater accuracy.
  const amountInCents = amount * 100;

  // Create a new date with the format "YYYY-MM-DD" for the invoice's creation date
  const date = new Date().toISOString().split('T')[0];

  /* 5. Inserting the data into your database */
  // you can create an SQL query to insert the new invoice into your database and pass in the variables
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  /* 6. Revalidate and redirect */
  // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
  // Since you're updating the data displayed in the invoices route,
  // you want to clear this cache and trigger a new request to the server.

  // Once the database has been updated, the /dashboard/invoices path will be revalidated,
  // and fresh data will be fetched from the server.
  revalidatePath('/dashboard/invoices');
  // At this point, you also want to redirect the user back to the /dashboard/invoices page.
  redirect('/dashboard/invoices');

  //   console.log('typeof rawFormData.amount:', typeof rawFormData.amount); // typeof rawFormData.amount: string
  //   console.log('rawFormData:', rawFormData);

  /* rawFormData: {
  customerId: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9',
  amount: '100',
  status: 'pending'
  } */
}

/* Updating an invoice - 4. Pass the id to the Server Action */
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* Deleting an invoice */
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
