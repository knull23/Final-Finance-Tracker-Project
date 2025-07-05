import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('finance-tracker')
    
    // Get the transaction before deleting to update budget
    const transaction = await db.collection('transactions').findOne({
      _id: new ObjectId(params.id)
    })
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    
    // Delete the transaction
    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(params.id)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    
    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      const budget = await db.collection('budgets').findOne({
        category: transaction.category
      })
      
      if (budget) {
        await db.collection('budgets').updateOne(
          { _id: budget._id },
          { 
            $inc: { spent: -transaction.amount },
            $set: { updatedAt: new Date() }
          }
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}