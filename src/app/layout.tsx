import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutricionista IA",
  description:
    "Cálculo de necessidades nutricionais e plano alimentar personalizado com acompanhamento semanal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-zinc-200 px-6 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          Esta ferramenta tem caráter educativo e informativo. Os valores
          apresentados são estimativas baseadas em fórmulas populacionais e
          não constituem prescrição dietética. A prescrição de dietas
          individualizadas é atividade privativa de nutricionista registrado
          no Conselho Federal de Nutricionistas. Consulte um profissional
          antes de iniciar qualquer plano alimentar.
        </footer>
      </body>
    </html>
  );
}
