import "./globals.css";

export const metadata = {
  title: "BePro : The Career Engine for Builders, Not Bystanders",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <main className="flex-1 fade-in">{children}</main>
      </body>
    </html>
  );
}
