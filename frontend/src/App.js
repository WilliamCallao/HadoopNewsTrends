import React, { useState, useEffect } from 'react';

function App() {
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs((prevLogs) => [...prevLogs, data.message]);
      }
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    return () => {
      ws.close();
    };
  }, []);

  const handleSendText = async () => {
    setLogs([]);
    setResult(null);

    const defaultText = "Reemplazar esto por las noticias cuando hadoop funcione";

    try {
      const response = await fetch('http://localhost:3001/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: defaultText })
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={handleSendText}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          Procesar Texto
        </button>
        {result && (
          <div className="mt-2 p-2 bg-gray-700 text-green-400 rounded">
            <h3 className="text-lg font-semibold">Resultado:</h3>
            <pre className="bg-gray-800 p-2 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
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
