/* Streaming a whole page with loading.tsx */
// loading.tsx is a special Next.js file built on top of Suspense,
// it allows you to create fallback UI to show as a replacement while page content loads.

// Since <SideNav> is static, it's shown immediately.
// The user can interact with <SideNav> while the dynamic content is loading.

/* Fixing the loading skeleton bug with route groups */
// Create a new folder called /(overview) inside the dashboard folder.

// Route groups allow you to organize files into logical groups without affecting the URL path structure.
// When you create a new folder using parentheses (), the name won't be included in the URL path.
// So /dashboard/(overview)/page.tsx becomes /dashboard.

import DashboardSkeleton from '@/app/ui/skeletons';

export default function Loading() {
  //   return <div>Loading...</div>;
  /* Adding loading skeletons */
  return <DashboardSkeleton />;
}
