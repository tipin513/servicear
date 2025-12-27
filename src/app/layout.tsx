import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ServiceAR - Servicios Profesionales en Argentina",
    description: "Encontrá los mejores profesionales y oficios en CABA y GBA.",
};

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>
                <AuthProvider>
                    <Header />
                    <div style={{ minHeight: 'calc(100vh - 70px - 300px)' }}>
                        {children}
                    </div>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
