"""
Resume Parser Service

Extracts text from various document formats (PDF, DOCX, TXT).
"""
import PyPDF2
from docx import Document
import os


def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file.
    
    Args:
        file_path (str): Path to the PDF file
    
    Returns:
        str: Extracted text content
    
    Raises:
        Exception: If PDF cannot be read
    """
    try:
        text_content = []
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
        
        return '\n\n'.join(text_content).strip()
    
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_docx(file_path):
    """
    Extract text from a DOCX file.
    
    Args:
        file_path (str): Path to the DOCX file
    
    Returns:
        str: Extracted text content
    
    Raises:
        Exception: If DOCX cannot be read
    """
    try:
        doc = Document(file_path)
        text_content = []
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_content.append(paragraph.text)
        
        return '\n\n'.join(text_content).strip()
    
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")


def extract_text_from_txt(file_path):
    """
    Extract text from a plain text file.
    
    Args:
        file_path (str): Path to the TXT file
    
    Returns:
        str: File content
    
    Raises:
        Exception: If file cannot be read
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        raise Exception(f"Error reading text file: {str(e)}")


def extract_text_from_document(file_path):
    """
    Auto-detect file type and extract text.
    
    Args:
        file_path (str): Path to the document file
    
    Returns:
        str: Extracted text content
    
    Raises:
        Exception: If file type is not supported or extraction fails
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Get file extension
    _, ext = os.path.splitext(file_path.lower())
    
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif ext == '.txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Supported types: .pdf, .docx, .txt")
