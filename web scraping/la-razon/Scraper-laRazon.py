import requests
from bs4 import BeautifulSoup
import csv
import re
from datetime import datetime
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

def extract_urls_from_webpage(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        urls = []
        
        for article_block in soup.find_all('div', class_='article-block-content mobile'):
            a_tag = article_block.find('a', class_='link', href=True)
            if a_tag and a_tag['href'].startswith('https://www.la-razon.com/nacional/'):
                urls.append(a_tag['href'])
        
        return urls
    else:
        print(f"Error: Unable to access page {url}. Status code: {response.status_code}")
        return []

def extract_article_details(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title_tag = soup.find('h1', class_='title')
        title = title_tag.get_text(strip=True) if title_tag else 'No Title'
        
        article_body = soup.find('div', class_='article-body')
        body = []
        if article_body:
            for p_tag in article_body.find_all('p'):
                body.append(p_tag.get_text(strip=True))
            body_text = ' '.join(body)
        else:
            body_text = 'No Body'
        
        match = re.search(r'/(\d{4}/\d{2}/\d{2})/', url)
        if match:
            date_str = match.group(1)
            date = datetime.strptime(date_str, '%Y/%m/%d').strftime('%d-%m-%Y')
        else:
            date = 'No Date'
        
        return {
            'Pagina': 'la-razon',
            'URL': url,
            'Fecha': date,
            'Titulo': title,
            'Cuerpo': body_text
        }
    else:
        print(f"Error: Unable to access article page {url}. Status code: {response.status_code}")
        return None

def save_to_csv(data, filename='la-razon.csv'):
    keys = data[0].keys()
    with open(filename, 'a', newline='', encoding='utf-8') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        if output_file.tell() == 0:
            dict_writer.writeheader()
        dict_writer.writerows(data)

def load_existing_urls(filename='la-razon.csv'):
    existing_urls = set()
    if os.path.exists(filename):
        with open(filename, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                existing_urls.add(row['URL'])
    return existing_urls

def scrape_page(page_number):
    webpage_url = f'https://www.la-razon.com/nacional/page/{page_number}/'
    urls = extract_urls_from_webpage(webpage_url)
    existing_urls = load_existing_urls(csv_filename)
    new_urls = [url for url in urls if url not in existing_urls]
    
    articles = []
    for url in new_urls:
        article_details = extract_article_details(url)
        if article_details:
            articles.append(article_details)
    
    if articles:
        save_to_csv(articles)
    return articles

start_time = time.time()
all_articles = []
csv_filename = 'la-razon.csv'

with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_page = {executor.submit(scrape_page, page_number): page_number for page_number in range(0, 50)}
    for future in as_completed(future_to_page):
        page_number = future_to_page[future]
        try:
            articles = future.result()
            all_articles.extend(articles)
            print(f"Page {page_number}: {len(articles)} articles saved.")
        except Exception as e:
            print(f"Page {page_number} generated an exception: {e}")

end_time = time.time()
elapsed_time = end_time - start_time

print(f"Extracted {len(all_articles)} articles in total.")
print(f"Elapsed time: {elapsed_time:.2f} seconds")
