export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabase } = await import('@/lib/database');
    await initializeDatabase();

    // Agendar lembrete do DAS para todo dia 20 às 08:00
    const cron = await import('node-cron');
    cron.schedule('0 8 20 * *', async () => {
      console.log('[CRON] Enviando lembretes de pagamento do DAS...');
      try {
        const url = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
        const res = await fetch(`${url}/api/cron/das-reminder`, {
          headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        });
        const data = await res.json();
        console.log('[CRON] Resultado:', data);
      } catch (error) {
        console.error('[CRON] Erro ao enviar lembretes:', error);
      }
    });
    console.log('Cron do lembrete DAS agendado (dia 20 de cada mês às 08:00)');
  }
}
