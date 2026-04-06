// selecting fields safely so passwords dont leak out 
export const userSelectFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userWithStatsSelect = {
  ...userSelectFields,
  _count: {
    select: { transactions: true },
  },
} as const;
