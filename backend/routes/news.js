const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getCSVFilePaths = (startDate, endDate) => {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const filePaths = [];

  for (let year = startYear; year <= endYear; year++) {
    if (year === startYear && startDate.getMonth() < 6) {
      filePaths.push(path.join(__dirname, `../data/articulos_${year}-1.csv`));
    }
    if ((year === startYear && startDate.getMonth() >= 6) || year > startYear) {
      filePaths.push(path.join(__dirname, `../data/articulos_${year}-2.csv`));
    }
    if ((year === endYear && endDate.getMonth() < 6) || year < endYear) {
      filePaths.push(path.join(__dirname, `../data/articulos_${year}-1.csv`));
    }
    if (year === endYear && endDate.getMonth() >= 6) {
      filePaths.push(path.join(__dirname, `../data/articulos_${year}-2.csv`));
    }
  }

  console.log('File paths to be processed:', filePaths);
  return filePaths;
};

router.get('/news', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    console.log('Error: Tanto startDate como endDate son requeridos');
    return res.status(400).json({ error: 'Tanto startDate como endDate son requeridos' });
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.log('Error: Formato de fecha inválido');
    return res.status(400).json({ error: 'Formato de fecha inválido. Use DD-MM-YYYY' });
  }

  const filePaths = getCSVFilePaths(start, end);
  const results = [];
  let filesProcessed = 0;
  let filesFound = 0;

  console.log('Starting to process files...');

  filePaths.forEach((filePath) => {
    console.log(`Checking file existence: ${filePath}`);
    if (fs.existsSync(filePath)) {
      filesFound++;
      console.log(`File exists: ${filePath}`);
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const articleDate = parseDate(data.fecha);
          if (articleDate >= start && articleDate <= end) {
            results.push(data);
          }
        })
        .on('end', () => {
          filesProcessed++;
          console.log(`Finished processing file: ${filePath}`);
          if (filesProcessed === filePaths.length) {
            if (results.length > 0) {
              console.log('Sending results:', results);
              res.json(results);
            } else {
              console.log('Error: No se encontraron artículos en el rango de fechas especificado');
              res.status(404).json({ error: 'No se encontraron artículos en el rango de fechas especificado' });
            }
          }
        })
        .on('error', (error) => {
          console.error('Error al leer el archivo CSV:', error);
          res.status(500).json({ error: 'Error Interno del Servidor' });
        });
    } else {
      filesProcessed++;
      console.log(`File not found: ${filePath}`);
      if (filesProcessed === filePaths.length && filesFound === 0) {
        console.log('Error: No se encontraron archivos de datos para el rango de fechas especificado');
        res.status(404).json({ error: 'No se encontraron archivos de datos para el rango de fechas especificado' });
      }
    }
  });
});

module.exports = router;
  