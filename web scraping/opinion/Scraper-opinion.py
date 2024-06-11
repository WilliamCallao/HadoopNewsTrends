import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime, timedelta
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue

def extract_urls_from_opinion(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        urls = []
        for article_media in soup.find_all('div', class_='article-media'):
            a_tag = article_media.find('a', href=True)
            if a_tag:
                urls.append(a_tag['href'])
        return urls
    else:
        print(f"Error: Unable to access page {url}. Status code: {response.status_code}")
        return []

def extract_article_details(url, date):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title_tag = soup.find('title')
        title = title_tag.get_text(strip=True).replace(',', ' ') if title_tag else 'No Title'

        article_body = soup.find('div', class_='content-body inner-article-data col-md-10 col-sm-12 col-ms-12')
        body = []
        if article_body:
            for p_tag in article_body.find_all('p'):
                paragraph = p_tag.get_text(strip=True).replace(',', ' ')
                if "Para más información," not in paragraph and \
                   "Facebook|X|Instagram|YouTube Visítanos en nuestro Canal deWhatsApp" not in paragraph:
                    body.append(paragraph)
            body_text = ' '.join(body)
            
            unwanted_ending = "Facebook|X|Instagram|YouTube Visítanos en nuestro Canal deWhatsApp"
            if body_text.endswith(unwanted_ending):
                body_text = body_text[:body_text.rfind(unwanted_ending)].strip()
        else:
            body_text = 'No Body'
        
        return {
            'Pagina': 'opinion',
            'URL': url,
            'Fecha': date,
            'Titulo': title,
            'Cuerpo': body_text
        }
    else:
        print(f"Error: Unable to access article page {url}. Status code: {response.status_code}")
        return None

def save_to_csv(data, filename):
    if not data:
        return
    keys = data[0].keys()
    with open(filename, 'a', newline='', encoding='utf-8') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        if output_file.tell() == 0:
            dict_writer.writeheader()
        dict_writer.writerows(data)

def date_range(start_date, end_date):
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)

def process_page(date_str, page_number):
    webpage_url = f'https://www.opinion.com.bo/archive/content/{date_str}/?page={page_number}'
    urls = extract_urls_from_opinion(webpage_url)
    return urls

def process_article(url, date_for_csv):
    article_details = extract_article_details(url, date_for_csv)
    return article_details

def process_date(single_date, csv_filename, result_queue):
    date_str = single_date.strftime('%Y/%m/%d')
    date_for_csv = single_date.strftime('%d-%m-%Y')
    page_number = 1
    articles = []

    with ThreadPoolExecutor(max_workers=20) as page_executor:
        page_futures = {}
        while True:
            print(f"Scraping page {page_number} for date {date_str}...")
            page_futures[page_number] = page_executor.submit(process_page, date_str, page_number)
            page_number += 1
            if page_number > 10:
                break

        for page_number, future in page_futures.items():
            urls = future.result()
            
            if not urls:
                print(f"No more articles found on page {page_number} for date {date_str}.")
                break
            
            print(f"Found {len(urls)} URLs on page {page_number} for date {date_str}.")
            
            with ThreadPoolExecutor(max_workers=50) as article_executor:
                article_futures = {article_executor.submit(process_article, url, date_for_csv): url for url in urls}
                
                for article_future in as_completed(article_futures):
                    article_details = article_future.result()
                    if article_details:
                        print(f"Processing article {article_details['URL']}...")
                        articles.append(article_details)

    result_queue.put((single_date, articles))

start_time = time.time()

start_date = datetime.strptime('2024-01-01', '%Y-%m-%d')
end_date = datetime.strptime('2024-01-10', '%Y-%m-%d')

csv_filename = f'opinion-{start_date.strftime("%Y-%m-%d")}-to-{end_date.strftime("%Y-%m-%d")}.csv'

all_articles = []
result_queue = queue.PriorityQueue()

with ThreadPoolExecutor(max_workers=10) as date_executor:
    date_futures = {date_executor.submit(process_date, single_date, csv_filename, result_queue): single_date for single_date in date_range(start_date, end_date)}
    for _ in range(len(date_futures)):
        single_date, articles = result_queue.get()
        save_to_csv(articles, csv_filename)
        all_articles.extend(articles)

end_time = time.time()
elapsed_time = end_time - start_time

print(f"Extracted {len(all_articles)} articles in total.")
print(f"Elapsed time: {elapsed_time:.2f} seconds")
