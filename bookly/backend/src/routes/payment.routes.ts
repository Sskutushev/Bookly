// backend/src/routes/payment.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { YookassaService } from '../services/payment/yookassa-service';
import { USDTService } from '../services/payment/usdt-service';

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

    // Create invoice via Telegram Bot API
    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`,
      {
        title: book.title.substring(0, 32), // Telegram limit
        description: `Book: ${book.title} by ${book.author}`.substring(0, 255), // Telegram limit
        payload: JSON.stringify({ bookId, userId, type: 'book_purchase' }),
        provider_token: '', // Empty for Telegram Stars
        currency: 'XTR', // Telegram Stars
        prices: [
          {
            label: book.title.substring(0, 64), // Telegram limit
            amount: Math.round(book.price * 100) // Convert to cents (smallest unit)
          }
        ],
        photo_url: book.coverUrl,
        photo_size: 50000, // Size in bytes
        photo_width: 480,
        photo_height: 640,
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        is_flexible: false,
      }
    );

    if (telegramResponse.data.ok) {
      const invoiceLink = telegramResponse.data.result;

      res.json({
        invoiceLink: invoiceLink,
        bookId: book.id,
        amount: book.price,
      });
    } else {
      throw new Error(`Telegram API error: ${telegramResponse.data.description}`);
    }
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Create Yookassa payment
router.post('/create-yookassa', async (req, res) => {
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

    // Create Yookassa payment
    const payment = await YookassaService.createPayment({
      bookId,
      userId,
      amount: book.price,
      description: `Purchase of book: ${book.title}`,
    });

    res.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      status: payment.status,
    });
  } catch (error: any) {
    console.error('Create Yookassa payment error:', error);
    res.status(500).json({
      message: 'Failed to create Yookassa payment',
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Create USDT TON payment (generate wallet address)
router.post('/create-usdt-ton', async (req, res) => {
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

    // Generate TON wallet address
    const wallet = await USDTService.generateTONAddress(userId, bookId);

    res.json({
      address: wallet.address,
      expectedAmount: book.price, // In USDT equivalent
      network: 'TON',
    });
  } catch (error: any) {
    console.error('Create USDT TON payment error:', error);
    res.status(500).json({
      message: 'Failed to create USDT TON payment',
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Create USDT TRC20 payment (generate wallet address)
router.post('/create-usdt-trc20', async (req, res) => {
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

    // Generate TRC20 wallet address
    const wallet = await USDTService.generateTRC20Address(userId, bookId);

    res.json({
      address: wallet.address,
      expectedAmount: book.price, // In USDT equivalent
      network: 'TRC20',
    });
  } catch (error: any) {
    console.error('Create USDT TRC20 payment error:', error);
    res.status(500).json({
      message: 'Failed to create USDT TRC20 payment',
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Verify USDT transaction
router.post('/verify-usdt', async (req, res) => {
  try {
    const { address, network, bookId, userId } = req.body;

    if (!address || !network || !bookId || !userId) {
      return res.status(400).json({ message: 'Address, network, bookId, and userId are required' });
    }

    let verificationResult = false;

    if (network === 'TON') {
      verificationResult = await USDTService.checkTONTransaction(address, 0, bookId, userId); // Amount checking would happen in the service
    } else if (network === 'TRC20') {
      verificationResult = await USDTService.checkTRC20Transaction(address, 0, bookId, userId); // Amount checking would happen in the service
    } else {
      return res.status(400).json({ message: 'Unsupported network' });
    }

    if (verificationResult) {
      res.json({ verified: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error: any) {
    console.error('Verify USDT payment error:', error);
    res.status(500).json({
      message: 'Failed to verify USDT payment',
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Verify payment (general verification endpoint)
router.post('/verify', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // In a real app, you would verify the transaction based on its type
    // For now, returning a success response
    res.json({ verified: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Webhook endpoint for payments (handles various payment providers)
router.post('/webhook', async (req, res) => {
  try {
    // Check if this is a Yookassa webhook
    if (req.headers['x-webhook-sign'] || req.headers['x-yookassa-signature']) {
      // Handle Yookassa webhook
      try {
        await YookassaService.handleWebhook(req.body);
        res.status(200).json({ message: 'Yookassa webhook processed' });
        return;
      } catch (error) {
        console.error('Error processing Yookassa webhook:', error);
      }
    }

    // Handle Telegram webhook as before
    const update = req.body;

    // Handle different types of updates
    if (update.pre_checkout_query) {
      // Handle pre-checkout query (before user pays)
      const preCheckoutQuery = update.pre_checkout_query;

      try {
        // Always answer the pre-checkout query to confirm
        await axios.post(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerPreCheckoutQuery`,
          {
            pre_checkout_query_id: preCheckoutQuery.id,
            ok: true, // Confirm the checkout
          }
        );

        console.log('Pre-checkout query confirmed for:', preCheckoutQuery.invoice_payload);
      } catch (error) {
        console.error('Error confirming pre-checkout:', error);
        // Still respond to Telegram to avoid webhook timeout
      }
    }
    else if (update.message && update.message.successful_payment) {
      // Handle successful payment
      const payment = update.message.successful_payment;

      try {
        // Parse the invoice payload
        const payload = JSON.parse(payment.invoice_payload);
        const { bookId, userId, type } = payload;

        if (type === 'book_purchase') {
          // Create a purchase record
          await prisma.purchase.create({
            data: {
              userId: userId,
              bookId: bookId,
              amount: payment.total_amount / 100, // Convert from cents
              paymentMethod: 'telegram_stars',
              status: 'completed',
              transactionId: payment.telegram_payment_charge_id,
            },
          });

          console.log(`Payment successful for user ${userId}, book ${bookId}`);

          // Send confirmation message to user (optional)
          try {
            await axios.post(
              `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
              {
                chat_id: update.message.from.id,
                text: `Спасибо за покупку! Книга "${(await prisma.book.findUnique({where: {id: bookId}}))?.title}" теперь доступна в вашей библиотеке.`,
              }
            );
          } catch (msgError) {
            console.error('Error sending confirmation message:', msgError);
          }
        }
      } catch (error) {
        console.error('Error processing successful payment:', error);
        // Log the error but still respond to Telegram
      }
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;