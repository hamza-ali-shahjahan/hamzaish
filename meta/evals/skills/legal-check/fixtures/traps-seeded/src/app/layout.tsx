export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" /></head>
      <body>{children}</body>
    </html>
  );
}
