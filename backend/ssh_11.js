const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const connectionSettings = {
  host: '127.0.0.1',
  port: 22022,
  username: 'hadoop',
  password: 'hadoop'
};

let ws;

const uploadAndProcessFile = (fileContent) => {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();
    const sftp = new SftpClient();

    sshClient.on('ready', () => {
      logMessage('Conexión establecida. Subiendo archivo al home...');
      sftp.connect(connectionSettings)
        .then(() => sftp.put(Buffer.from(fileContent), '/home/hadoop/texto.txt'))
        .then(() => {
          logMessage('Archivo subido al home exitosamente.');
          const moveCommand = 'hdfs dfs -put /home/hadoop/texto.txt /input';
          logMessage('Moviendo archivo a /input...');
          return execCommand(sshClient, moveCommand);
        })
        .then(() => {
          logMessage('Archivo movido a /input.');
          const mapReduceCommand = 'hadoop jar /opt/hadoop/hadoop-2.7.7/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.7.7.jar wordcount /input /output';
          logMessage('Ejecutando MapReduce...');
          return execCommand(sshClient, mapReduceCommand);
        })
        .then(() => {
          logMessage('MapReduce completado.');
          sftp.end();
          sshClient.end();
          resolve();
        })
        .catch(err => {
          logMessage('Error durante el proceso:', err);
          sftp.end();
          sshClient.end();
          reject(err);
        });
    }).on('error', reject);

    sshClient.connect(connectionSettings);
  });
};

const execCommand = (sshClient, command) => {
  return new Promise((resolve, reject) => {
    sshClient.exec(command, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      stream.on('data', data => logMessage(data.toString()))
        .on('exit', resolve)
        .stderr.on('data', data => logMessage(data.toString()));
    });
  });
};

const fetchFileContent = () => {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();
    let fileContent = '';

    sshClient.on('ready', () => {
      logMessage('Conexión SSH establecida. Obteniendo contenido del archivo...');
      const fetchCommand = 'hdfs dfs -cat /output/part-r-00000';
      sshClient.exec(fetchCommand, { pty: true }, (err, stream) => {
        if (err) {
          sshClient.end();
          return reject(err);
        }
        stream.on('data', (data) => { fileContent += data.toString(); })
          .on('close', () => {
            logMessage('Finalizada la obtención del contenido del archivo.');
            sshClient.end();
            resolve(fileContent);
          });
      });
    }).on('error', reject);

    sshClient.connect(connectionSettings);
  });
};

const cleanUpResources = () => {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();
    const commands = [
      'rm -fv /home/hadoop/texto.txt',
      'hdfs dfs -rm /input/texto.txt',
      'hdfs dfs -rm -r -skipTrash /output'
    ];

    sshClient.on('ready', () => {
      logMessage('Conexión SSH establecida. Iniciando limpieza de recursos...');
      execCommandsSequentially(sshClient, commands)
        .then(() => {
          logMessage('Todos los comandos se han ejecutado. Cerrando conexión SSH.');
          sshClient.end();
          resolve();
        })
        .catch(err => {
          logMessage('Error durante la limpieza de recursos:', err);
          sshClient.end();
          reject(err);
        });
    }).on('error', reject);

    sshClient.connect(connectionSettings);
  });
};

const execCommandsSequentially = (sshClient, commands) => {
  let promise = Promise.resolve();
  commands.forEach(command => {
    promise = promise.then(() => execCommand(sshClient, command));
  });
  return promise;
};

const processResults = (fileContent) => {
  let lines = fileContent.split('\n').filter(line => line.trim() !== '');
  let wordFrequencies = lines.map(line => {
    let parts = line.trim().split(/\s+/);
    return { palabra: parts[0], frecuencia: parseInt(parts[1], 10) };
  });
  wordFrequencies.sort((a, b) => b.frecuencia - a.frecuencia);
  return wordFrequencies;
};

const filterStopwords = async (words) => {
  const stopwordsPath = path.join(__dirname, 'stopWords.txt');
  const stopwords = await fs.promises.readFile(stopwordsPath, 'utf-8');
  const stopwordsSet = new Set(stopwords.split('\n').map(word => word.trim()));

  return words.filter(word => !stopwordsSet.has(word.palabra));
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeWorkflow = async (text) => {
  logMessage('Iniciando el flujo de trabajo con el texto proporcionado...');
  await uploadAndProcessFile(text);
  const fileContent = await fetchFileContent();
  let results = processResults(fileContent);
  results = await filterStopwords(results);
  results = results.slice(0, 20);
  await cleanUpResources();
  logMessage('Proceso completado. Devolviendo resultado.');
  return results;
};

// const executeWorkflow = async (text) => {
//   logMessage('Iniciandoo...');
//   await delay(2000);
//   const words = text.split(/\s+/);
//   const wordCount = {};
//   words.forEach(word => {
//     const lowerCaseWord = word.toLowerCase();
//     wordCount[lowerCaseWord] = (wordCount[lowerCaseWord] || 0) + 1;
//   });
//   const wordArray = Object.keys(wordCount).map(word => ({
//     palabra: word,
//     frecuencia: wordCount[word]
//   }));
//   wordArray.sort((a, b) => b.frecuencia - a.frecuencia);
//   const filteredResults = await filterStopwords(wordArray);
//   return filteredResults.slice(0, 20);
// };

const logMessage = (message) => {
  console.log(message);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'log', message }));
  }
};

const setWebSocket = (websocket) => {
  ws = websocket;
};

module.exports = { executeWorkflow, setWebSocket };
