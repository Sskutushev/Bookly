import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

console.log('--- [DEBUG] Books Router Loaded ---');

const router = Router();
const prisma = new PrismaClient();

// Function to extract text content from XML (removing tags)
function extractTextFromXML(xmlString: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
  const match = xmlString.match(regex);
  if (match) {
    return match[1].replace(/<[^>]*>/g, '').trim();
  }
  return '';
}

// Function to extract detailed text from complex XML structures like annotation
function extractAnnotationText(xmlString: string): string {
  // Extract all <p> tags from within the annotation
  const annotationMatch = xmlString.match(/<annotation>(.*?)<\/annotation>/s);
  if (annotationMatch) {
    // Extract all paragraphs
    const paragraphs = annotationMatch[1].match(/<p>(.*?)<\/p>/gs) || [];
    return paragraphs
      .map(p => p.replace(/<[^>]*>/g, '').trim())
      .filter(p => p.length > 0)
      .join('\n\n');
  }
  return '';
}

// Get all books with filters
router.get('/', async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 12 } = req.query;

    const whereClause: any = {};

    // Filter by genre
    if (genre && genre !== 'all') {
      whereClause.genres = {
        some: {
          name: genre as string,
        },
      };
    }

    // Search by title or author
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.book.count({
      where: whereClause,
    });

    // Get books with pagination
    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        genres: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // If user is authenticated, check which books are in favorites
    let booksWithFavoriteStatus = books;
    if ((req as any).user?.id) {
      const userId = (req as any).user.id;
      const favoriteBookIds = await prisma.favorite.findMany({
        where: { userId },
        select: { bookId: true },
      }).then(favs => favs.map(fav => fav.bookId));

      booksWithFavoriteStatus = books.map(book => ({
        ...book,
        isFavorite: favoriteBookIds.includes(book.id)
      }));
    }

    res.json({
      books: booksWithFavoriteStatus,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user from request (if authenticated)
    const userId = (req as any).user?.id;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // If user is authenticated, check if book is in favorites or purchased
    if (userId) {
      const [favorite, purchase] = await Promise.all([
        prisma.favorite.findFirst({
          where: {
            userId,
            bookId: id,
          },
        }),
        prisma.purchase.findFirst({
          where: {
            userId,
            bookId: id,
            status: 'completed',
          },
        }),
      ]);

      (book as any).isFavorite = !!favorite;
      (book as any).isPurchased = !!purchase;
    }

    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

// Import books from local directory
router.post('/import', async (req, res) => {
  try {
    console.log('Starting book import...');

    // Get all files in the books directory
    const booksDirPath = 'C:\\Users\\sskut\\Desktop\\Bookly\\books';
    const files = fs.readdirSync(booksDirPath);

    console.log(`Found files: ${files.length}`);

    // Find all description files (книга1, книга2, etc.)
    const descriptionFiles = files.filter(file =>
      file.startsWith('книга') &&
      path.extname(file) === '' &&
      !file.endsWith('.fb2')
    ).sort();

    console.log(`Found description files: ${descriptionFiles.length}`);

    // Find all .fb2 files
    const fb2Files = files.filter(file => file.endsWith('.fb2')).sort();

    console.log(`Found fb2 files: ${fb2Files.length}`);

    let importedCount = 0;

    // Process each description file
    for (const descFile of descriptionFiles) {
      const descPath = path.join(booksDirPath, descFile);
      const descContent = fs.readFileSync(descPath, 'utf8');

      // Extract title, author, and description from the text file
      const lines = descContent.split('\n').filter(line => line.trim() !== '');

      if (lines.length < 3) {
        console.log(`Skipping file ${descFile} - insufficient data`);
        continue;
      }

      const title = lines[0].trim();
      const authorLine = lines[1].trim();
      const author = authorLine.replace('Автор:', '').trim();
      const description = lines.slice(2).join('\n').trim();

      console.log(`Processing: ${title} by ${author}`);

      // Find corresponding FB2 file
      const fileNumber = descFile.match(/книга(\d+)/);
      if (!fileNumber) {
        console.log(`Cannot determine book number for ${descFile}`);
        continue;
      }

      const fb2File = fb2Files.find(file => file.includes(fileNumber[1]));

      let pageCount = 200; // Default value

      if (fb2File) {
        const fb2Path = path.join(booksDirPath, fb2File);
        const fb2Content = fs.readFileSync(fb2Path, 'utf8');

        // Try to extract more detailed info from FB2 if the description file doesn't have good data
        if (description === '' || description.length < 20) {
          const fb2Description = extractAnnotationText(fb2Content);
          if (fb2Description) {
            // Use the FB2 description instead
          }
        }

        // Count paragraphs or sections to estimate page count
        const paraCount = (fb2Content.match(/<p>/g) || []).length;
        pageCount = Math.min(500, Math.max(50, Math.floor(paraCount / 5))); // Rough estimation
      }

      // Check if book already exists
      const existingBook = await prisma.book.findFirst({
        where: {
          title: { contains: title, mode: 'insensitive' },
          author: { contains: author, mode: 'insensitive' },
        },
      });

      if (existingBook) {
        console.log(`Book already exists: ${title}`);
        continue;
      }

      // Find corresponding cover image (книга2, книга3, etc.)
      let coverUrl = '/uploads/covers/default.jpg'; // Default cover
      const coverFile = files.find(file => {
        // Looking for a file that's not .fb2 or description but has the same number
        const isNumberedFile = file.startsWith(`книга${fileNumber[1]}`);
        const isNotDescOrFb2 = !file.endsWith('.fb2') && path.extname(file) !== '';
        return isNumberedFile && isNotDescOrFb2;
      });

      if (coverFile) {
        console.log(`Found cover: ${coverFile}`);
      } else {
        console.log(`No cover found for book ${fileNumber[1]}`);
      }

      // Ensure the uploads/books directory exists
      const uploadsBooksDir = path.join(__dirname, '../../uploads', 'books');
      if (!fs.existsSync(uploadsBooksDir)) {
        fs.mkdirSync(uploadsBooksDir, { recursive: true });
      }

      // Copy the FB2 file to the uploads directory
      if (fb2File) {
        const sourceFb2Path = path.join(booksDirPath, fb2File);
        const destFb2Path = path.join(uploadsBooksDir, fb2File);
        fs.copyFileSync(sourceFb2Path, destFb2Path);
      }

      // Handle cover image if it exists
      if (coverFile) {
        const uploadsCoversDir = path.join(__dirname, '../../uploads', 'covers');
        if (!fs.existsSync(uploadsCoversDir)) {
          fs.mkdirSync(uploadsCoversDir, { recursive: true });
        }

        const sourceCoverPath = path.join(booksDirPath, coverFile);
        const destCoverPath = path.join(uploadsCoversDir, coverFile);
        fs.copyFileSync(sourceCoverPath, destCoverPath);

        coverUrl = `/uploads/covers/${coverFile}`;
      }

      // Determine if book should be paid - more generic logic
      // Books with "платная" or "paid" in the title are paid, others are free for demo
      const isPaidBook = title.toLowerCase().includes('платная') ||
                        title.toLowerCase().includes('paid');

      const bookPrice = isPaidBook ?
        (149 + (parseInt(fileNumber ? fileNumber[1] : '1') || 1) * 50) :
        0; // Free book by default

      // Create a book record in the database
      const book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          description: description,
          coverUrl: coverUrl,
          pdfUrl: fb2File ? `/uploads/books/${fb2File}` : '/uploads/books/default.fb2',
          price: bookPrice,
          isFree: !isPaidBook,
          pageCount: pageCount,
        },
      });

      importedCount++;
      console.log(`Added book to DB: ${book.title} (ID: ${book.id})`);
    }

    // Handle any remaining FB2 files that might not have description files
    for (const fb2File of fb2Files) {
      const content = fs.readFileSync(path.join(booksDirPath, fb2File), 'utf8');

      // Extract info from FB2 file directly
      const title = extractTextFromXML(content, 'book-title') || 'Неизвестное название';
      const authorFirst = extractTextFromXML(content, 'first-name');
      const authorLast = extractTextFromXML(content, 'last-name');
      const author = `${authorFirst} ${authorLast}`.trim();
      const description = extractAnnotationText(content);

      // Skip if already added via description file
      const existingBook = await prisma.book.findFirst({
        where: {
          title: { contains: title, mode: 'insensitive' },
          author: { contains: author, mode: 'insensitive' },
        },
      });

      if (existingBook) {
        continue;
      }

      // Ensure the uploads/books directory exists
      const uploadsBooksDir = path.join(__dirname, '../../uploads', 'books');
      if (!fs.existsSync(uploadsBooksDir)) {
        fs.mkdirSync(uploadsBooksDir, { recursive: true });
      }

      // Copy the FB2 file to the uploads directory
      const sourceFb2Path = path.join(booksDirPath, fb2File);
      const destFb2Path = path.join(uploadsBooksDir, fb2File);
      fs.copyFileSync(sourceFb2Path, destFb2Path);

      // Determine if book should be paid - more generic logic
      // Books with "платная" or "paid" in the title are paid, others are free for demo
      const isPaidBook = title.toLowerCase().includes('платная') ||
                        title.toLowerCase().includes('paid');

      const bookPrice = isPaidBook ?
        (149 + (parseInt(fb2File.match(/\d+/)?.[0] || '1') || 1) * 50) :
        0; // Free book by default

      const book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          description: description,
          coverUrl: '/uploads/covers/default.jpg',
          pdfUrl: `/uploads/books/${fb2File}`,
          price: bookPrice,
          isFree: !isPaidBook,
          pageCount: 200,
        },
      });

      importedCount++;
      console.log(`Added book from FB2: ${book.title} by ${book.author}`);
    }

    res.json({
      message: `Import completed! ${importedCount} books imported.`,
      importedCount
    });
  } catch (error: any) {
    console.error('Book import error:', error);
    res.status(500).json({ message: 'Failed to import books', error: error.message });
  }
});

