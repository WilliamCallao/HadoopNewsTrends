import pandas as pd

archivo1 = "1.csv"
archivo2 = "2.csv"

df1 = pd.read_csv(archivo1)
df2 = pd.read_csv(archivo2)

df_unido = pd.concat([df1, df2], ignore_index=True)

df_unido.to_csv("fusion5.csv", index=False)
