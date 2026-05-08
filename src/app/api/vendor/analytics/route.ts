import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const range = parseInt(searchParams.get('range') || '7');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    const startDate = startOfDay(subDays(new Date(), range));

    // 1. Fetch all orders for the period
    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        placedAt: { gte: startDate }
      },
      include: {
        platform: true,
        items: true
      }
    });

    // 2. Aggregate Daily Revenue
    const dailyInterval = eachDayOfInterval({
      start: startDate,
      end: new Date()
    });

    const salesTrend = dailyInterval.map((day: Date) => {
      const dayStr = format(day, 'MMM dd');
      const dayOrders = orders.filter((o: any) => format(new Date(o.placedAt), 'MMM dd') === dayStr);
      const revenue = dayOrders.reduce((acc: number, curr: any) => acc + curr.total, 0);
      return { day: dayStr, revenue, count: dayOrders.length };
    });

    // 3. Platform Distribution
    const platformDataMap: Record<string, { value: number, revenue: number }> = {};
    orders.forEach((order: any) => {
      const name = order.platform.displayName;
      if (!platformDataMap[name]) {
        platformDataMap[name] = { value: 0, revenue: 0 };
      }
      platformDataMap[name].value += 1;
      platformDataMap[name].revenue += order.total;
    });

    const platformDistribution = Object.entries(platformDataMap).map(([name, data]: [string, any]) => ({
      name,
      ...data
    }));

    // 4. Hourly Heatmap
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'PM' : 'AM'}`,
      orders: orders.filter((o: any) => new Date(o.placedAt).getHours() === i).length
    }));

    // 5. Overall KPIs
    const totalRevenue = orders.reduce((acc: number, curr: any) => acc + curr.total, 0);
    const orderCount = orders.length;
    const aov = orderCount > 0 ? totalRevenue / orderCount : 0;
    const itemsCount = orders.reduce((acc: number, curr: any) => acc + curr.items.length, 0);

    return NextResponse.json({
      success: true,
      analytics: {
        kpis: {
          totalRevenue,
          orderCount,
          aov,
          itemsCount
        },
        salesTrend,
        platformDistribution,
        hourlyDistribution
      }
    });

  } catch (error: any) {
    console.error('[GET /api/vendor/analytics]', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
