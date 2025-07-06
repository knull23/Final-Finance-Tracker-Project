'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Search, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { CATEGORIES } from '@/lib/constants'
import { ITransaction } from '@/lib/models/Transaction'
import { IBudget } from '@/lib/models/Budget'

interface TransactionsProps {
  transactions?: ITransaction[]
  budgets?: IBudget[]
  loading: boolean
  addTransaction: (data: any) => Promise<any>
  deleteTransaction: (id: string) => Promise<void>
}

export function Transactions({ 
  transactions=[], 
  budgets=[], 
  loading, 
  addTransaction, 
  deleteTransaction 
}: TransactionsProps) {
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.description) {
      return
    }

    try {
      await addTransaction({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        type: formData.type,
        date: new Date(formData.date),
      })

      setFormData({
        amount: '',
        category: '',
        description: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
      })
      setIsAddingTransaction(false)
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id)
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

  // Get budget info for category selection
  const getBudgetInfo = (category: string) => {
    const budget = budgets.find(b => b.category === category)
    if (!budget) return null
    
    const percentage = (budget.spent / budget.limit) * 100
    return {
      ...budget,
      percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Transactions</h1>
          <p className="text-gray-600">Loading your transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Transactions</h1>
        <p className="text-gray-600">Manage and track all your financial transactions</p>
      </div>
      
      {/* Add Transaction Form */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black">Add New Transaction</CardTitle>
              <p className="text-sm text-gray-600">Record your income or expenses - budgets will update automatically</p>
            </div>
            <Button
              onClick={() => setIsAddingTransaction(!isAddingTransaction)}
              variant={isAddingTransaction ? "outline" : "default"}
              className="flex items-center space-x-2"
            >
              {isAddingTransaction ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddingTransaction ? 'Cancel' : 'Add Transaction'}</span>
            </Button>
          </div>
        </CardHeader>
        {isAddingTransaction && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => {
                      const budgetInfo = getBudgetInfo(category)
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category}</span>
                            {budgetInfo && formData.type === 'expense' && (
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                budgetInfo.status === 'over' ? 'bg-red-100 text-red-600' :
                                budgetInfo.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {budgetInfo.percentage.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {formData.category && formData.type === 'expense' && getBudgetInfo(formData.category) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Budget: {formatCurrency(getBudgetInfo(formData.category)!.spent)} / {formatCurrency(getBudgetInfo(formData.category)!.limit)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Add Transaction
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingTransaction(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Transaction List */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-black">All Transactions</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const budgetInfo = transaction.type === 'expense' ? getBudgetInfo(transaction.category) : null
              
              return (
                <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-200 rounded-lg hover:bg-gray-250 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-black font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">{transaction.category}</p>
                        {budgetInfo && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            budgetInfo.status === 'over' ? 'bg-red-100 text-red-600' :
                            budgetInfo.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            Budget: {budgetInfo.percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(new Date(transaction.date))}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(transaction._id!)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}