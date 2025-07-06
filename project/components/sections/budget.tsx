'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { CATEGORIES } from '@/lib/constants'
import { IBudget } from '@/lib/models/Budget'
import { ITransaction } from '@/lib/models/Transaction'

interface BudgetProps {
  budgets?: IBudget[]
  transactions?: ITransaction[]
  loading: boolean
  addBudget: (data: any) => Promise<any>
  deleteBudget: (id: string) => Promise<void>
}

export function Budget({ 
  budgets = [], 
  transactions = [], 
  loading, 
  addBudget, 
  deleteBudget 
}: BudgetProps) {
  const [isAddingBudget, setIsAddingBudget] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'yearly',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.limit) {
      return
    }

    // Calculate current spent amount for this category
    const currentSpent = transactions
      .filter(t => t.type === 'expense' && t.category === formData.category)
      .reduce((sum, t) => sum + t.amount, 0)

    try {
      await addBudget({
        category: formData.category,
        limit: parseFloat(formData.limit),
        spent: currentSpent,
        period: formData.period,
      })

      setFormData({
        category: '',
        limit: '',
        period: 'monthly',
      })
      setIsAddingBudget(false)
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id)
      } catch (error) {
        console.error('Error deleting budget:', error)
      }
    }
  }

  const getBudgetStatus = (budget: IBudget) => {
    const percentage = (budget.spent / budget.limit) * 100
    if (percentage >= 100) return 'over'
    if (percentage >= 80) return 'warning'
    return 'good'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default: return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  // Get categories that don't have budgets yet
  const availableCategories = CATEGORIES.filter(category => 
    !budgets.some(budget => budget.category === category)
  )

  // Calculate budget summary
  const budgetSummary = {
    totalBudget: budgets.reduce((sum, b) => sum + b.limit, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
    overBudgetCount: budgets.filter(b => getBudgetStatus(b) === 'over').length,
    warningCount: budgets.filter(b => getBudgetStatus(b) === 'warning').length,
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Budget Management</h1>
          <p className="text-gray-600">Loading your budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Budget Management</h1>
        <p className="text-gray-600">Set and track your spending limits by category - automatically synced with transactions</p>
      </div>

      {/* Budget Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-black">{formatCurrency(budgetSummary.totalBudget)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(budgetSummary.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Over Budget</p>
              <p className="text-xl font-bold text-red-600">{budgetSummary.overBudgetCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-xl font-bold text-yellow-600">{budgetSummary.warningCount}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Add Budget Form */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-black">Create New Budget</CardTitle>
              <p className="text-sm text-gray-600">Set spending limits for categories - current spending will be calculated automatically</p>
            </div>
            <Button
              onClick={() => setIsAddingBudget(!isAddingBudget)}
              variant={isAddingBudget ? "outline" : "default"}
              className="flex items-center space-x-2"
              disabled={availableCategories.length === 0}
            >
              {isAddingBudget ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddingBudget ? 'Cancel' : 'Add Budget'}</span>
            </Button>
          </div>
          {availableCategories.length === 0 && (
            <p className="text-sm text-gray-500">All categories have budgets assigned</p>
          )}
        </CardHeader>
        {isAddingBudget && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => {
                      const currentSpent = transactions
                        .filter(t => t.type === 'expense' && t.category === category)
                        .reduce((sum, t) => sum + t.amount, 0)
                      
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category}</span>
                            {currentSpent > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                Current: {formatCurrency(currentSpent)}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Limit ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <Select value={formData.period} onValueChange={(value: 'monthly' | 'yearly') => setFormData(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Create Budget
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingBudget(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const status = getBudgetStatus(budget)
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
          const relatedTransactions = transactions.filter(t => 
            t.type === 'expense' && t.category === budget.category
          ).length
          
          return (
            <Card key={budget._id} className="bg-gray-50 border-gray-200 hover:border-gray-400 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <h3 className="text-lg font-semibold text-black">{budget.category}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {budget.period} • {relatedTransactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </p>
                      <p className={`text-sm font-medium ${
                        status === 'over' ? 'text-red-600' : 
                        status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}% used
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(budget._id!)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(status)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Remaining: {formatCurrency(Math.max(0, budget.limit - budget.spent))}
                  </span>
                  {status === 'over' && (
                    <span className="text-red-600 font-medium">
                      Over by: {formatCurrency(budget.spent - budget.limit)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 text-lg">No budgets created yet.</p>
            <p className="text-gray-500 text-sm mt-2">Create your first budget to start tracking your spending limits.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}