/**
 * Universal PDF, DOCX, and TXT Resume Text Extractor
 * Converts uploaded binary buffers into clean plain text for ATS analysis.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith(".txt")) {
      const text = await file.text();
      return cleanExtractedText(text);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileName.endsWith(".docx")) {
      const docxText = extractTextFromDocxBuffer(buffer);
      if (docxText.length > 50) return docxText;
    }

    if (fileName.endsWith(".pdf")) {
      const pdfText = extractTextFromPdfBuffer(buffer);
      if (pdfText.length > 50) return pdfText;
    }

    // Fallback: UTF-8 text extraction
    const rawText = await file.text();
    const cleaned = cleanExtractedText(rawText);
    if (cleaned.length > 50) return cleaned;

    return `Resume extracted from ${file.name}`;
  } catch (err) {
    console.error("File extraction error:", err);
    return `Resume content from ${file.name}`;
  }
}

function extractTextFromDocxBuffer(buffer: Buffer): string {
  const str = buffer.toString("binary");
  
  // Extract text inside Word XML tags <w:t>...</w:t>
  const matches: string[] = [];
  const regex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match[1] && match[1].trim()) {
      matches.push(match[1].trim());
    }
  }

  if (matches.length > 0) {
    return cleanExtractedText(matches.join(" "));
  }

  // Fallback XML tag stripping
  const xmlStripped = str.replace(/<[^>]+>/g, " ");
  return cleanExtractedText(xmlStripped);
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  const str = buffer.toString("latin1");
  const textBlocks: string[] = [];

  // Match PDF text objects inside (text) Tj or [(text)] TJ
  const tjRegex = /\(([^()]{2,})\)\s*T[jJ]/g;
  let match;

  while ((match = tjRegex.exec(str)) !== null) {
    const rawSnippet = match[1];
    const cleanedSnippet = rawSnippet
      .replace(/\\\( /g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\[0-7]{3}/g, " ");

    if (/[a-zA-Z0-9]{2,}/.test(cleanedSnippet)) {
      textBlocks.push(cleanedSnippet.trim());
    }
  }

  if (textBlocks.length > 10) {
    return cleanExtractedText(textBlocks.join(" "));
  }

  // Secondary PDF string extraction
  const stringRegex = /\(([\w\s.,@+\-#()/:]{3,})\)/g;
  const secondaryBlocks: string[] = [];

  while ((match = stringRegex.exec(str)) !== null) {
    if (match[1] && match[1].trim().length > 3) {
      secondaryBlocks.push(match[1].trim());
    }
  }

  if (secondaryBlocks.length > 0) {
    return cleanExtractedText(secondaryBlocks.join(" "));
  }

  return cleanExtractedText(str);
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Remove non-printable ASCII characters
    .replace(/\s+/g, " ")               // Collapse multiple spaces
    .trim();
}
