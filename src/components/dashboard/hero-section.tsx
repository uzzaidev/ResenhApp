"use client";

/**
 * Hero Section - Dashboard V2
 * 
 * Seção hero com saudação personalizada, frase motivacional
 * e mini stats (próximo treino, créditos).
 */

import { useSession } from "next-auth/react";
import { useGroup } from "@/contexts/group-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Sparkles } from "lucide-react";

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getMotivationalQuote(): string {
  const quotes = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia",
    "A disciplina é a ponte entre objetivos e realizações",
    "Grandes coisas nunca vêm de zonas de conforto",
    "O único lugar onde o sucesso vem antes do trabalho é no dicionário",
    "A diferença entre o possível e o impossível está na determinação",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function HeroSection() {
  const { data: session } = useSession();
  const user = session?.user;
  const { currentGroup } = useGroup();
  const timeOfDay = getTimeOfDay();
  const motivationalQuote = getMotivationalQuote();

  // Mock data - será substituído por API real no Sprint 2
  const nextTraining = {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
    time: "19:00",
  };
  const credits = 150;

  const greeting = {
    morning: "☀️ Bom dia",
    afternoon: "🌤️ Boa tarde",
    evening: "🌙 Boa noite",
  }[timeOfDay];

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Atleta";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-8 md:p-12 text-white mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 opacity-50"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading">
            {greeting}, {firstName}! 👋
          </h1>
        </div>

        <p className="text-lg md:text-xl text-blue-50 mb-6 max-w-2xl">
          {motivationalQuote}
        </p>

        {/* Mini Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-100" />
            <span className="text-blue-100">Próximo treino:</span>{" "}
            <span className="font-semibold">
              {format(nextTraining.date, "EEEE 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-100" />
            <span className="text-blue-100">Créditos:</span>{" "}
            <span className="font-semibold">{credits} disponíveis</span>
          </div>
          {currentGroup && (
            <div className="flex items-center gap-2">
              <span className="text-blue-100">Grupo:</span>{" "}
              <span className="font-semibold">{currentGroup.name}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

