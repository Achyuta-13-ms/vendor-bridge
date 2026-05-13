import crypto from 'crypto';
import axios from 'axios';
import { prisma } from './db';

export type WebhookEvent = 'ORDER_UPDATED' | 'ITEM_OUT_OF_STOCK' | 'BRIDGE_STATUS_CHANGED';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  vendorId: string;
  data: any;
}

/**
 * Dispatches an event to all active webhook endpoints for a specific vendor.
 */
export async function dispatchWebhook(vendorId: string, event: WebhookEvent, data: any) {
  try {
    // 1. Fetch active webhooks for the vendor
    const configs = await prisma.webhookConfig.findMany({
      where: { vendorId, isActive: true }
    });

    if (configs.length === 0) return;

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      vendorId,
      data
    };

    const payloadString = JSON.stringify(payload);

    // 2. Dispatch to each endpoint
    for (const config of configs) {
      // Check if this config subscribes to this event
      const subscribedEvents = config.events.split(',');
      if (!subscribedEvents.includes(event) && config.events !== '*') continue;

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-VendorFlow-Event': event,
        };

        // 3. Sign payload if secret exists
        if (config.secret) {
          const signature = crypto
            .createHmac('sha256', config.secret)
            .update(payloadString)
            .digest('hex');
          headers['X-VendorFlow-Signature'] = signature;
        }

        console.log(`[WEBHOOK DISPATCH] Firing ${event} to ${config.url}`);

        const response = await axios.post(config.url, payload, { 
          headers,
          timeout: 5000 // 5s timeout
        });

        // 4. Log success
        await prisma.webhookLog.create({
          data: {
            webhookConfigId: config.id,
            event,
            payload: payloadString,
            statusCode: response.status,
            responseBody: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            status: 'SUCCESS'
          }
        });

      } catch (err: any) {
        console.error(`[WEBHOOK ERROR] Failed delivery to ${config.url}:`, err.message);
        
        // 5. Log failure
        await prisma.webhookLog.create({
          data: {
            webhookConfigId: config.id,
            event,
            payload: payloadString,
            statusCode: err.response?.status || 0,
            responseBody: err.response?.data ? JSON.stringify(err.response.data) : err.message,
            status: 'FAILED'
          }
        });
      }
    }

  } catch (error) {
    console.error('[WEBHOOK DISPATCHER CRITICAL ERROR]', error);
  }
}
