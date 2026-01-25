import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GroupProvider } from "@/contexts/group-context";
import { DirectModeProvider } from "@/contexts/direct-mode-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: "Peladeiros - Gestão de Peladas",
  description: "Organize suas peladas, sorteie times, registre estatísticas e acompanhe rankings",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peladeiros",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <GroupProvider>
            <DirectModeProvider>
              {children}
            </DirectModeProvider>
          </GroupProvider>
        </AuthProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
