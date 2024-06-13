import pandas as pd

df = pd.read_csv('1.csv')

df['fecha'] = pd.to_datetime(df['fecha'], format='%d-%m-%Y', errors='coerce')

df = df.drop_duplicates(subset='URL')

df = df.sort_values(by='fecha')

def determinar_periodo_semestral(fecha):
    return f"{fecha.year}-1" if fecha.month <= 6 else f"{fecha.year}-2"

df['periodo_semestral'] = df['fecha'].apply(determinar_periodo_semestral)

df['fecha'] = df['fecha'].dt.strftime('%d-%m-%Y')

for periodo, grupo in df.groupby('periodo_semestral'):
    nombre_archivo = f"articulos_{periodo}.csv"
    grupo.drop(columns=['periodo_semestral'], inplace=True)
    grupo.to_csv(nombre_archivo, index=False)
    print(f"Archivo {nombre_archivo} generado.")

print("Proceso completado.")
