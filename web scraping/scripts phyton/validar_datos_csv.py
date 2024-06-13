import pandas as pd
from datetime import datetime
import math

# Función para verificar la validez de la fecha
def es_fecha_valida(fecha_str):
    try:
        datetime.strptime(fecha_str, '%d-%m-%Y')
        return True
    except ValueError:
        return False

# Función para verificar que el contenido no sea inválido
def contenido_valido(valor, columna):
    if isinstance(valor, float) and math.isnan(valor):
        return False
    return valor and valor.strip() and valor.lower() != "sin título"

# Leer el archivo CSV
df = pd.read_csv('1.csv')

# Inicializar listas para datos correctos e incorrectos
datos_correctos = []
datos_incorrectos = []

# Verificar cada fila
for index, row in df.iterrows():
    if (
        contenido_valido(row['Pagina'], 'Pagina') and
        contenido_valido(row['URL'], 'URL') and
        contenido_valido(row['fecha'], 'fecha') and
        contenido_valido(row['Titulo'], 'Titulo') and
        contenido_valido(row['Cuerpo'], 'Cuerpo') and
        es_fecha_valida(row['fecha'])
    ):
        datos_correctos.append(row)
    else:
        datos_incorrectos.append(row)

# Convertir listas a DataFrames
df_correctos = pd.DataFrame(datos_correctos)
df_incorrectos = pd.DataFrame(datos_incorrectos)

# Guardar los DataFrames en archivos CSV
df_correctos.to_csv('datos_correctos.csv', index=False)
df_incorrectos.to_csv('datos_incorrectos.csv', index=False)

print("Verificación completa. Archivos 'datos_correctos.csv' y 'datos_incorrectos.csv' generados.")
