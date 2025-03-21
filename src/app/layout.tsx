import type {Metadata} from "next";
import "@/styles/globals.css";
import {IBM_Plex_Sans_KR} from 'next/font/google'

const ibmPlexSansKR = IBM_Plex_Sans_KR({ subsets: ['latin'], weight: "400" });

export const metadata: Metadata = {
  title: "어디카?",
  description: "차량 관제 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibmPlexSansKR.className}>
        {children}
      </body>
    </html>
  );
}