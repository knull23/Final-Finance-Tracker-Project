import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const body = await request.json();
    const { amount, category, description, type, date } = body;

    // Basic validation
    if (!amount || !category || !type || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const transaction = {
      amount: parsedAmount,
      category,
      description: description || '',
      type,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transaction);

    // If expense, update budget
    if (type === 'expense' && category) {
      const budget = await db.collection('budgets').findOne({ category });

      if (budget) {
        await db.collection('budgets').updateOne(
          { _id: budget._id },
          {
            $inc: { spent: parsedAmount },
            $set: { updatedAt: new Date() },
          }
        );
      }
    }

    const newTransaction = {
      _id: result.insertedId.toString(),
      ...transaction,
    };

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
