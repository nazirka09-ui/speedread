import JSZip from 'jszip';

export async function importEpub(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const texts: string[] = [];

  for (const name of Object.keys(zip.files).sort()) {
    if (name.match(/\.(xhtml|html|htm)$/i) && !name.includes('nav') && !name.includes('toc')) {
      const content = await zip.files[name].async('string');
      const text = extractTextFromHtml(content);
      if (text) texts.push(text);
    }
  }

  return texts.join('\n\n').trim();
}

function extractTextFromHtml(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

export async function importTxt(file: File): Promise<string> {
  const text = await file.text();
  return text.replace(/^\uFEFF/, '');
}

export async function importDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function importPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    text += pageText + '\n';
  }
  return text.trim();
}

export async function importFile(file: File): Promise<{ text: string; format: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let text = '';
  let format = ext;

  if (ext === 'txt' || file.type === 'text/plain') {
    text = await importTxt(file);
    format = 'txt';
  } else if (ext === 'docx' || file.type.includes('wordprocessingml')) {
    text = await importDocx(file);
    format = 'docx';
  } else if (ext === 'pdf' || file.type === 'application/pdf') {
    text = await importPdf(file);
    format = 'pdf';
  } else if (ext === 'epub' || file.type === 'application/epub+zip') {
    text = await importEpub(file);
    format = 'epub';
  } else {
    throw new Error(`Формат ${ext || file.type} пока не поддерживается`);
  }

  if (!text.trim()) {
    throw new Error('Не удалось извлечь текст из файла');
  }

  return { text, format };
}
