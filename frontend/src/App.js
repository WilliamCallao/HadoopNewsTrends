import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [message, setMessage] = useState('');

  const handleButtonClick = async () => {
    try {
      const response = await fetch('http://localhost:3001/uppercase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al procesar el texto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="text-black py-2 px-4 w-64"
        placeholder="Ingresa tu texto aquí"
      />
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
