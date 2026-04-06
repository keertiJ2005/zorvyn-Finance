import prisma from '../../config/db';
import { DashboardSummary, CategoryBreakdown, MonthlyTrend, WeeklySummary } from '../../types';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const transactions = await prisma.transaction.findMany({
      where: { isDeleted: false },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    // could probably do this in SQL via raw query but sqlite gets cranky. looping in memory for now
    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    }

    // rounding because js floating points keep giving me numbers like 199.99999998
    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      totalTransactions: transactions.length,
    };
  }

  static async getCategoryBreakdown(): Promise<{ categories: CategoryBreakdown[] }> {
    const transactions = await prisma.transaction.findMany({
      where: { isDeleted: false },
      select: { amount: true, type: true, category: true },
    });

    const categoryMap = new Map<string, { total: number; type: string }>();

    for (const t of transactions) {
      // making a composite key because people might name an expense and income category the same
      const key = `${t.category}-${t.type}`;
      const existing = categoryMap.get(key);

      if (existing) {
        existing.total += t.amount;
      } else {
        categoryMap.set(key, { total: t.amount, type: t.type });
      }
    }

    const categories: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
      ([key, value]) => ({
        category: key.split('-')[0],
        total: Math.round(value.total * 100) / 100,
        type: value.type,
      })
    );

    categories.sort((a, b) => b.total - a.total);

    return { categories };
  }

  static async getMonthlyTrends(): Promise<{ trends: MonthlyTrend[] }> {
    const transactions = await prisma.transaction.findMany({
      where: { isDeleted: false },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' }, // MUST be chronological or charts break
    });

    const monthMap = new Map<string, { income: number; expense: number }>();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    for (const t of transactions) {
      const date = new Date(t.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const existing = monthMap.get(monthKey) || { income: 0, expense: 0 };

      if (t.type === 'INCOME') {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }

      monthMap.set(monthKey, existing);
    }

    const trends: MonthlyTrend[] = Array.from(monthMap.entries()).map(
      ([month, values]) => ({
        month,
        income: Math.round(values.income * 100) / 100,
        expense: Math.round(values.expense * 100) / 100,
        net: Math.round((values.income - values.expense) * 100) / 100,
      })
    );

    return { trends };
  }

  static async getRecentActivity() {
    const transactions = await prisma.transaction.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return { recentTransactions: transactions };
  }

  static async getWeeklySummary(): Promise<WeeklySummary> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    
    // setting it to exactly midnight 7 days ago so it includes the full day
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        date: {
          gte: sevenDaysAgo,
          lte: now,
        },
      },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    }

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      transactionCount: transactions.length,
      startDate: sevenDaysAgo.toISOString(),
      endDate: now.toISOString(),
    };
  }
}
