const { executeWorkflow } = require('./ssh_11'); // Asegúrate de usar la ruta correcta

const testString = 'palabra mas repetida mas mas repetida';

executeWorkflow(testString)
  .then(result => {
    console.log('Proceso completado. Resultado:', result);
  })
  .catch(error => {
    console.error('Error durante la ejecución del flujo de trabajo:', error);
  });
