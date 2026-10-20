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
    const pageText = content.items.map((item: any) => item.str).join(' ');
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
  } else {
    throw new Error(`Формат ${ext || file.type} пока не поддерживается`);
  }

  if (!text.trim()) {
    throw new Error('Не удалось извлечь текст из файла');
  }

  return { text, format };
}
