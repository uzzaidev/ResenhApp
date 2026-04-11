import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/treinos",
        destination: "/eventos?tipo=treino",
        permanent: false,
      },
      {
        source: "/jogos",
        destination: "/eventos?tipo=jogo",
        permanent: false,
      },
      {
        source: "/settings",
        destination: "/configuracoes",
        permanent: true,
      },
      {
        source: "/profile/:userId",
        destination: "/atletas/:userId",
        permanent: true,
      },
      {
        source: "/groups/:groupId/settings",
        destination: "/grupos/:groupId/configuracoes",
        permanent: true,
      },
      {
        source: "/groups/:groupId/payments",
        destination: "/grupos/:groupId/pagamentos",
        permanent: true,
      },
      {
        source: "/groups/new",
        destination: "/grupos/new",
        permanent: true,
      },
      {
        source: "/groups/join",
        destination: "/grupos/join",
        permanent: true,
      },
      {
        source: "/groups/:groupId/events/new",
        destination: "/eventos/novo?groupId=:groupId",
        permanent: false,
      },
      {
        source: "/groups/:groupId/events/:eventId",
        destination: "/eventos/:eventId?returnTo=/grupos/:groupId",
        permanent: false,
      },
      {
        source: "/groups/:groupId/credits",
        destination: "/configuracoes?tab=quota&groupId=:groupId",
        permanent: false,
      },
      {
        source: "/groups/:groupId",
        destination: "/grupos/:groupId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
