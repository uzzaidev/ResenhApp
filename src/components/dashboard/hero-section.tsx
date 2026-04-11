"use client";

/**
 * Hero Section - Dashboard V2
 *
 * Evita hydration mismatch usando valores determinísticos no SSR
 * e apenas valores sensíveis a horário/local após mount no cliente.
 */

import { useSession } from "next-auth/react";
import { useGroup } from "@/contexts/group-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getMotivationalQuote(seed: string): string {
  const quotes = [
    "O sucesso e a soma de pequenos esforcos repetidos dia apos dia",
    "A disciplina e a ponte entre objetivos e realizacoes",
    "Grandes coisas nunca vem de zonas de conforto",
    "O unico lugar onde o sucesso vem antes do trabalho e no dicionario",
    "A diferenca entre o possivel e o impossivel esta na determinacao",
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return quotes[hash % quotes.length];
}

export function HeroSection() {
  const { data: session } = useSession();
  const user = session?.user;
  const { currentGroup } = useGroup();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Atleta";

  const nextTraining = useMemo(
    () => ({
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: "19:00",
    }),
    []
  );

  const timeOfDay = mounted ? getTimeOfDay() : "morning";
  const quoteSeed = user?.email || user?.name || "peladeiros";
  const motivationalQuote = getMotivationalQuote(quoteSeed);

  const greeting = {
    morning: "Bom dia",
    afternoon: "Boa tarde",
    evening: "Boa noite",
  }[timeOfDay];

  const nextTrainingLabel = mounted
    ? format(nextTraining.date, "EEEE 'as' HH:mm", { locale: ptBR })
    : "amanha as 19:00";

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-8 text-white md:p-12">
      <div className="absolute inset-0 bg-grid-white/10 opacity-50" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="font-heading text-3xl font-extrabold md:text-4xl lg:text-5xl">
            {greeting}, {firstName}!
          </h1>
        </div>

        <p className="mb-6 max-w-2xl text-lg text-blue-50 md:text-xl">{motivationalQuote}</p>

        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-100" />
            <span className="text-blue-100">Proximo treino:</span>
            <span className="font-semibold">{nextTrainingLabel}</span>
          </div>

          {currentGroup && (
            <div className="flex items-center gap-2">
              <span className="text-blue-100">Grupo:</span>
              <span className="font-semibold">{currentGroup.name}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
