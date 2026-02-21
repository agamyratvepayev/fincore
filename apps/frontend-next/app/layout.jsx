import "./globals.css";

export const metadata = {
  title: "FinCore",
  description: "FinCore reporting frontend"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

