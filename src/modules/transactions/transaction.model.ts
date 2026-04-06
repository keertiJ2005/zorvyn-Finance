export const transactionSelectFields = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  description: true,
  isDeleted: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const transactionWithUserSelect = {
  ...transactionSelectFields,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;
