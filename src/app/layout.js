import "./globals.css";

export const metadata = {
  title: "BePro : AI Career-pathing engine",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
