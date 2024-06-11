import { useState, useEffect } from 'react';
import { articlesData } from './data/articles';
import { ArticleCard } from './components/article-card';
import { FaSpinner } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast, { Toaster } from 'react-hot-toast';

type ProcessedTextItem = {
  palabra: string;
  frecuencia: number;
};

const removeDuplicates = (articles) => {
  const seenTitles = new Set();
  return articles.filter(article => {
    const isDuplicate = seenTitles.has(article.Titulo);
    seenTitles.add(article.Titulo);
    return !isDuplicate;
  });
};

export const App = () => {
  const [words, setWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [articles, setArticles] = useState(removeDuplicates(articlesData));
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [processedText, setProcessedText] = useState<ProcessedTextItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        console.log('Mensaje del servidor:', data.message);
        if (!data.message.includes('GC time elapsed') &&
            !data.message.includes('CPU time spent') &&
            !data.message.includes('Physical memory (bytes)') &&
            !data.message.includes('Virtual memory (bytes)')) {
          toast(data.message, {
            duration: 6000,
          });
        }
      }
    };

    ws.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (selectedWord || selectedSource) {
      const filtered = news.filter((article: any) => {
        const matchesWord = selectedWord ? article.Cuerpo.toLowerCase().includes(selectedWord.toLowerCase()) : true;
        const matchesSource = selectedSource ? article.Pagina === selectedSource : true;
        return matchesWord && matchesSource;
      }).sort((a, b) => {
        const aCount = (a.Cuerpo.toLowerCase().match(new RegExp(selectedWord.toLowerCase(), 'g')) || []).length;
        const bCount = (b.Cuerpo.toLowerCase().match(new RegExp(selectedWord.toLowerCase(), 'g')) || []).length;
        return bCount - aCount;
      });
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(news);
    }
  }, [selectedWord, selectedSource, news]);

  useEffect(() => {
    if (processedText.length > 0) {
      setSelectedWord(processedText[0].palabra);
    }
  }, [processedText]);

  useEffect(() => {
    const uniqueSources = Array.from(new Set(news.map(article => article.Pagina)));
    setSources(uniqueSources);
  }, [news]);

  const onChangeSelectedWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWord(e.target.value);
  };

  const onChangeSelectedSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSource(e.target.value);
  };

  const formatDateString = (date: string) => {
    if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return date;
    }
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsAnimating(true);
    setProcessedText([]);
    const formattedStartDate = formatDateString(startDate);
    const formattedEndDate = formatDateString(endDate);
    console.log(`Fecha Inicial: ${formattedStartDate}`);
    console.log(`Fecha Final: ${formattedEndDate}`);
    try {
      const response = await fetch(`http://localhost:3001/news?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      if (!response.ok) {
        throw new Error('Error al conectar con el backend para obtener noticias');
      }
      const data = await response.json();
      console.log('Response from server:', data);

      const formattedData = removeDuplicates(data.map(article => ({
        ...article,
        fecha: formatDateString(article.fecha)
      })));
      setNews(formattedData);

      const response2 = await fetch('http://localhost:3001/concatenate-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: formattedData }),
      });
      if (!response2.ok) {
        throw new Error('Error al conectar con el backend para concatenar textos');
      }
      const result = await response2.json();
      console.log('Concatenated Text:', result.concatenatedText);

      const response3 = await fetch('http://localhost:3001/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: result.concatenatedText }),
      });
      if (!response3.ok) {
        throw new Error('Error al conectar con la máquina virtual para procesar el texto');
      }
      const processedData = await response3.json();
      console.log('Processed Text Response:', processedData);
      setProcessedText(processedData.result);
      setWords(processedData.result.map((item: ProcessedTextItem) => `Palabra: ${item.palabra}, Frecuencia: ${item.frecuencia}`));
    } catch (error) {
      console.error('Error:', error);
      alert(`Ha ocurrido un error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  return (
    <main className="h-screen bg-[#EBEBEB] p-2 overflow-hidden">
      <header className="mb-5 p-5 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-0">Análisis de Noticias</h1>
        <form className="flex flex-wrap items-end justify-center gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="startDate" className="font-medium text-gray-700">Fecha Inicial</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="font-medium text-gray-700">Fecha Final</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {processedText.length > 0 && (
            <div className="flex flex-col">
              <label htmlFor="source" className="font-medium text-gray-700">Fuente</label>
              <select
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="source"
                value={selectedSource}
                onChange={onChangeSelectedSource}
              >
                <option value="">Todas las fuentes</option>
                {sources.map((source, index) => (
                  <option key={index} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="w-full cursor-pointer rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-40"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin inline-block mr-2" />
            ) : (
              'Enviar'
            )}
          </button>
        </form>
      </header>
      <section className="mt-5 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 h-full">
        <aside className="sticky top-5 h-full rounded-lg border border-gray-300 bg-white p-5 shadow-lg overflow-y-auto">
          <h3 className="mb-3 text-xl font-medium text-gray-900">Palabras encontradas</h3>
          <ul className="grid gap-2">
            {(isLoading || initialLoad) ? (
              <SkeletonTheme color="#f0f0f0" highlightColor="#e0e0e0" duration={isAnimating ? 1.2 : 0}>
                {Array(20).fill().map((_, index) => (
                  <li key={index}>
                    <Skeleton height={24} />
                  </li>
                ))}
              </SkeletonTheme>
            ) : (
              processedText.map((wordObj, index) => (
                <li key={index}>
                  <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      id={`word-${wordObj.palabra}`}
                      type="radio"
                      value={wordObj.palabra}
                      onChange={onChangeSelectedWord}
                      checked={selectedWord === wordObj.palabra}
                    />
                    <span className="font-medium text-gray-900">{`${wordObj.palabra} (${wordObj.frecuencia})`}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </aside>
        <div className="h-full rounded-lg border border-gray-300 bg-white p-5 shadow-lg overflow-y-auto">
          <div className="grid gap-5">
            {(isLoading || initialLoad) ? (
              <SkeletonTheme color="#f0f0f0" highlightColor="#e0e0e0" duration={isAnimating ? 1.2 : 0}>
                {Array(3).fill().map((_, index) => (
                  <Skeleton key={index} height={200} />
                ))}
              </SkeletonTheme>
            ) : (
              filteredArticles.map((article: any, index: number) => (
                <ArticleCard key={index} article={{
                  id: article.URL,
                  title: article.Titulo,
                  content: article.Cuerpo,
                  date: article.fecha,
                  source: article.Pagina
                }} selectedWord={selectedWord} />
              ))
            )}
          </div>
        </div>
      </section>
      <Toaster position="bottom-right" reverseOrder={false} />
    </main>
  );
};
