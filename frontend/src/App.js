import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendText = async () => {
    setLogs([]); // Limpiar logs anteriores
    setResult(''); // Limpiar el resultado anterior
    setLoading(true); // Activar el indicador de carga

    try {
      const response = await fetch('http://localhost:3001/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      if (response.ok) {
        setLogs(['Proceso completado. Resultado recibido.']);
        setResult(data.result);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      setLogs(['Error al procesar texto: ' + error.message]);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="form-input w-full p-2 border border-gray-500 rounded mt-1 bg-gray-800"
          placeholder="Ingresa texto aquí"
        />
        <button
          onClick={handleSendText}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          Procesar Texto
        </button>
        {loading && (
          <div className="mt-2 w-full flex justify-center">
            <div className="loader border-t-transparent border-solid rounded-full border-white border-4 h-6 w-6 animate-spin"></div>
          </div>
        )}
        {result && (
          <div className="mt-2 p-2 bg-gray-700 text-green-400 rounded">
            Resultado: {result}
          </div>
        )}
        <div className="mt-4 p-2 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-lg font-semibold">Logs:</h3>
          {logs.map((log, index) => (
            <div key={index} className="text-sm text-gray-400">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
