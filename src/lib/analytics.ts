/**
 * Analytics Helper
 * 
 * Wrapper para analytics que permite trocar de provider facilmente.
 * Por enquanto, usa console.log em desenvolvimento.
 * Pode ser integrado com PostHog, Vercel Analytics, Google Analytics, etc.
 * 
 * Sprint 7: Testes E2E + Observabilidade
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  groupId?: string;
}

/**
 * Rastreia um evento
 * 
 * @param event - Nome do evento
 * @param properties - Propriedades adicionais do evento
 */
export function trackEvent(event: string, properties?: Record<string, any>): void {
  // Em desenvolvimento, apenas logar
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
    return;
  }

  // Em produção, integrar com PostHog ou outro provider
  if (typeof window !== 'undefined') {
    // TODO: Integrar com PostHog quando configurado
    // import('posthog-js').then((posthog) => {
    //   posthog.capture(event, properties);
    // });
  }
}

/**
 * Identifica um usuário
 * 
 * @param userId - ID do usuário
 * @param traits - Traits do usuário (nome, email, etc.)
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Identify', userId, traits);
    return;
  }

  if (typeof window !== 'undefined') {
    // TODO: Integrar com PostHog quando configurado
    // import('posthog-js').then((posthog) => {
    //   posthog.identify(userId, traits);
    // });
  }
}

/**
 * Rastreia eventos específicos do domínio
 */
export const analytics = {
  // RSVP
  rsvpConfirmed: (eventId: string, groupId: string, hasCharge: boolean) => {
    trackEvent('rsvp_confirmed', {
      eventId,
      groupId,
      hasCharge,
    });
  },

  // Charges
  chargeCreated: (chargeId: string, groupId: string, amount: number) => {
    trackEvent('charge_created', {
      chargeId,
      groupId,
      amount,
    });
  },

  // Payments
  paymentMarkedPaid: (chargeId: string, groupId: string) => {
    trackEvent('payment_marked_paid', {
      chargeId,
      groupId,
    });
  },

  // Groups
  groupSwitched: (groupId: string, groupName: string) => {
    trackEvent('group_switched', {
      groupId,
      groupName,
    });
  },

  // Trainings
  trainingCreated: (trainingId: string, groupId: string, hasPrice: boolean) => {
    trackEvent('training_created', {
      trainingId,
      groupId,
      hasPrice,
    });
  },

  // Pix
  pixGenerated: (chargeId: string, amount: number) => {
    trackEvent('pix_generated', {
      chargeId,
      amount,
    });
  },
};

