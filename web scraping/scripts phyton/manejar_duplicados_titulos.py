import pandas as pd

archivo_csv = '1.csv'
df = pd.read_csv(archivo_csv)

df_sin_duplicados = df.drop_duplicates(subset='Titulo')
df_duplicados = df[df.duplicated(subset='Titulo', keep=False)]

archivo_sin_duplicados = 'sin_duplicados.csv'
archivo_duplicados = 'duplicados.csv'
df_sin_duplicados.to_csv(archivo_sin_duplicados, index=False)
df_duplicados.to_csv(archivo_duplicados, index=False)

print(f"Archivo generado exitosamente: {archivo_sin_duplicados}")
print(f"Archivo generado exitosamente: {archivo_duplicados}")
