import { Prisma } from '@prisma/client';
import prisma from '../../config/db';
import { TransactionQueryParams, TransactionType } from '../../types';
import { NotFoundError } from '../../utils/errors.util';
import { PaginationUtil } from '../../utils/pagination.util';
import { CreateTransactionInput, UpdateTransactionInput } from '../../validators/transaction.validator';
import { transactionWithUserSelect } from './transaction.model';

export class TransactionService {
  static async create(data: CreateTransactionInput, userId: string) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        // sending empty string as desc was throwing errors so coalescing to null
        description: data.description || null,
        createdBy: userId,
      },
      select: transactionWithUserSelect,
    });

    return transaction;
  }

  static async getAll(query: TransactionQueryParams) {
    const pagination = PaginationUtil.parseParams(query.page, query.limit);

    // filtering out soft deleted always
    const where: Prisma.TransactionWhereInput = {
      isDeleted: false,
    };

    if (query.type) {
      where.type = query.type;
    }

    // letting people search by partial category name
    if (query.category) {
      where.category = {
        contains: query.category,
      };
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        (where.date as Prisma.DateTimeFilter).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.date as Prisma.DateTimeFilter).lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    // fallback to date so it doesnt just return arbitrary order
    const validSortFields = ['date', 'amount', 'category', 'type', 'createdAt'];
    const sortBy = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'date';
    const order = query.order === 'asc' ? 'asc' : 'desc';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: transactionWithUserSelect,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [sortBy]: order },
      }),
      prisma.transaction.count({ where }),
    ]);

    const meta = PaginationUtil.buildMeta(pagination.page, pagination.limit, total);

    return { transactions, pagination: meta };
  }

  static async getById(id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
      select: transactionWithUserSelect,
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  static async update(id: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    const updateData: Prisma.TransactionUpdateInput = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      select: transactionWithUserSelect,
    });

    return transaction;
  }

  static async softDelete(id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    // never hard delete financial records. auditors get mad.
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true },
      select: transactionWithUserSelect,
    });

    return transaction;
  }
}
