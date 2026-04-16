import { prisma } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhooks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      platformName, 
      externalOrderId, 
      vendorId, 
      items, 
      customer, 
      totals, 
      specialInstructions 
    } = body;

    if (!vendorId || !platformName || !externalOrderId) {
      return NextResponse.json({ success: false, message: 'vendorId, platformName, and externalOrderId are required' }, { status: 400 });
    }

    // Find platform
    const platform = await prisma.platform.findUnique({
      where: { name: platformName.toLowerCase() }
    });

    if (!platform) {
      return NextResponse.json({ success: false, message: `Platform ${platformName} not found` }, { status: 400 });
    }

    // Find vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 400 });
    }

    // Use transaction to create order, customer, and items
    const result = await prisma.$transaction(async (tx) => {
      // 1. Handle Customer
      let customerId = null;
      if (customer) {
        const existingCustomer = await tx.customer.findFirst({
          where: { phone: customer.phone }
        });

        if (existingCustomer) {
          customerId = existingCustomer.id;
          // Update address if provided
          if (customer.address) {
            await tx.customer.update({
              where: { id: customerId },
              data: { deliveryAddress: customer.address, name: customer.name || existingCustomer.name }
            });
          }
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              name: customer.name,
              phone: customer.phone,
              deliveryAddress: customer.address
            }
          });
          customerId = newCustomer.id;
        }
      }

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          vendorId,
          platformId: platform.id,
          externalOrderId,
          status: 'NEW',
          subtotal: totals.subtotal,
          tax: totals.tax || 0,
          deliveryFee: totals.deliveryFee || 0,
          total: totals.total,
          specialInstructions,
          customerId,
        },
        include: {
          customer: true,
          platform: true
        }
      });

      // 3. Handle Items and Inventory Deduction
      const createdItems = [];
      for (const item of items) {
        let matchedProductId: string | null = null;

        // Step A: Try to find explicit mapping by Platform ID and External Item ID
        if (item.externalId) {
          const mapping = await tx.platformProduct.findUnique({
            where: {
              platformId_externalId: {
                platformId: platform.id,
                externalId: item.externalId
              }
            }
          });
          if (mapping) matchedProductId = mapping.productId;
        }

        // Step B: Fallback to Name Matching if no ID mapping exists
        if (!matchedProductId) {
          const product = await tx.product.findFirst({
            where: { vendorId, name: { contains: item.name } }
          });
          if (product) matchedProductId = product.id;
        }

        const createdItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            options: item.options ? JSON.stringify(item.options) : null,
            productId: matchedProductId
          }
        });

        // Deduct stock if product resolved
        if (matchedProductId) {
          const product = await tx.product.findUnique({ where: { id: matchedProductId } });
          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await tx.product.update({
              where: { id: product.id },
              data: { 
                stock: newStock,
                isActive: newStock > 0
              }
            });
            console.log(`[SYNC] Mapped Stock Deducted: ${product.name} (${product.stock} -> ${newStock})`);
            
            // 🔥 Dispatch Stock-out Webhook
            if (newStock === 0) {
              dispatchWebhook(vendorId, 'ITEM_OUT_OF_STOCK', {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                triggeredByOrder: order.externalOrderId
              });
            }
          }
        } else {
          console.warn(`[SYNC] UNMAPPED ITEM detected: ${item.name} from ${platform.displayName}`);
        }

        createdItems.push(createdItem);
      }

      return { ...order, items: createdItems };
    });

    console.log(`[ORDER BRIDGED] Platform: ${platformName}, Internal ID: ${result.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Order bridged successfully', 
      orderId: result.id,
      externalId: externalOrderId
    });

  } catch (error) {
    console.error('[POST /api/bridge/orders]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
