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
      sftp.connect(connectionSettings)
        .then(() => sftp.put(Buffer.from(fileContent), '/home/hadoop/texto.txt'))
        .then(() => {
          console.log('Archivo subido al home exitosamente.');
          const moveCommand = 'hdfs dfs -put /home/hadoop/texto.txt /input';
          console.log('Moviendo archivo a /input...');
          return execCommand(sshClient, moveCommand);
        })
        .then(() => {
          console.log('Archivo movido a /input.');
          const mapReduceCommand = 'hadoop jar /opt/hadoop/hadoop-2.7.7/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.7.7.jar wordcount /input /output';
          console.log('Ejecutando MapReduce...');
          return execCommand(sshClient, mapReduceCommand);
        })
        .then(() => {
          console.log('MapReduce completado.');
          sftp.end();
          sshClient.end();
          resolve();
        })
        .catch(err => {
          console.error('Error durante el proceso:', err);
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
      stream.on('data', data => console.log(data.toString()))
        .on('exit', resolve)
        .stderr.on('data', data => console.error(data.toString()));
    });
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
          return reject(err);
        }
        stream.on('data', (data) => { fileContent += data.toString(); })
          .on('close', () => {
            console.log('Finalizada la obtención del contenido del archivo.');
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
      console.log('Conexión SSH establecida. Iniciando limpieza de recursos...');
      execCommandsSequentially(sshClient, commands)
        .then(() => {
          console.log('Todos los comandos se han ejecutado. Cerrando conexión SSH.');
          sshClient.end();
          resolve();
        })
        .catch(err => {
          console.error('Error durante la limpieza de recursos:', err);
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
    let topWords = wordFrequencies.slice(0, 30);
    return topWords;
  };
  
  const executeWorkflow = async (text) => {
    console.log('Iniciando el flujo de trabajo con el texto proporcionado...');
    await uploadAndProcessFile(text);
    const fileContent = await fetchFileContent();
    const results = processResults(fileContent);
    await cleanUpResources();
    console.log('Proceso completado. Devolviendo resultado.');
    return results;
  };
  
  module.exports = { executeWorkflow };
