import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy via-navy-light to-green-dark text-white px-4">
      {/* Logo/Icon */}
      <div className="mb-8 flex justify-center">
        <img src="/resenha-fc.png?v=2" alt="RESENHAFC Logo" className="h-40 w-auto object-contain drop-shadow-lg" />
      </div>

      {/* Title */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-center">
        RESENHAFC
      </h1>

      {/* Tagline */}
      <p className="text-xl md:text-2xl text-gray-200 mb-12 text-center max-w-2xl">
        A forma mais fácil de organizar seus treinos
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button
          asChild
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xl py-7 font-semibold"
        >
          <Link href="/auth/signin">Entrar</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="flex-1 bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white text-xl py-7 font-semibold backdrop-blur-sm"
        >
          <Link href="/auth/signup">Cadastrar</Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 flex gap-6 text-sm text-gray-400">
        <Link href="#" className="hover:text-white transition-colors">
          Sobre
        </Link>
        <span>·</span>
        <Link href="#" className="hover:text-white transition-colors">
          Privacidade
        </Link>
      </footer>
    </div>
  );
}
