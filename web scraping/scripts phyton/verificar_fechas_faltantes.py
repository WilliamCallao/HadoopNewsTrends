import pandas as pd
from datetime import datetime, timedelta

df = pd.read_csv('1.csv')
df['fecha'] = pd.to_datetime(df['fecha'], format='%d-%m-%Y', errors='coerce')

articulos_el_deber = df[df['Pagina'] == 'el-deber']
articulos_opinion = df[df['Pagina'] == 'opinion']
articulos_los_tiempos = df[df['Pagina'] == 'LosTiempos']
articulos_la_razon = df[df['Pagina'] == 'la-razon']

def obtener_rango_fechas(articulos):
    if articulos.empty:
        return None, None
    fecha_minima = articulos['fecha'].min()
    fecha_maxima = articulos['fecha'].max()
    return fecha_minima, fecha_maxima

fecha_minima_el_deber, fecha_maxima_el_deber = obtener_rango_fechas(articulos_el_deber)
fecha_minima_opinion, fecha_maxima_opinion = obtener_rango_fechas(articulos_opinion)
fecha_minima_los_tiempos, fecha_maxima_los_tiempos = obtener_rango_fechas(articulos_los_tiempos)
fecha_minima_la_razon, fecha_maxima_la_razon = obtener_rango_fechas(articulos_la_razon)

def buscar_fechas_faltantes(fecha_minima, fecha_maxima, fechas_disponibles):
    if fecha_minima is None or fecha_maxima is None:
        return []
    fechas_disponibles = set(fechas_disponibles)
    fechas_faltantes = []
    fecha_actual = fecha_minima

    while fecha_actual <= fecha_maxima:
        if fecha_actual not in fechas_disponibles:
            fechas_faltantes.append(fecha_actual)
        fecha_actual += timedelta(days=1)

    return fechas_faltantes

fechas_faltantes_el_deber = buscar_fechas_faltantes(
    fecha_minima_el_deber, fecha_maxima_el_deber, articulos_el_deber['fecha']
)
fechas_faltantes_opinion = buscar_fechas_faltantes(
    fecha_minima_opinion, fecha_maxima_opinion, articulos_opinion['fecha']
)
fechas_faltantes_los_tiempos = buscar_fechas_faltantes(
    fecha_minima_los_tiempos, fecha_maxima_los_tiempos, articulos_los_tiempos['fecha']
)
fechas_faltantes_la_razon = buscar_fechas_faltantes(
    fecha_minima_la_razon, fecha_maxima_la_razon, articulos_la_razon['fecha']
)

informacion_txt = ""

def agregar_info_pagina(informacion_txt, nombre_pagina, fecha_minima, fecha_maxima, fechas_faltantes, total_articulos):
    informacion_txt += f"Página: {nombre_pagina}\n"
    if fecha_minima is not None and fecha_maxima is not None:
        total_dias = (fecha_maxima - fecha_minima).days + 1
        promedio_articulos_dia = total_articulos / total_dias
        porcentaje_fechas_faltantes = len(fechas_faltantes) / total_dias * 100
        
        informacion_txt += f"Rango de fechas: {fecha_minima.strftime('%d/%m/%Y')} - {fecha_maxima.strftime('%d/%m/%Y')}\n"
        informacion_txt += f"Número total de artículos: {total_articulos}\n"
        informacion_txt += f"Promedio de artículos por día: {promedio_articulos_dia:.2f}\n"
        informacion_txt += f"Porcentaje de fechas faltantes: {porcentaje_fechas_faltantes:.2f}%\n"
        
        if fechas_faltantes:
            informacion_txt += "Fechas faltantes:\n"
            for fecha in fechas_faltantes:
                informacion_txt += f"{fecha.strftime('%d/%m/%Y')}\n"
        else:
            informacion_txt += "No hay fechas faltantes.\n"
    else:
        informacion_txt += "No hay datos disponibles.\n"
    informacion_txt += "\n"
    return informacion_txt

informacion_txt = agregar_info_pagina(
    informacion_txt, 'el-deber', fecha_minima_el_deber, fecha_maxima_el_deber, fechas_faltantes_el_deber, len(articulos_el_deber)
)
informacion_txt = agregar_info_pagina(
    informacion_txt, 'opinion', fecha_minima_opinion, fecha_maxima_opinion, fechas_faltantes_opinion, len(articulos_opinion)
)
informacion_txt = agregar_info_pagina(
    informacion_txt, 'LosTiempos', fecha_minima_los_tiempos, fecha_maxima_los_tiempos, fechas_faltantes_los_tiempos, len(articulos_los_tiempos)
)
informacion_txt = agregar_info_pagina(
    informacion_txt, 'la-razon', fecha_minima_la_razon, fecha_maxima_la_razon, fechas_faltantes_la_razon, len(articulos_la_razon)
)

with open('fechas_faltantes.txt', 'w') as file:
    file.write(informacion_txt)

print("Verificación completa. Archivo 'fechas_faltantes.txt' generado.")
