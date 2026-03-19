import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/shared/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SpotiRAG",
  description: "A RAG-powered Spotify experience.",
};

export default function RootLayout({ children }) {
  // Placeholder user object as requested
  const user = {
    name: "Juan Duran",
    email: "juan@example.com"
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Navbar user={user} />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
