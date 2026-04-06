import prisma from '../../config/db';
import { Role, UserStatus } from '../../types';
import { NotFoundError } from '../../utils/errors.util';
import { PaginationUtil } from '../../utils/pagination.util';
import { userSelectFields, userWithStatsSelect } from './user.model';

export class UserService {
  static async getAllUsers(page?: string, limit?: string) {
    const pagination = PaginationUtil.parseParams(page, limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: userWithStatsSelect,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    const meta = PaginationUtil.buildMeta(pagination.page, pagination.limit, total);

    return { users, pagination: meta };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userWithStatsSelect,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  static async updateRole(id: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: userSelectFields,
    });

    return updatedUser;
  }

  static async updateStatus(id: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: userSelectFields,
    });

    return updatedUser;
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // if we hard delete this, users transactions get orphaned or cascade fails
    // soft deleting transactions first to be safe
    await prisma.transaction.updateMany({
      where: { createdBy: id },
      data: { isDeleted: true },
    });

    await prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }
}
