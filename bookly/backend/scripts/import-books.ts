import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function importBooks() {
  try {
    console.log('--- Starting Robust Book Import ---');

    const booksSourcePath = path.resolve(__dirname, '..', '..', '..', 'books');
    const uploadsCoversDir = path.resolve(__dirname, '..', 'uploads', 'covers');
    const uploadsBooksDir = path.resolve(__dirname, '..', 'uploads', 'books');

    // Ensure upload directories exist
    fs.mkdirSync(uploadsCoversDir, { recursive: true });
    fs.mkdirSync(uploadsBooksDir, { recursive: true });

    const files = fs.readdirSync(booksSourcePath);

    // --- Find and process книга1 ---
    const descriptionFile = 'книга1';
    const coverFile = 'книга1-обл.jpg';
    const bookFile = 'книга1.fb2';

    if (files.includes(descriptionFile) && files.includes(coverFile) && files.includes(bookFile)) {
      const descPath = path.join(booksSourcePath, descriptionFile);
      const descContent = fs.readFileSync(descPath, 'utf-8');
      const lines = descContent.split('\n').filter(line => line.trim() !== '');

      if (lines.length >= 3) {
        const title = lines[0].trim();
        const author = lines[1].replace('Автор:', '').trim();
        const description = lines.slice(2).join('\n').trim();

        console.log(`Processing book: ${title}`);

        // Check if book already exists to prevent duplicates
        const existingBook = await prisma.book.findFirst({
          where: { title: { equals: title, mode: 'insensitive' } }
        });

        if (existingBook) {
          console.log(`Book "${title}" already exists. Skipping.`);
        } else {
          // --- Handle Cover ---
          const coverExtension = path.extname(coverFile);
          const newCoverName = `${uuidv4()}${coverExtension}`;
          const sourceCoverPath = path.join(booksSourcePath, coverFile);
          const destCoverPath = path.join(uploadsCoversDir, newCoverName);
          fs.copyFileSync(sourceCoverPath, destCoverPath);
          const finalCoverUrl = `/uploads/covers/${newCoverName}`;
          console.log(`Cover copied to: ${finalCoverUrl}`);

          // --- Handle Book File ---
          const bookExtension = path.extname(bookFile);
          const newBookName = `${uuidv4()}${bookExtension}`;
          const sourceBookPath = path.join(booksSourcePath, bookFile);
          const destBookPath = path.join(uploadsBooksDir, newBookName);
          fs.copyFileSync(sourceBookPath, destBookPath);
          const finalBookUrl = `/uploads/books/${newBookName}`;
          console.log(`Book file copied to: ${finalBookUrl}`);

          // --- Create DB Record ---
          const book = await prisma.book.create({
            data: {
              title: title,
              author: author,
              description: description,
              coverUrl: finalCoverUrl,
              pdfUrl: finalBookUrl, // We use this field for the fb2 path
              price: 0,
              isFree: true,
              pageCount: 250, // Placeholder page count
            },
          });
          console.log(`Successfully added "${book.title}" to the database.`);
        }
      } else {
        console.log(`File 'книга1' has insufficient data or associated files are missing. Lines found: ${lines.length}`);
      }
    } else {
        console.log('Did not find the expected files (книга1, книга1-обл.jpg, книга1.fb2) in the books directory.');
    }

    console.log('--- Book Import Finished ---');

  } catch (error) {
    console.error('Book import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importBooks();
