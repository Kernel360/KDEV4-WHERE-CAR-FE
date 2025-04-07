import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PageLayout from "@/components/layout/PageLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WHERE CAR",
  description: "차량 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider>
          <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white`}>
            <PageLayout>
              {children}
            </PageLayout>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 