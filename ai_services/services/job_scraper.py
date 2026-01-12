"""
Job Scraper Service

Scrapes job descriptions from various job posting websites.
Handles common job boards and company career pages.
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


def scrape_job_description(url, timeout=10):
    """
    Scrape job description from a URL.
    
    Args:
        url (str): URL of the job posting
        timeout (int): Request timeout in seconds
    
    Returns:
        dict: {
            'description': str - Extracted job description text,
            'title': str - Job title (if found),
            'company': str - Company name (if found)
        }
    
    Raises:
        Exception: If scraping fails
    """
    try:
        # Set user agent to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Detect website and use appropriate scraper
        domain = urlparse(url).netloc.lower()
        
        if 'linkedin.com' in domain:
            return _scrape_linkedin(soup)
        elif 'indeed.com' in domain:
            return _scrape_indeed(soup)
        elif 'glassdoor.com' in domain:
            return _scrape_glassdoor(soup)
        else:
            # Generic scraper for other sites
            return _scrape_generic(soup)
    
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise Exception(f"Error scraping job description: {str(e)}")


def _scrape_linkedin(soup):
    """Scrape LinkedIn job postings"""
    result = {
        'description': '',
        'title': '',
        'company': ''
    }
    
    # Title
    title_tag = soup.find('h1', class_='top-card-layout__title') or soup.find('h1')
    if title_tag:
        result['title'] = title_tag.get_text(strip=True)
    
    # Company
    company_tag = soup.find('a', class_='topcard__org-name-link') or soup.find('span', class_='topcard__flavor')
    if company_tag:
        result['company'] = company_tag.get_text(strip=True)
    
    # Description
    desc_tag = soup.find('div', class_='description__text') or soup.find('div', class_='show-more-less-html__markup')
    if desc_tag:
        result['description'] = desc_tag.get_text(separator='\n', strip=True)
    
    return result


def _scrape_indeed(soup):
    """Scrape Indeed job postings"""
    result = {
        'description': '',
        'title': '',
        'company': ''
    }
    
    # Title
    title_tag = soup.find('h1', class_='jobsearch-JobInfoHeader-title')
    if title_tag:
        result['title'] = title_tag.get_text(strip=True)
    
    # Company
    company_tag = soup.find('div', {'data-company-name': True})
    if company_tag:
        result['company'] = company_tag.get_text(strip=True)
    
    # Description
    desc_tag = soup.find('div', id='jobDescriptionText')
    if desc_tag:
        result['description'] = desc_tag.get_text(separator='\n', strip=True)
    
    return result


def _scrape_glassdoor(soup):
    """Scrape Glassdoor job postings"""
    result = {
        'description': '',
        'title': '',
        'company': ''
    }
    
    # Title
    title_tag = soup.find('div', {'data-test': 'jobTitle'}) or soup.find('h1')
    if title_tag:
        result['title'] = title_tag.get_text(strip=True)
    
    # Company
    company_tag = soup.find('div', {'data-test': 'employerName'})
    if company_tag:
        result['company'] = company_tag.get_text(strip=True)
    
    # Description
    desc_tag = soup.find('div', class_='jobDescriptionContent') or soup.find('div', {'data-test': 'jobDescription'})
    if desc_tag:
        result['description'] = desc_tag.get_text(separator='\n', strip=True)
    
    return result


def _scrape_generic(soup):
    """Generic scraper for unknown sites"""
    result = {
        'description': '',
        'title': '',
        'company': ''
    }
    
    # Try to find title (usually in h1 or title tag)
    title_tag = soup.find('h1') or soup.find('title')
    if title_tag:
        result['title'] = title_tag.get_text(strip=True)
    
    # Try common class names for job descriptions
    desc_selectors = [
        {'class': 'job-description'},
        {'class': 'description'},
        {'class': 'job-details'},
        {'id': 'job-description'},
        {'id': 'description'}
    ]
    
    for selector in desc_selectors:
        desc_tag = soup.find('div', selector)
        if desc_tag:
            result['description'] = desc_tag.get_text(separator='\n', strip=True)
            break
    
    # If no specific description found, get all paragraphs
    if not result['description']:
        paragraphs = soup.find_all('p')
        result['description'] = '\n\n'.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
    
    return result


def clean_job_description(raw_text):
    """
    Clean up scraped job description text.
    Removes extra whitespace, special characters, etc.
    
    Args:
        raw_text (str): Raw scraped text
    
    Returns:
        str: Cleaned text
    """
    # Remove multiple newlines
    cleaned = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
    
    # Remove excessive whitespace
    cleaned = ' '.join(cleaned.split())
    
    return cleaned
