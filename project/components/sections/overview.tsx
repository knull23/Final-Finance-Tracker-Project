'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { CATEGORY_COLORS } from '@/lib/constants'
import { ITransaction } from '@/lib/models/Transaction'
import { IBudget } from '@/lib/models/Budget'

interface OverviewProps {
  transactions?: ITransaction[]
  budgets?: IBudget[]
  loading: boolean
}

export function Overview({ transactions=[], budgets=[], loading }: OverviewProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  // Calculate financial summary
  const financialSummary = {
    totalBalance: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    monthlyIncome: transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0),
    monthlyExpenses: transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0),
    savingsRate: 0,
  }

  financialSummary.savingsRate = financialSummary.monthlyIncome > 0 
    ? ((financialSummary.monthlyIncome - financialSummary.monthlyExpenses) / financialSummary.monthlyIncome) * 100 
    : 0

  // Calculate category breakdown
  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categoryBreakdownData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / financialSummary.totalExpenses) * 100,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6B7280',
  }))

  const recentTransactions = transactions.slice(0, 5)

  // Calculate budget health
  const budgetHealth = budgets.map(budget => {
    const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
    return {
      ...budget,
      percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
    }
  })

  const overBudgetCount = budgetHealth.filter(b => b.status === 'over').length
  const warningBudgetCount = budgetHealth.filter(b => b.status === 'warning').length

  const summaryCards = [
    {
      title: 'Total Balance',
      value: financialSummary.totalBalance,
      icon: DollarSign,
      color: 'text-black',
      bgColor: 'bg-gray-200',
      subtitle: `${overBudgetCount} budgets exceeded`,
    },
    {
      title: 'Monthly Income',
      value: financialSummary.monthlyIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: `${transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth()).length} income transactions`,
    },
    {
      title: 'Monthly Expenses',
      value: financialSummary.monthlyExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      subtitle: `${transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).length} expense transactions`,
    },
    {
      title: 'Savings Rate',
      value: `${financialSummary.savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-gray-700',
      bgColor: 'bg-gray-300',
      isPercentage: true,
      subtitle: `${warningBudgetCount} budgets at risk`,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your financial health and recent activity</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="bg-gray-50 border-gray-200 hover:border-gray-400 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">{card.title}</p>
                    <p className="text-2xl font-bold text-black group-hover:text-gray-800 transition-colors">
                      {card.isPercentage ? card.value : formatCurrency(card.value as number)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdownData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        color: '#000'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#000' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600">No expense data available</p>
                  <p className="text-sm text-gray-500 mt-1">Add some expense transactions to see the breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Recent Transactions</CardTitle>
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-black font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(new Date(transaction.date))}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add your first transaction to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Status Overview */}
      {budgets.length > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Budget Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetHealth.slice(0, 6).map((budget) => (
                <div key={budget._id} className="flex items-center justify-between p-3 bg-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-black">{budget.category}</p>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    budget.status === 'over' ? 'bg-red-100 text-red-600' :
                    budget.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {budget.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}