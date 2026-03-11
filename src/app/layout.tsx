import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGB - Sistema de Gestão do Borba",
  description: "Sistema de gestão do Clube de Desbravadores Borba Gato",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NextTopLoader color="#1a2b5f" showSpinner={false} height={3} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
