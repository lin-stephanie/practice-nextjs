// You can import global.css in any component in your application,
// but it's usually good practice to add it to your top-level component.
// In Next.js, this is the root layout (more on this later).
import '@/app/ui/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
