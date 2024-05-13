const { Client } = require('ssh2');
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');

const connectionSettings = {
  host: '127.0.0.1', // Cambiar a la dirección IP de tu máquina local
  port: 22022,        // Cambiar al puerto utilizado para SSH en tu máquina local
  username: 'hadoop', // Tu nombre de usuario en la máquina virtual CentOS 7
  password: 'hadoop'  // Tu contraseña para la máquina virtual CentOS 7
};


const uploadAndProcessFile = (fileContent) => {
    return new Promise((resolve, reject) => {
      const sshClient = new Client();
      const sftp = new SftpClient();
  
      sshClient.on('ready', () => {
        console.log('Conexión establecida. Subiendo archivo al home...');
        sftp.connect(connectionSettings).then(() => {
          console.log('Subiendo archivo al directorio home...');
          return sftp.put(Buffer.from(fileContent), '/home/hadoop/texto.txt');
        }).then(() => {
          console.log('Archivo subido al home exitosamente.');
          const moveCommand = 'hdfs dfs -put /home/hadoop/texto.txt /input';
          console.log('Moviendo archivo a /input...');
          sshClient.exec(moveCommand, { pty: true }, (err, stream) => {
            if (err) {
              reject(err);
              return;
            }
            stream.on('exit', () => {
              console.log('Archivo movido a /input.');
  
              // Ejecutar MapReduce
              const mapReduceCommand = 'hadoop jar /opt/hadoop/hadoop-2.7.7/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.7.7.jar wordcount /input /output';
              console.log('Ejecutando MapReduce...');
              sshClient.exec(mapReduceCommand, { pty: true }, (err, stream) => {
                if (err) {
                  reject(err);
                  return;
                }
                stream.on('data', data => {
                  console.log(data.toString());
                });
                stream.on('exit', (code, signal) => {
                  console.log('MapReduce completado.');
                  sftp.end();
                  sshClient.end();
                  resolve(); // Resolver la promesa aquí después de completar todo el proceso
                });
              });
            });
          });
        }).catch(err => {
          console.error('Error al subir el archivo al home:', err);
          sftp.end();
          sshClient.end();
          reject(err);
        });
      }).on('error', (err) => {
        console.error('Error de conexión SSH:', err);
        reject(err);
      });
  
      sshClient.connect(connectionSettings);
    });
  };

const fetchFileContent = () => {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();
    let fileContent = '';
    sshClient.on('ready', () => {
      console.log('Conexión SSH establecida. Obteniendo contenido del archivo...');
      const fetchCommand = 'hdfs dfs -cat /output/part-r-00000';
      sshClient.exec(fetchCommand, { pty: true }, (err, stream) => {
        if (err) {
          sshClient.end();
          reject(err);
          return;
        }
        stream.on('data', (data) => {
          fileContent += data.toString();
        });
        stream.on('close', () => {
          console.log('Finalizada la obtención del contenido del archivo.');
          sshClient.end();
          resolve(fileContent);
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
    sshClient.connect(connectionSettings);
  });
};

function cleanUpResources() {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();
    const commands = ['rm -fv /home/hadoop/texto.txt', 'hdfs dfs -rm /input/texto.txt', 'hdfs dfs -rm -r -skipTrash /output'];
    sshClient.on('ready', () => {
      console.log('Conexión SSH establecida. Iniciando limpieza de recursos...');
      let commandIndex = 0;
      function execCommand() {
        if (commandIndex < commands.length) {
          const command = commands[commandIndex];
          sshClient.exec(command, (err, stream) => {
            if (err) reject(err);
            stream.on('data', (data) => {
              console.log(data.toString());
            });
            stream.stderr.on('data', (data) => {
              console.error(data.toString());
            });
            stream.on('exit', () => {
              console.log(`Comando '${command}' ejecutado.`);
              commandIndex++;
              if (commandIndex < commands.length) {
                execCommand();
              } else {
                console.log('Todos los comandos se han ejecutado. Cerrando conexión SSH.');
                sshClient.end();
                resolve();
              }
            });
          });
        }
      }
      execCommand();
    }).on('error', (err) => {
      console.error('Error en la conexión SSH:', err);
      reject(err);
    });
    sshClient.connect(connectionSettings);
  });
}

const processResults = (fileContent) => {
  let lines = fileContent.split('\n').filter(line => line.trim() !== '');
  let wordFrequencies = lines.map(line => {
    let parts = line.trim().split(/\s+/);
    return { palabra: parts[0], frecuencia: parseInt(parts[1], 10) };
  });
  wordFrequencies.sort((a, b) => b.frecuencia - a.frecuencia);
  let topWords = wordFrequencies.slice(0, 30);
  topWords.forEach((item, index) => {
    console.log(`conso ${index + 1}. ${item.palabra} - ${item.frecuencia}`);
  });
};

// async function executeScripts() {
//   try {
//     console.log('//////SCRIPT 1');
//     await uploadAndProcessFile("palabra mas repetida mas mas repetida");
//     console.log('//////SCRIPT 2');
//     const fileContent = await fetchFileContent();
//     console.log('RESPUESTA', fileContent);
//     processResults(fileContent);
//     console.log('//////SCRIPT 3');
//     await cleanUpResources();
//   } catch (err) {
//     console.error('Error en la ejecución de los scripts:', err);
//   }
// }

// executeScripts();

async function executeWorkflow(text, logCallback) {
  // logCallback('Iniciando el flujo de trabajo con el texto proporcionado...');
  await uploadAndProcessFile(text);
  // await new Promise(resolve => setTimeout(resolve, 1000)); // Simula un proceso
  const fileContent = await fetchFileContent();
  processResults(fileContent);
  await cleanUpResources();
  // logCallback('Proceso completsado. Devolviendo resultado por defecto.');
  return 'Este es el fin';
}

module.exports = { executeWorkflow };


// async function executeScripts(text, logCallback) {
//   try {
//     console.log('//////SCRIPT 1');
//     logCallback('Proceso completsado. Devolviendo resultado por defecto.');
//     return 'Este es el resultado por defecto';
//     // await uploadAndProcessFile(text);
//     // console.log('//////SCRIPT 2');
//     // const fileContent = await fetchFileContent();
//     // console.log('RESPUESTA', fileContent);
//     // processResults(fileContent);
//     // console.log('//////SCRIPT 3');
//     // await cleanUpResources();
//   } catch (err) {
//     console.error('Error en la ejecución de los scripts:', err);
//   }
// }

// module.exports = { executeScripts };
