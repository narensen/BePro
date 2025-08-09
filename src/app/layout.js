
import "./globals.css";
import ClientLayout from './ClientLayout';

export const metadata = {
  title: "BePro : The Career Engine for Builders, Not Bystanders",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
 
}
