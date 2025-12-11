// backend/src/services/payment/yookassa-service.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface YookassaPaymentParams {
  bookId: string;
  userId: string;
  amount: number;
  description: string;
}

interface YookassaPaymentResponse {
  id: string;
  status: string;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
}

export class YookassaService {
  private static readonly BASE_URL = 'https://api.yookassa.ru/v3';
  private static readonly SHOP_ID = process.env.YOOKASSA_SHOP_ID;
  private static readonly SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

  static async createPayment(params: YookassaPaymentParams): Promise<YookassaPaymentResponse> {
    if (!this.SHOP_ID || !this.SECRET_KEY) {
      throw new Error('Yookassa credentials not configured');
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: params.bookId },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    const response = await axios.post(
      `${this.BASE_URL}/payments`,
      {
        amount: {
          value: params.amount.toFixed(2),
          currency: 'RUB',
        },
        payment_method_data: {
          type: 'bank_card',
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
        },
        capture: true,
        description: params.description,
        metadata: {
          bookId: params.bookId,
          userId: params.userId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': Date.now().toString(),
        },
        auth: {
          username: this.SHOP_ID,
          password: this.SECRET_KEY,
        },
      }
    );

    return response.data;
  }

  static async verifyPayment(paymentId: string): Promise<any> {
    if (!this.SHOP_ID || !this.SECRET_KEY) {
      throw new Error('Yookassa credentials not configured');
    }

    const response = await axios.get(`${this.BASE_URL}/payments/${paymentId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.SHOP_ID,
        password: this.SECRET_KEY,
      },
    });

    return response.data;
  }

  static async handleWebhook(data: any): Promise<void> {
    const { event, object } = data;

    if (event === 'payment.succeeded') {
      const payment = object;
      const metadata = payment.metadata;
      const { bookId, userId } = metadata;

      if (bookId && userId) {
        // Create purchase record
        await prisma.purchase.create({
          data: {
            userId,
            bookId,
            amount: parseFloat(payment.amount.value),
            paymentMethod: 'yookassa',
            status: 'completed',
            transactionId: payment.id,
          },
        });
      }
    }
  }
}