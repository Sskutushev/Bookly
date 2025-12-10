// utils/fb2-parser.ts
export interface FB2Book {
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  sections: string[];
}

export const parseFB2Content = (content: string): FB2Book => {
  // This is a simplified parser that extracts basic elements from FB2
  // In a real implementation, you would want a more robust XML parser
  
  // Extract book title
  const titleMatch = content.match(/<book-title>(.*?)<\/book-title>/);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : 'Без названия';
  
  // Extract author
  const authorFirstMatch = content.match(/<first-name>(.*?)<\/first-name>/);
  const authorLastMatch = content.match(/<last-name>(.*?)<\/last-name>/);
  const author = `${authorFirstMatch ? authorFirstMatch[1] : ''} ${authorLastMatch ? authorLastMatch[1] : ''}`.trim();
  
  // Extract description
  const descriptionMatch = content.match(/<annotation><p>(.*?)<\/p>/s);
  let description = 'Описание отсутствует';
  if (descriptionMatch) {
    description = descriptionMatch[1].replace(/<[^>]*>/g, '');
  }
  
  // Extract sections (chapters)
  const sectionMatches = content.match(/<section>[\s\S]*?<title>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/title>([\s\S]*?)<\/section>/g);
  let sections: string[] = [];
  
  if (sectionMatches) {
    sections = sectionMatches.map(section => {
      const paragraphs = section.match(/<p>(.*?)<\/p>/g) || [];
      return paragraphs
        .map(p => p.replace(/<[^>]*>/g, '').trim())
        .filter(p => p.length > 0)
        .join('\n\n');
    }).filter(section => section.length > 0);
  } else {
    // If no sections found, try to extract content by paragraphs
    const paragraphs = content.match(/<p>(.*?)<\/p>/g) || [];
    const fullText = paragraphs
      .map(p => p.replace(/<[^>]*>/g, '').trim())
      .filter(p => p.length > 0)
      .join('\n\n');
    
    // Split the full text into sections of approximately 1000 characters
    if (fullText.length > 0) {
      sections = [];
      for (let i = 0; i < fullText.length; i += 1000) {
        sections.push(fullText.substring(i, i + 1000));
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
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};