import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Proveedores from "@/componentes/Proveedores";
import { AdminProvider } from "../contextos/ContextoAdmin";
import DisenoPrincipal from "@/componentes/DisenoPrincipal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iglesia del Salvador | Admin Panel",
  description: "Panel de administradoristración para la Iglesia del Salvador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-[#A8D500] selection:text-black`}
      >
        <Proveedores>
          <AdminProvider>
            <DisenoPrincipal>
              {children}
            </DisenoPrincipal>
          </AdminProvider>
        </Proveedores>
      </body>
    </html>
  );
}

