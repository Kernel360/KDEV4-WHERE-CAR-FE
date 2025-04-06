import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/common/ToastContainer";
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
          <ToastProvider>
            <PageLayout>
              {children}
            </PageLayout>
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 