import "./globals.css";

export const metadata = {
  title: "BePro : Growth Skill OS",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
