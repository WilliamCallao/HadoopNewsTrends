
# Índice
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Instalación](#instalación)
- [Ejecutar la Aplicación Web](#ejecutar-la-aplicación-web)
- [Manejo de Errores](#manejo-de-errores)
- [Resumen de Comandos](#resumen-de-comandos)

## Descripción del Proyecto

Este proyecto tiene como objetivo analizar las tendencias en noticias utilizando tecnologías de Big Data, específicamente Hadoop, para proporcionar información sobre los artículos más relevantes dentro de un período de tiempo especificado.

### Detalles Técnicos

- **Recolección de Datos:** Utilizamos técnicas de web scraping para recoger artículos de noticias de fuentes especificadas, creando un data lake rico que sirve como base para nuestro análisis.
- **Entorno de Procesamiento de Datos:** El entorno de análisis se establece en una máquina virtualizada con CentOS7 donde se instala Hadoop.
- **Análisis de Big Data:** Utilizando el marco de trabajo MapReduce de Hadoop, aplicamos un algoritmo de conteo de palabras para identificar y analizar tendencias entre dos fechas especificadas por el usuario. Este enfoque ayuda a determinar la frecuencia de términos y su relevancia durante el período seleccionado.

### Interfaz de Usuario

El proyecto cuenta con una interfaz web desarrollada en React/JavaScript. La interfaz se conecta mediante SSH al entorno virtualizado de CentOS7 para realizar las operaciones de análisis que permitan identificar la noticia más relevante en un intervalo de tiempo.

### Tecnologías Utilizadas

- Hadoop (MapReduce)
- CentOS7 (Entorno Virtual)
- Python (Web scraping)
- React/JavaScript (para la interfaz web)

## Instalación

### Requisitos Previos

1. **VirtualBox**: Asegúrate de tener VirtualBox instalado en tu máquina.
2. **CentOS 7**: Virtualiza CentOS 7 con Hadoop instalado.

### Configuración Inicial (En la Terminal de CentOS)

1. **Crear la carpeta de entrada en HDFS (solo la primera vez)**:
   ```bash
   hdfs dfs -mkdir /input
   ```

## Uso del Proyecto

### Iniciar el Entorno de Hadoop (En la Terminal de CentOS)

1. Arranca la máquina virtual de CentOS 7.
2. Loguéate en el sistema.
3. Ejecuta los comandos de inicio de Hadoop:
   ```bash
   start-dfs.sh
   start-yarn.sh
   ```

### Ejecutar la Aplicación Web

1. **Backend**:
   - Navega a la carpeta del backend:
     ```bash
     cd backend
     ```
   - Instala las dependencias:
     ```bash
     npm install
     ```
   - Inicia el servidor:
     ```bash
     node server.js
     ```

2. **Frontend**:
   - Navega a la carpeta del frontend:
     ```bash
     cd frontend
     ```
   - Instala las dependencias:
     ```bash
     npm install
     ```
   - Inicia la aplicación:
     ```bash
     npm start
     ```

## Manejo de Errores 

En caso de que la ejecución falle o se quede a medio camino, es importante borrar los archivos residuales para evitar conflictos en futuras ejecuciones. Utiliza los siguientes comandos en la terminal de CentOS7 para limpiar los recursos:

```bash
rm -fv /home/hadoop/texto.txt
hdfs dfs -rm /input/texto.txt
hdfs dfs -rm -r -skipTrash /output
```

## Resumen de Comandos

### Comandos de Inicio

- Iniciar HDFS:
  ```bash
  start-dfs.sh
  ```

- Iniciar YARN:
  ```bash
  start-yarn.sh
  ```

- Crear carpeta de entrada en HDFS (solo la primera vez):
  ```bash
  hdfs dfs -mkdir /input
  ```

### Comandos de Limpieza

- Borrar archivo de texto local:
  ```bash
  rm -fv /home/hadoop/texto.txt
  ```

- Borrar archivo de entrada en HDFS:
  ```bash
  hdfs dfs -rm /input/texto.txt
  ```

- Borrar carpeta de salida en HDFS:
  ```bash
  hdfs dfs -rm -r -skipTrash /output
  ```