// Get book content
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id } });

    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: 'Book file not found' });
    }

    // Determine if this is a local path or a public URL
    let filePath = book.pdfUrl;
    if (book.pdfUrl.startsWith('/uploads/')) {
      filePath = path.join(__dirname, '../..', book.pdfUrl);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Book file path does not exist' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    res.setHeader('Content-Type', 'text/xml');
    res.send(fileContent);
  } catch (error: any) {
    console.error('Get book content error:', error);
    res.status(500).json({ message: 'Failed to fetch book content', error: error.message });
  }
});

// Get book fragment
router.get('/:id/fragment', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id } });

    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: 'Book file not found' });
    }

    // Determine if this is a local path or a public URL
    let filePath = book.pdfUrl;
    if (book.pdfUrl.startsWith('/uploads/')) {
      filePath = path.join(__dirname, '../..', book.pdfUrl);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Book file path does not exist' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Handle FB2 files properly - they don't have <body> tags but have <section> tags
    let fragment = '';
    const sectionMatch = fileContent.match(/<section[^>]*>([\s\S]*?)<\/section>/);

    if (sectionMatch) {
      // Extract content from the first section
      let sectionContent = sectionMatch[1];
      // Extract paragraphs from within the section
      const paragraphs = sectionContent.match(/<p>(.*?)<\/p>/gs) || [];
      fragment = paragraphs.slice(0, 5).map(p => p.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim())
        .join(' ')
        .substring(0, 1000) + '...';
    } else {
      // Fallback to the original approach
      const bodyMatch = fileContent.match(/<body>(.*?)<\/body>/s);
      const textContent = bodyMatch ? bodyMatch[1] : fileContent;

      // Clean up XML/HTML tags and truncate
      const cleanedText = textContent.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
      fragment = cleanedText.substring(0, 500) + (cleanedText.length > 500 ? '...' : '');
    }

    res.json({
      fragment,
    });
  } catch (error: any) {
    console.error('Get book fragment error:', error);
    res.status(500).json({ message: 'Failed to fetch book fragment' });
  }
});

export default router;