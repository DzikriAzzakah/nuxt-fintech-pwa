export interface SplitUser {
  userId: string;
  amount: number;
}

export interface Transaction {
  id?: string;
  groupId: string;
  amount: number;
  type: "income" | "expense";
  category: "food" | "transport" | "shopping" | "other" | "general";
  note: string;
  createdAt: number;
  split?: SplitUser[];
  paidBy?: string;
}
