import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive demo seed...');

  // 1. Clear existing data (optional but good for a "clean" demo)
  // Note: Be careful with deletions if you have existing production-like data
  // For this demo, we'll assume we want a fresh state.
  await prisma.verification.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.platformProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.platformConnection.deleteMany({});
  await prisma.webhookLog.deleteMany({});
  await prisma.webhookConfig.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.platform.deleteMany({});

  // 2. Create Platforms
  const platforms = [
    { name: 'swiggy', displayName: 'Swiggy', logoUrl: '/platforms/swiggy.png' },
    { name: 'zomato', displayName: 'Zomato', logoUrl: '/platforms/zomato.png' },
    { name: 'amazon', displayName: 'Amazon', logoUrl: '/platforms/amazon.png' },
    { name: 'shopify', displayName: 'Shopify', logoUrl: '/platforms/shopify.png' },
    { name: 'generic', displayName: 'Custom Marketplace', logoUrl: '/platforms/generic.png' },
  ];

  for (const p of platforms) {
    await prisma.platform.create({ data: p });
  }
  console.log('Platforms created.');

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@vendorflow.demo',
      phone: '9999999999',
      role: 'ADMIN',
    },
  });
  console.log('Admin user created: admin@vendorflow.demo');

  // 4. Realistic Indian Business Data
  const demoVendors = [
    { name: 'Sharma Kirana Store', type: 'RETAIL', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
    { name: 'Gupta Bakers & Confectionery', type: 'FOOD', city: 'Delhi', state: 'Delhi', status: 'ACTIVE' },
    { name: 'LifeCare Pharmacy', type: 'HEALTHCARE', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE' },
    { name: 'Tandoori Nights Restaurant', type: 'FOOD', city: 'Pune', state: 'Maharashtra', status: 'ACTIVE' },
    { name: 'Organic Harvest Grocery', type: 'RETAIL', city: 'Hyderabad', state: 'Telangana', status: 'PENDING' },
    { name: 'Fashion Hub Boutique', type: 'RETAIL', city: 'Ahmedabad', state: 'Gujarat', status: 'ACTIVE' },
    { name: 'Metro Electronics', type: 'ELECTRONICS', city: 'Chennai', state: 'Tamil Nadu', status: 'ACTIVE' },
    { name: 'Green Leaf Nurseries', type: 'RETAIL', city: 'Kolkata', state: 'West Bengal', status: 'REJECTED' },
    { name: 'Spice Route Spices', type: 'WHOLESALE', city: 'Kochi', state: 'Kerala', status: 'PENDING' },
    { name: 'Royal Furniture Mart', type: 'RETAIL', city: 'Jaipur', state: 'Rajasthan', status: 'ACTIVE' },
    { name: 'Sunlight Dairy', type: 'FOOD', city: 'Lucknow', state: 'Uttar Pradesh', status: 'ACTIVE' },
    { name: 'Saraswati Stationery', type: 'RETAIL', city: 'Patna', state: 'Bihar', status: 'PENDING' },
    { name: 'Quick Fix Mobiles', type: 'SERVICE', city: 'Chandigarh', state: 'Punjab', status: 'ACTIVE' },
    { name: 'Vedic Wellness Hub', type: 'HEALTHCARE', city: 'Dehradun', state: 'Uttarakhand', status: 'PENDING' },
    { name: 'Himalayan Arts & Crafts', type: 'RETAIL', city: 'Shimla', state: 'Himachal Pradesh', status: 'ACTIVE' },
  ];

  const platformList = await prisma.platform.findMany();

  for (let i = 0; i < demoVendors.length; i++) {
    const vData = demoVendors[i];
    const email = `vendor${i + 1}@demo.in`;
    const phone = `98765${i.toString().padStart(5, '0')}`;

    const user = await prisma.user.create({
      data: {
        name: vData.name,
        email: email,
        phone: phone,
        role: 'VENDOR',
        vendor: {
          create: {
            businessName: vData.name,
            businessType: vData.type,
            city: vData.city,
            state: vData.state,
            addressLine1: `${i + 101}, Main Road`,
            postalCode: `${400000 + i}`,
            status: vData.status,
            email: email,
            phone: phone,
          }
        }
      },
      include: { vendor: true }
    });

    const vendor = user.vendor!;

    // 5. Add Documents & Verifications
    const docTypes = ['GST', 'PAN', 'BANK'];
    for (const type of docTypes) {
      let url = '';
      if (type === 'GST') url = '/demo/gst-certificate.svg';
      if (type === 'PAN') url = '/demo/pan-card.svg';
      if (type === 'BANK') url = '/demo/cancelled-cheque.svg';

      const doc = await prisma.document.create({
        data: {
          vendorId: vendor.id,
          type: type,
          url: url,
          originalName: `${type}_Document.pdf`,
        }
      });

      // Verification status based on vendor status
      let verStatus = 'PENDING';
      if (vData.status === 'ACTIVE') verStatus = 'VERIFIED';
      if (vData.status === 'REJECTED' && type === 'GST') verStatus = 'REJECTED';

      await prisma.verification.create({
        data: {
          documentId: doc.id,
          status: verStatus,
          rejectionReason: verStatus === 'REJECTED' ? 'Document is blurry or invalid.' : null,
          verifiedBy: verStatus === 'VERIFIED' ? adminUser.id : null,
          verifiedAt: verStatus === 'VERIFIED' ? new Date() : null,
        }
      });
    }

    // 6. Add Products (if active)
    if (vData.status === 'ACTIVE') {
      const products = [
        { name: 'Standard Product A', price: 499.0, stock: 50 },
        { name: 'Premium Product B', price: 1299.0, stock: 20 },
        { name: 'Value Bundle C', price: 899.0, stock: 35 },
      ];

      for (const p of products) {
        await prisma.product.create({
          data: {
            vendorId: vendor.id,
            name: `${vData.name} - ${p.name}`,
            price: p.price,
            stock: p.stock,
            category: vData.type,
            isActive: true,
          }
        });
      }

      // 7. Marketplace Connections
      const pIdx = i % platformList.length;
      await prisma.platformConnection.create({
        data: {
          vendorId: vendor.id,
          platformId: platformList[pIdx].id,
          status: 'ACTIVE',
          externalId: `EXT_${vendor.id.slice(0, 8)}`,
        }
      });

      // 8. Realistic Orders for Analytics
      for (let j = 0; j < 5; j++) {
        const amount = 500 + Math.random() * 2000;
        await prisma.order.create({
          data: {
            vendorId: vendor.id,
            platformId: platformList[pIdx].id,
            externalOrderId: `ORD_${vendor.id.slice(0, 4)}_${j}`,
            status: j === 0 ? 'DELIVERED' : 'CONFIRMED',
            subtotal: amount,
            tax: amount * 0.18,
            total: amount * 1.18,
            placedAt: new Date(Date.now() - (j * 24 * 60 * 60 * 1000)), // Daily orders
          }
        });
      }
    }
  }

  console.log('Demo seed completed successfully.');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Admin: admin@vendorflow.demo');
  console.log('Vendor: vendor1@demo.in');
  console.log('OTP: Use "123456" for all (mocked in dev/demo flow if needed, otherwise check logs)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
