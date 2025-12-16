// utils/fb2-parser.ts
export interface FB2Book {
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  sections: string[];
}

export const parseFB2Content = (content: string): FB2Book => {
  // Create a DOM parser to properly handle XML
  const parser = new DOMParser();
  let xmlDoc;
  try {
    xmlDoc = parser.parseFromString(content, 'application/xml');
  } catch (error) {
    console.error('Error parsing FB2 XML:', error);
    return {
      title: 'Ошибка парсинга',
      author: 'Неизвестный',
      description: 'Не удалось разобрать содержимое файла',
      sections: ['Файл не может быть прочитан из-за ошибки формата']
    };
  }

  // Check for parsing errors
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    console.error('FB2 XML parsing error');
    return {
      title: 'Ошибка парсинга',
      author: 'Неизвестный',
      description: 'Файл FB2 содержит ошибки форматирования',
      sections: ['Файл не может быть прочитан из-за ошибки формата']
    };
  }

  // Extract book title
  let title = 'Без названия';
  const titleElement = xmlDoc.querySelector('book-title');
  if (titleElement) {
    title = decodeHtmlEntities(titleElement.textContent || '');
  } else {
    // Try to find in the document info
    const docTitleElement = xmlDoc.querySelector('title-info title');
    if (docTitleElement) {
      title = decodeHtmlEntities(docTitleElement.textContent || '');
    }
  }

  // Extract author
  let author = 'Неизвестный';
  const authorElement = xmlDoc.querySelector('author');
  if (authorElement) {
    const firstName = authorElement.querySelector('first-name');
    const lastName = authorElement.querySelector('last-name');
    const middleName = authorElement.querySelector('middle-name');

    const firstNameText = firstName ? decodeHtmlEntities(firstName.textContent || '') : '';
    const lastNameText = lastName ? decodeHtmlEntities(lastName.textContent || '') : '';
    const middleNameText = middleName ? decodeHtmlEntities(middleName.textContent || '') : '';

    author = `${firstNameText} ${middleNameText} ${lastNameText}`.trim();
  }

  // Extract description
  let description = 'Описание отсутствует';
  const annotationElement = xmlDoc.querySelector('annotation');
  if (annotationElement) {
    const annotationPar = annotationElement.querySelector('p');
    if (annotationPar) {
      description = decodeHtmlEntities(annotationPar.textContent || '').substring(0, 200) + '...';
    } else {
      description = decodeHtmlEntities(annotationElement.textContent || '').substring(0, 200) + '...';
    }
  }

  // Extract sections (chapters)
  const sections: string[] = [];

  // First, try to get sections with titles
  const sectionElements = xmlDoc.querySelectorAll('section');
  if (sectionElements.length > 0) {
    sectionElements.forEach((sectionElement) => {
      let sectionTitle = '';
      const titleElement = sectionElement.querySelector('title');
      if (titleElement) {
        sectionTitle = decodeHtmlEntities(titleElement.textContent || '') + '\n\n';
      }

      const paragraphs = sectionElement.querySelectorAll('p');
      if (paragraphs.length > 0) {
        const sectionContent = Array.from(paragraphs)
          .map(p => decodeHtmlEntities(p.textContent || ''))
          .join('\n\n');

        if (sectionContent.trim().length > 0) {
          sections.push(sectionTitle + sectionContent);
        }
      } else {
        // If no paragraphs, get the text content
        const sectionContent = decodeHtmlEntities(sectionElement.textContent || '');
        if (sectionContent.trim().length > 0) {
          sections.push(sectionTitle + sectionContent);
        }
      }
    });
  } else {
    // If no sections, get the body content
    const bodyElements = xmlDoc.querySelectorAll('body');
    if (bodyElements.length > 0) {
      bodyElements.forEach((bodyElement) => {
        const paragraphs = bodyElement.querySelectorAll('p');
        if (paragraphs.length > 0) {
          // Group paragraphs into sections of ~1000 characters
          let currentSection = '';
          let paragraphCount = 0;

          paragraphs.forEach((p, index) => {
            const paragraphText = decodeHtmlEntities(p.textContent || '');
            if ((currentSection + paragraphText).length > 1000 || paragraphCount > 10) {
              if (currentSection.trim().length > 0) {
                sections.push(currentSection);
                currentSection = '';
                paragraphCount = 0;
              }
            }

            currentSection += paragraphText + '\n\n';
            paragraphCount++;

            // Add the last section if it's the last paragraph
            if (index === paragraphs.length - 1 && currentSection.trim().length > 0) {
              sections.push(currentSection);
            }
          });
        }
      });
    }
  }

  // If no sections were found, create one from the entire content
  if (sections.length === 0) {
    const allText = xmlDoc.documentElement.textContent || '';
    if (allText.length > 0) {
      // Split into sections of ~1000 characters
      for (let i = 0; i < allText.length; i += 1000) {
        sections.push(allText.substring(i, i + 1000));
      }
    }
  }

  return {
    title,
    author,
    description,
    sections
  };
};

export const decodeHtmlEntities = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
};