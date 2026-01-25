import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import AuthFinalize from "@/components/auth/AuthFinalize";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ventura",
  description: "A quieter place for your thoughts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore
    .getAll()
    .some((c) => c.name.includes("-auth-token"));

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="overflow-x-hidden bg-[#030712]">
        <ClientLayout hasAuthCookie={hasAuthCookie}>
          <main>{children}</main>
          <AuthFinalize />
        </ClientLayout>
      </body>
    </html>
  );
}
