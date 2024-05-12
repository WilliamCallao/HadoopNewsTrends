import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  const handleButtonClick = () => {
    setMessage('Proceso completado con éxito!');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Procesar
      </button>
      {message && (
        <div className="text-white text-lg">
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
