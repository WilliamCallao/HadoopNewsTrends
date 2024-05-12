
# Índice
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Instalación](#instalación)
- [Uso](#uso)

## Descripción del Proyecto

Este proyecto tiene como objetivo analizar las tendencias en noticias utilizando tecnologías de Big Data, específicamente Hadoop, para proporcionar información sobre los artículos más relevantes dentro de un período de tiempo especificado. El proceso comienza con el web scraping para recopilar datos de noticias de tres fuentes locales y una internacional, creando un extenso data lake.

### Detalles Técnicos

- **Recolección de Datos:** Utilizamos técnicas de web scraping para recoger sistemáticamente artículos de noticias de fuentes especificadas, creando un data lake rico que sirve como base para nuestro análisis.
- **Entorno de Procesamiento de Datos:** El entorno de análisis se establece en una máquina virtualizada con CentOS7 donde se instala Hadoop.
- **Análisis de Big Data:** Utilizando el marco de trabajo MapReduce de Hadoop, aplicamos un algoritmo de conteo de palabras para identificar y analizar tendencias entre dos fechas especificadas por el usuario. Este enfoque ayuda a determinar la frecuencia de términos y su relevancia durante el período seleccionado.

### Interfaz de Usuario

El proyecto cuenta con una interfaz web desarrollada en React/JavaScript. La interfaz se conecta mediante SSH al entorno virtualizado de CentOS7 para realizar las operaciones de análisis que permitan identificar la noticia mas relevante en un intervalo de tiempo.

### Tecnologías Utilizadas

- Hadoop (MapReduce)
- CentOS7 (Entorno Virtual)
- Python (para el web scraping)
- React/JavaScript (para la interfaz web)

## Instalación

## Uso
