// backend/src/routes/payment.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create invoice for Telegram Stars payment
router.post('/create-invoice', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // In a real app, you would use Telegram Bot API to create invoice
    // For now, returning a placeholder invoice link
    const invoiceLink = `https://t.me/${process.env.BOT_USERNAME}/invoice_${bookId}`;
    
    // For demo purposes, we'll return a mock invoice link
    // In production, you'd call the Telegram Bot API to create a real invoice
    res.json({
      invoiceLink: invoiceLink,
      bookId: book.id,
      amount: book.price,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

// Verify payment (from Telegram webhook)
router.post('/verify', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // In a real app, you would verify the transaction with Telegram
    // For now, returning a success response
    res.json({ verified: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Webhook endpoint for Telegram payment updates
router.post('/webhook', async (req, res) => {
  try {
    const { update_type, ...data } = req.body;

    console.log('Received payment webhook:', update_type, data);

    // Handle different types of payment updates
    switch (update_type) {
      case 'pre_checkout_query':
        // Confirm the pre-checkout query
        // In a real app, you would validate the query and respond to Telegram
        break;

      case 'successful_payment':
        // Process successful payment
        const { invoice_payload, telegram_payment_charge_id } = data;
        
        // Parse the invoice payload
        const payload = JSON.parse(invoice_payload);
        const { bookId, userId } = payload;

        // Create a purchase record
        await prisma.purchase.create({
          data: {
            userId: userId,
            bookId: bookId,
            amount: data.total_amount / 100, // Convert from cents
            paymentMethod: 'telegram_stars',
            status: 'completed',
            transactionId: telegram_payment_charge_id,
          },
        });

        console.log(`Payment successful for user ${userId}, book ${bookId}`);
        break;

      default:
        console.log('Unknown update type:', update_type);
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;