import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

fecha_inicio = "01/01/2024"
fecha_fin = "10/01/2024"

fecha_inicio_dt = datetime.strptime(fecha_inicio, "%d/%m/%Y")
fecha_fin_dt = datetime.strptime(fecha_fin, "%d/%m/%Y")

fechas = [(fecha_inicio_dt + timedelta(days=x)).strftime("%d/%m/%Y") for x in range((fecha_fin_dt - fecha_inicio_dt).days + 1)]

def extraer_contenido_noticia(url):
    print(f"Extrayendo contenido de la noticia: {url}")
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error al acceder a la noticia: {url}")
        return None, None, url

    soup = BeautifulSoup(response.text, 'html.parser')

    titulo_tag = soup.find('meta', attrs={'name': 'twitter:title'})
    titulo = titulo_tag['content'] if titulo_tag else 'Sin título'
    print(f"Título extraído: {titulo}")

    cuerpo_tag = soup.find('div', class_='field field-name-body field-type-text-with-summary field-label-hidden view-mode-full')
    if cuerpo_tag:
        parrafos = cuerpo_tag.find_all('p', class_='rtejustify')
        cuerpo = ' '.join(p.get_text().replace('\n', ' ').strip() for p in parrafos)
    else:
        cuerpo = 'Sin contenido'
    print(f"Cuerpo extraído: {cuerpo[:60]}...")

    return titulo, cuerpo, url

def extraer_links_de_pagina(fecha, page):
    fecha_url = datetime.strptime(fecha, "%d/%m/%Y").strftime("%m/%d/%Y")
    print(f"Procesando página {page} para la fecha {fecha}...")
    url = f"https://www.lostiempos.com/hemeroteca-fecha?fecha={fecha_url}&seccion=All&page={page}"
    
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error al acceder a la página {page} para la fecha {fecha}.")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    if soup.find(text="No existen noticias para esta fecha."):
        print(f"No se encontraron más noticias para la fecha {fecha} en la página {page}.")
        return []

    links = soup.find_all('div', class_='views-field-title')
    if not links:
        print(f"No se encontraron más enlaces de noticias en la página {page} para la fecha {fecha}.")
        return []

    noticia_urls = [f"https://www.lostiempos.com{link.find('a')['href']}" for link in links if link.find('a')]
    return noticia_urls

def extraer_fecha_de_url(url):
    try:
        fecha_str = url.split('/')[5]
        fecha = datetime.strptime(fecha_str, "%Y%m%d").strftime("%d-%m-%Y")
    except (IndexError, ValueError):
        fecha = "Fecha desconocida"
    return fecha

with open('noticias.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['Pagina', 'URL', 'Fecha', 'Titulo', 'Cuerpo']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

with ThreadPoolExecutor(max_workers=20) as executor:
    all_noticia_urls = []

    future_to_page = {executor.submit(extraer_links_de_pagina, fecha, page): (fecha, page) for fecha in fechas for page in range(5)}
    
    for future in as_completed(future_to_page):
        fecha, page = future_to_page[future]
        try:
            noticia_urls = future.result()
            all_noticia_urls.extend(noticia_urls)
        except Exception as exc:
            print(f"Error al procesar la página {page} para la fecha {fecha}: {exc}")

    future_to_noticia = {executor.submit(extraer_contenido_noticia, url): url for url in all_noticia_urls}

    for future in as_completed(future_to_noticia):
        url = future_to_noticia[future]
        try:
            titulo, cuerpo, url = future.result()
            if titulo and cuerpo:
                fecha_formateada = extraer_fecha_de_url(url)
                with open('noticias.csv', 'a', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=['Pagina', 'URL', 'Fecha', 'Titulo', 'Cuerpo'])
                    writer.writerow({'Pagina': 'LosTiempos', 'URL': url, 'Fecha': fecha_formateada, 'Titulo': titulo, 'Cuerpo': cuerpo})
        except Exception as exc:
            print(f"Error al procesar la noticia {url}: {exc}")

print("Extracción completada y guardada en noticias.csv")
