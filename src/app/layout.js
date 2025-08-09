
import "./globals.css";
import SideBar from './components/SideBar';

export const metadata = {
  title: "BePro : The Career Engine for Builders, Not Bystanders",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-row">
        <div className="hidden md:block min-h-screen"><SideBar /></div>
        <main className="flex-1 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
