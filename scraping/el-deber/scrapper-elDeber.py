import requests
import csv
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

start_date = datetime.strptime("11-04-2022", "%d-%m-%Y")
end_date = datetime.strptime("30-06-2022", "%d-%m-%Y")
base_api_url = "https://eldeber.com.bo/api/news/getMoreLastNews?date="
csv_file = "el-deber.csv"
days_per_thread = 3

def get_date_string(date):
    return date.strftime("%d-%m-%Y")

def clean_text(text):
    """Función para limpiar el texto y normalizar el encoding."""
    text = text.replace('\n', ' ').replace('\r', ' ').strip()
    return ' '.join(text.split())

def extraer_contenido(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
    except requests.RequestException as e:
        print(f"Error al acceder a {url}: {e}")
        return 'Sin título', ''

    titulo_tag = soup.find('h1')
    titulo = clean_text(titulo_tag.text.strip()) if titulo_tag else 'Sin título'
    articulo = soup.find('div', class_='detail')

    cuerpo = ''
    if articulo:
        texto_exclusion = ["Todo lo que buscas en un solo click", "Nuestra señal al Vivo", "Copyright ©"]
        cuerpo = ' '.join([clean_text(p.text.strip()) for p in articulo.find_all('p') if not any(excluido in p.text for excluido in texto_exclusion)])

    return titulo, cuerpo

def collect_urls_for_date_range(start_date, end_date):
    urls_completas = []
    current_date = start_date

    while current_date <= end_date:
        date_string = get_date_string(current_date)
        api_url = f"{base_api_url}{date_string}"
        print(f"Recopilando URLs para la fecha: {date_string}")

        for index in range(0, 1000, 12):
            url_with_index = f"{api_url}&from={index}"
            response = requests.get(url_with_index)
            if response.status_code == 200:
                data = response.json()
                if data:
                    for item in data:
                        if 'Url' in item and 'Nodes_en' in item and item['Nodes_en']:
                            url = item['Url']
                            section = item["Nodes_en"][0].lower()
                            complete_url = f"https://eldeber.com.bo/{section}/{url}_{item['Id']}".replace(' ', '')
                            urls_completas.append((complete_url, date_string))
                else:
                    print("No más datos disponibles, finalizando")
                    break
            else:
                print(f"Error al realizar la solicitud para index {index}: {response.status_code}")
                break

        current_date += timedelta(days=1)

    return urls_completas

def process_url(url_info):
    url, date_string = url_info
    titulo, cuerpo = extraer_contenido(url)
    return ["el-deber", url, date_string, titulo, cuerpo]

def main():
    start_time = time.time()
    total_days = 0
    noticias_recuperadas = 0
    all_urls = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        current_start_date = start_date

        while current_start_date <= end_date:
            current_end_date = min(current_start_date + timedelta(days=days_per_thread - 1), end_date)
            futures.append(executor.submit(collect_urls_for_date_range, current_start_date, current_end_date))
            current_start_date = current_end_date + timedelta(days=1)
            total_days += (current_end_date - current_start_date).days + 1

        for future in as_completed(futures):
            urls = future.result()
            all_urls.extend(urls)

    with open(csv_file, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Pagina", "URL", "Fecha", "Titulo", "Cuerpo"])

        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_url = {executor.submit(process_url, url_info): url_info for url_info in all_urls}
            for future in as_completed(future_to_url):
                url_info = future_to_url[future]
                try:
                    result = future.result()
                    result[2] = datetime.strptime(result[2], '%d-%m-%Y').strftime('%d-%m-%Y')
                    writer.writerow(result)
                    noticias_recuperadas += 1
                    print(f"Datos guardados para {url_info[0]}")
                except Exception as e:
                    print(f"Error procesando {url_info[0]}: {e}")

    elapsed_time = time.time() - start_time
    print("-" * 30)
    print("Resumen del Proceso:")
    print(f"Días scrapeados: {total_days}")
    print(f"Noticias recuperadas: {noticias_recuperadas}")
    print(f"Tiempo empleado: {timedelta(seconds=int(elapsed_time))}")
    print("-" * 30)

if __name__ == "__main__":
    main()
