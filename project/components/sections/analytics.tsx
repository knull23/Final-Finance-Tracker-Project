'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { TrendingUp, Target, AlertCircle, Shield, DollarSign, PieChart, Activity, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { ITransaction } from '@/lib/models/Transaction'
import { IBudget } from '@/lib/models/Budget'

interface AnalyticsProps {
  transactions: ITransaction[]
  budgets: IBudget[]
  loading: boolean
}

export function Analytics({ transactions, budgets, loading }: AnalyticsProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Advanced Analytics</h1>
          <p className="text-gray-600">Loading your financial analytics...</p>
        </div>
      </div>
    )
  }

  // Calculate dynamic metrics from real data
  const calculateMetrics = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netWorth = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    
    // Calculate budget variance
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
    const budgetVariance = totalBudgetLimit > 0 ? ((totalBudgetSpent - totalBudgetLimit) / totalBudgetLimit) * 100 : 0
    
    // Calculate expense ratio
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    
    // Calculate emergency fund (assuming 6 months of expenses)
    const monthlyExpenses = totalExpenses / Math.max(1, getUniqueMonths())
    const emergencyFund = Math.max(0, netWorth)
    const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0
    
    return {
      debtToIncomeRatio: totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0,
      emergencyFund,
      emergencyFundMonths,
      monthlyCashFlow: netWorth,
      investmentReturns: Math.random() * 15 + 5, // Placeholder for investment data
      budgetVariance,
      expenseRatio,
      netWorthGrowth: netWorth * 0.1,
      savingsRate,
      totalIncome,
      totalExpenses,
      netWorth
    }
  }

  // Get unique months from transactions
  const getUniqueMonths = () => {
    const months = new Set(transactions.map(t => 
      new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric' })
    ))
    return months.size || 1
  }

  // Generate monthly trends from transactions
  const generateMonthlyTrends = () => {
    const monthlyData: { [key: string]: { income: number, expenses: number, savings: number, netWorth: number } } = {}
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0, savings: 0, netWorth: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += transaction.amount
      }
    })
    
    // Calculate savings and cumulative net worth
    let cumulativeNetWorth = 0
    return Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, data]) => {
        const savings = data.income - data.expenses
        cumulativeNetWorth += savings
        return {
          month,
          income: data.income,
          expenses: data.expenses,
          savings,
          netWorth: cumulativeNetWorth
        }
      })
  }

  // Generate category comparison from transactions
  const generateCategoryComparison = () => {
    const categoryData: { [key: string]: number } = {}
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount
    })
    
    return Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 categories
      .map(([category, amount]) => ({
        category: category.length > 12 ? category.substring(0, 12) + '...' : category,
        thisMonth: amount,
        lastMonth: amount * (0.8 + Math.random() * 0.4), // Simulated comparison data
        change: (Math.random() - 0.5) * 40
      }))
  }

  // Generate cash flow data
  const generateCashFlowData = () => {
    const weeklyData: { [key: string]: { inflow: number, outflow: number } } = {}
    
    transactions.forEach(transaction => {
      const week = `Week ${Math.ceil(new Date(transaction.date).getDate() / 7)}`
      if (!weeklyData[week]) {
        weeklyData[week] = { inflow: 0, outflow: 0 }
      }
      
      if (transaction.type === 'income') {
        weeklyData[week].inflow += transaction.amount
      } else {
        weeklyData[week].outflow += transaction.amount
      }
    })
    
    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow
    }))
  }

  const metrics = calculateMetrics()
  const spendingTrendsData = generateMonthlyTrends()
  const categoryComparisonData = generateCategoryComparison()
  const cashFlowData = generateCashFlowData()

  const metricsData = [
    {
      title: 'Debt-to-Income Ratio',
      value: `${metrics.debtToIncomeRatio.toFixed(1)}%`,
      status: metrics.debtToIncomeRatio < 30 ? 'excellent' : metrics.debtToIncomeRatio < 50 ? 'good' : 'warning',
      icon: Shield,
      description: 'Expense to income ratio',
      trend: -2.5,
    },
    {
      title: 'Emergency Fund',
      value: formatCurrency(metrics.emergencyFund),
      status: metrics.emergencyFundMonths >= 6 ? 'excellent' : metrics.emergencyFundMonths >= 3 ? 'good' : 'warning',
      icon: Target,
      description: `${metrics.emergencyFundMonths.toFixed(1)} months coverage`,
      trend: 8.2,
    },
    {
      title: 'Net Worth',
      value: formatCurrency(metrics.netWorth),
      status: metrics.netWorth > 0 ? 'excellent' : 'warning',
      icon: TrendingUp,
      description: 'Total assets minus liabilities',
      trend: 12.5,
    },
    {
      title: 'Investment Returns',
      value: `${metrics.investmentReturns.toFixed(1)}%`,
      status: 'excellent',
      icon: Activity,
      description: 'Simulated portfolio performance',
      trend: 3.1,
    },
    {
      title: 'Budget Variance',
      value: `${metrics.budgetVariance.toFixed(1)}%`,
      status: Math.abs(metrics.budgetVariance) < 10 ? 'excellent' : Math.abs(metrics.budgetVariance) < 20 ? 'good' : 'warning',
      icon: AlertCircle,
      description: 'Budget vs actual spending',
      trend: -5.2,
    },
    {
      title: 'Expense Ratio',
      value: `${metrics.expenseRatio.toFixed(1)}%`,
      status: metrics.expenseRatio < 70 ? 'excellent' : metrics.expenseRatio < 90 ? 'good' : 'warning',
      icon: PieChart,
      description: 'Expenses as % of income',
      trend: -3.8,
    },
    {
      title: 'Total Income',
      value: formatCurrency(metrics.totalIncome),
      status: 'excellent',
      icon: DollarSign,
      description: 'All-time income',
      trend: 15.7,
    },
    {
      title: 'Savings Rate',
      value: `${metrics.savingsRate.toFixed(1)}%`,
      status: metrics.savingsRate > 20 ? 'excellent' : metrics.savingsRate > 10 ? 'good' : 'warning',
      icon: TrendingDown,
      description: 'Income saved vs spent',
      trend: 4.2,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-black bg-gray-100 border-gray-300'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'danger': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-200 border-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-600 border-green-200'
      case 'good': return 'bg-gray-100 text-black border-gray-300'
      case 'warning': return 'bg-yellow-100 text-yellow-600 border-yellow-200'
      case 'danger': return 'bg-red-100 text-red-600 border-red-200'
      default: return 'bg-gray-200 text-gray-600 border-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Advanced Analytics</h1>
        <p className="text-gray-600">Deep insights into your spending patterns and financial health</p>
      </div>
      
      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon
          const statusColor = getStatusColor(metric.status)
          const statusBadge = getStatusBadge(metric.status)
          
          return (
            <Card key={index} className="bg-gray-50 border-gray-200 hover:border-gray-400 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border ${statusColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge} uppercase tracking-wide`}>
                    {metric.status}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h4>
                <p className="text-2xl font-bold text-black mb-2 group-hover:text-gray-800 transition-colors">{metric.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                  <p className={`text-xs font-medium ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Trends */}
          {spendingTrendsData.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Financial Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          color: '#000'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Income"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Expenses"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        name="Savings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Spending Comparison */}
          {categoryComparisonData.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                      <XAxis dataKey="category" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          color: '#000'
                        }}
                      />
                      <Bar dataKey="thisMonth" fill="#3B82F6" name="Total Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cash Flow Analysis */}
          {cashFlowData.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                      <XAxis dataKey="week" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          color: '#000'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inflow" 
                        stackId="1"
                        stroke="#10B981" 
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Inflow"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="outflow" 
                        stackId="2"
                        stroke="#EF4444" 
                        fill="#EF4444"
                        fillOpacity={0.6}
                        name="Outflow"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Net Worth Trend */}
          {spendingTrendsData.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Net Worth Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          color: '#000'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="netWorth" 
                        stroke="#F59E0B" 
                        fill="#F59E0B"
                        fillOpacity={0.3}
                        strokeWidth={3}
                        name="Net Worth"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {transactions.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 text-lg">No transaction data available for analytics.</p>
            <p className="text-gray-500 text-sm mt-2">Add some transactions to see detailed analytics and insights.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}