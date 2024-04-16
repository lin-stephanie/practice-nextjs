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

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// import Zod and define a schema that matches the shape of your form object.
// This schema will validate the formData before saving it to a database.
// The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
// This is because input elements with type="number" actually return a string, not a number!
/* const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
}); */

/* Form validation - Server-Side validation */
// use Zod to validate form data
// customerId - Zod already throws an error if the customer field is empty as it expects a type string. But let's add a friendly message if the user doesn't select a customer.
// amount - Since you are coercing the amount type from string to number, it'll default to zero if the string is empty. Let's tell Zod we always want the amount greater than 0 with the .gt() function.
// status - Zod already throws an error if the status field is empty as it expects "pending" or "paid". Let's also add a friendly message if the user doesn't select a status.
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// create a new async function that accepts formData
// you'll need to extract the values of formData, there are a couple of methods

// prevState - contains the state passed from the useFormState hook.
// You won't be using it in the action in this example, but it's a required prop.
export async function createInvoice(prevState: State, formData: FormData) {
  console.log('prevState:', prevState);
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

  // Validate form fields using Zod
  // safeParse() will return an object containing either a success or error field.
  // This will help handle validation more gracefully without having put this logic inside the try/catch block.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  console.log('validatedFields:', validatedFields);

  // If form validation fails, return errors early. Otherwise, continue.
  // Before sending the information to your database,
  // check if the form fields were validated correctly with a conditional:
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;

  /* 3. Extract the data from formData */
  /* const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }); */

  /* 4. Validate and prepare the data */
  // It's usually good practice to store monetary values in cents in your database to
  // eliminate JavaScript floating-point errors and ensure greater accuracy.
  const amountInCents = amount * 100;

  // Create a new date with the format "YYYY-MM-DD" for the invoice's creation date
  const date = new Date().toISOString().split('T')[0];

  /* 5. Inserting the data into your database */
  // you can create an SQL query to insert the new invoice into your database and pass in the variables
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

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

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* Deleting an invoice */
export async function deleteInvoice(id: string) {
  // When you try to delete an invoice again, you should see the fallback UI（in error.tsx）
  throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
