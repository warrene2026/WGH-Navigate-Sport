import './globals.css';

export const metadata = {
  title: 'Navigate YS',
  description: 'Parent-facing web app for accessing session reports and assigned resources.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
