import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Transaction } from "@/types/transaction";

export const useTransaction = () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const isAddingTransaction = ref(false);
  const isEditingTransaction = ref(false);
  const isDeletingTransaction = ref(false);

  const fetchTransactions = (groupId: string) => {
    const q = query(
      collection(db, "transactions"),
      where("groupId", "==", groupId)
    );

    onSnapshot(q, (snapshot) => {
      transactions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    });
  };

  const addTransaction = async (data: Omit<Transaction, 'id'>) => {
    isAddingTransaction.value = true;
    try {
      await addDoc(collection(db, "transactions"), data);
    } finally {
      isAddingTransaction.value = false;
    }
  };

  const editTransaction = async (id: string, data: Omit<Transaction, 'id'>) => {
    isEditingTransaction.value = true;
    try {
      const transactionRef = doc(db, "transactions", id);
      await updateDoc(transactionRef, data);
    } finally {
      isEditingTransaction.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    isDeletingTransaction.value = true;
    try {
      const transactionRef = doc(db, "transactions", id);
      await deleteDoc(transactionRef);
    } finally {
      isDeletingTransaction.value = false;
    }
  };

  const calculateDebt = (currentUserId: string) => {
    let balance = 0;
    transactions.value.forEach(t => {
      if (!t.split) return;
      t.split.forEach(s => {
        if (s.userId === currentUserId) {
          if (t.paidBy !== currentUserId) {
            balance -= s.amount; // You owe
          } else {
            balance += s.amount; // You are owed
          }
        }
      });
    });
    return balance;
  };

  const filterByDateRange = (startDate: number, endDate: number) => {
    return transactions.value.filter(t => {
      return t.createdAt >= startDate && t.createdAt <= endDate;
    });
  };

  const getDateRangeData = (startDate: number, endDate: number, compareStartDate: number, compareEndDate: number) => {
    const currentPeriod = filterByDateRange(startDate, endDate);
    const comparePeriod = filterByDateRange(compareStartDate, compareEndDate);

    const currentGrouped = {};
    const compareGrouped = {};

    currentPeriod.forEach(t => {
      if (t.type === 'expense') {
        currentGrouped[t.category] = (currentGrouped[t.category] || 0) + t.amount;
      }
    });

    comparePeriod.forEach(t => {
      if (t.type === 'expense') {
        compareGrouped[t.category] = (compareGrouped[t.category] || 0) + t.amount;
      }
    });

    return {
      current: currentGrouped,
      compare: compareGrouped
    };
  };

  return {
    transactions,
    isLoading,
    isAddingTransaction,
    isEditingTransaction,
    isDeletingTransaction,
    fetchTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    calculateDebt,
    filterByDateRange,
    getDateRangeData
  };
};
