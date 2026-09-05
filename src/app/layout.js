import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Seiszn — Women's Fashion",
  description: "Seiszn — modern women's fashion, drop by drop.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <CartProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-neutral-200 py-8 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Seiszn. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
