import { useState, useEffect, useCallback } from 'react'
import { ITransaction } from '@/lib/models/Transaction'
import { IBudget } from '@/lib/models/Budget'

export function useFinanceData() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [budgets, setBudgets] = useState<IBudget[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [])

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch('/api/budgets')
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchTransactions(), fetchBudgets()])
    setLoading(false)
  }, [fetchTransactions, fetchBudgets])

  const addTransaction = useCallback(async (transactionData: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions(prev => [newTransaction, ...prev])
        
        // Refresh budgets to get updated spent amounts
        await fetchBudgets()
        
        return newTransaction
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }, [fetchBudgets])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id))
        
        // Refresh budgets to get updated spent amounts
        await fetchBudgets()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }, [fetchBudgets])

  const addBudget = useCallback(async (budgetData: any) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        const newBudget = await response.json()
        setBudgets(prev => [newBudget, ...prev])
        return newBudget
      }
    } catch (error) {
      console.error('Error adding budget:', error)
      throw error
    }
  }, [])

  const deleteBudget = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBudgets(prev => prev.filter(b => b._id !== id))
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    transactions,
    budgets,
    loading,
    addTransaction,
    deleteTransaction,
    addBudget,
    deleteBudget,
    refreshData: fetchAllData,
  }
}