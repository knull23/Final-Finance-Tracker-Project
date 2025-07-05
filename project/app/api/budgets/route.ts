import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('finance-tracker')
    
    const budgets = await db
      .collection('budgets')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('finance-tracker')
    
    const body = await request.json()
    const { category, limit, spent = 0, period } = body
    
    const budget = {
      category,
      limit: parseFloat(limit),
      spent: parseFloat(spent),
      period,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection('budgets').insertOne(budget)
    
    const newBudget = {
      _id: result.insertedId.toString(),
      ...budget,
    }
    
    return NextResponse.json(newBudget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}