export interface SplitUser {
  userId: string;
  amount: number;
}

export interface Transaction {
  id?: string;
  groupId: string;
  amount: number;
  type: "income" | "expense";
  category: "food" | "snacking" | "laundry" | "fuel" | "vehicle" | "bodycare" | "skincare" | "clothes" | "rent" | "family" | "unexpected" | "salary" | "freelance" | "bonus" | "investment" | "cashback" | "transfer" | "otherIn";
  note: string;
  createdAt: number;
  split?: SplitUser[];
  paidBy?: string;
}
