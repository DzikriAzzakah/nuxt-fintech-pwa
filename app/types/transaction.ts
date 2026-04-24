export interface SplitUser {
  userId: string;
  amount: number;
}

export interface Transaction {
  id?: string;
  groupId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string;
  createdAt: number;
  split?: SplitUser[];
  paidBy?: string;
}
