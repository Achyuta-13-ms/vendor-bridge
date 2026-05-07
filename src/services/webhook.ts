import { prisma } from '@/lib/db';

export async function sendWebhook(event: string, data: any) {
  // Fetch all registered target webhook URLs from the newly created Schema Model.
  const webhooks = await prisma.webhook.findMany();

  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event,
          data
        })
      });
    } catch (error) {
      // Intentionally not failing upwards to preserve user thread.
      console.error("Webhook delivery failed:", webhook.url, error);
    }
  }
}
