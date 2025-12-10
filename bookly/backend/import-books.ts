import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

async function importBooks() {
  try {
    console.log('Начинаю импорт книг...');
    
    // Get all files in the books directory
    const booksDirPath = 'C:\\Users\\sskut\\Desktop\\Bookly\\books';
    const files = fs.readdirSync(booksDirPath);
    
    console.log(`Найдено файлов: ${files.length}`);
    
    // Find all description files (книга1, книга2, etc.)
    const descriptionFiles = files.filter(file => 
      file.startsWith('книга') && 
      path.extname(file) === '' && 
      !file.endsWith('.fb2')
    ).sort();
    
    console.log(`Найдено файлов описаний: ${descriptionFiles.length}`);
    
    // Find all .fb2 files
    const fb2Files = files.filter(file => file.endsWith('.fb2')).sort();
    
    console.log(`Найдено fb2 файлов: ${fb2Files.length}`);
    
    // Process each description file
    for (const descFile of descriptionFiles) {
      const descPath = path.join(booksDir, descFile);
      const descContent = fs.readFileSync(descPath, 'utf8');
      
      // Extract title, author, and description from the text file
      const lines = descContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 3) {
        console.log(`Пропускаю файл ${descFile} - недостаточно данных`);
        continue;
      }
      
      const title = lines[0].trim();
      const authorLine = lines[1].trim();
      const author = authorLine.replace('Автор:', '').trim();
      const description = lines.slice(2).join('\n').trim();
      
      console.log(`Обработка: ${title} by ${author}`);
      
      // Find corresponding FB2 file
      const fileNumber = descFile.match(/книга(\d+)/);
      if (!fileNumber) {
        console.log(`Не могу определить номер книги для ${descFile}`);
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
        console.log(`Книга уже существует: ${title}`);
        continue;
      }
      
      // Find corresponding cover image (книга2, книга3, etc.)
      let coverUrl = '/covers/default.jpg'; // Default cover
      const coverFile = files.find(file => {
        // Looking for a file that's not .fb2 or description but has the same number
        const isNumberedFile = file.startsWith(`книга${fileNumber[1]}`);
        const isNotDescOrFb2 = !file.endsWith('.fb2') && path.extname(file) !== '';
        return isNumberedFile && isNotDescOrFb2;
      });
      
      if (coverFile) {
        coverUrl = `/covers/${coverFile}`;
        console.log(`Найдена обложка: ${coverUrl}`);
      } else {
        console.log(`Обложка не найдена для книги ${fileNumber[1]}`);
      }
      
      // Ensure the uploads/books directory exists
      const uploadsBooksDir = path.join(__dirname, 'uploads', 'books');
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
        const uploadsCoversDir = path.join(__dirname, 'uploads', 'covers');
        if (!fs.existsSync(uploadsCoversDir)) {
          fs.mkdirSync(uploadsCoversDir, { recursive: true });
        }

        const sourceCoverPath = path.join(booksDirPath, coverFile);
        const destCoverPath = path.join(uploadsCoversDir, coverFile);
        fs.copyFileSync(sourceCoverPath, destCoverPath);

        coverUrl = `/uploads/covers/${coverFile}`;
      }

      // Create a book record in the database
      const book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          description: description,
          coverUrl: coverUrl,
          pdfUrl: fb2File ? `/uploads/books/${fb2File}` : '/uploads/books/default.fb2',
          price: 0, // Free book for demo
          isFree: true,
          pageCount: pageCount,
        },
      });

      console.log(`Добавлена книга в БД: ${book.title} (ID: ${book.id})`);
    }
    
    // Handle any remaining FB2 files that might not have description files
    for (const fb2File of fb2Files) {
      const content = fs.readFileSync(path.join(booksDir, fb2File), 'utf8');
      
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
      const uploadsBooksDir = path.join(__dirname, 'uploads', 'books');
      if (!fs.existsSync(uploadsBooksDir)) {
        fs.mkdirSync(uploadsBooksDir, { recursive: true });
      }

      // Copy the FB2 file to the uploads directory
      const sourceFb2Path = path.join(booksDirPath, fb2File);
      const destFb2Path = path.join(uploadsBooksDir, fb2File);
      fs.copyFileSync(sourceFb2Path, destFb2Path);

      const book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          description: description,
          coverUrl: '/uploads/covers/default.jpg',
          pdfUrl: `/uploads/books/${fb2File}`,
          price: 0,
          isFree: true,
          pageCount: 200,
        },
      });

      console.log(`Добавлена книга из FB2: ${book.title} by ${book.author}`);
    }
    
    console.log('Импорт книг завершен!');
  } catch (error) {
    console.error('Ошибка импорта книг:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importBooks();