import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('finance-tracker')
    
    const body = await request.json()
    const { spent } = body
    
    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          spent: parseFloat(spent),
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('finance-tracker')
    
    const result = await db.collection('budgets').deleteOne({
      _id: new ObjectId(params.id)
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}