import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "JobMatchn | Révolutionnez votre recrutement",
  description: "La plateforme de recrutement dopée à l'IA pour trouver le match parfait.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen bg-[#0A0A0B] text-white">
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main className="pt-24 min-h-screen">
              {children}
            </main>
            <Toaster position="top-right" richColors />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
