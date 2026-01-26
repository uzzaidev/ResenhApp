'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Global
 * 
 * Captura erros não tratados no React e exibe uma UI amigável.
 * Loga automaticamente para monitoramento (Sentry será integrado no Sprint 7).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log para monitoramento com Sentry
    if (typeof window !== 'undefined') {
      // Importar Sentry apenas no client-side
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            errorBoundary: true,
          },
        });
      }).catch(() => {
        // Se Sentry não estiver disponível, apenas logar
        console.error('[Error Boundary]', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      });
    } else {
      console.error('[Error Boundary]', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReportBug = () => {
    // Criar issue no GitHub ou abrir formulário de suporte
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Por enquanto, copia para clipboard
    const errorText = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(errorText);

    // Abrir link de suporte (pode ser ajustado)
    window.open('/suporte?error=true', '_blank');
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Se houver fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI padrão de erro
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-uzzai-black via-[#0f242a] to-uzzai-black p-4">
          <Card className="w-full max-w-md border-red-500/30 bg-white/5 backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl">Ops! Algo deu errado</CardTitle>
              <CardDescription className="mt-2">
                Não se preocupe, nossa equipe foi notificada e está trabalhando para resolver o problema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detalhes do erro (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-xs font-mono text-red-400 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-400 cursor-pointer">
                        Ver stack trace
                      </summary>
                      <pre className="mt-2 text-[10px] text-red-300 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleReload}
                  className="w-full bg-uzzai-mint hover:bg-[#15a085] text-uzzai-black font-semibold"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full border-uzzai-mint/30 text-uzzai-mint hover:bg-uzzai-mint/10"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  className="w-full text-uzzai-silver hover:text-white"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Reportar Bug
                </Button>
              </div>

              {/* Link de suporte */}
              <p className="text-center text-xs text-uzzai-silver">
                Precisa de ajuda?{' '}
                <a
                  href="/suporte"
                  className="text-uzzai-mint hover:underline"
                >
                  Contatar suporte
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

