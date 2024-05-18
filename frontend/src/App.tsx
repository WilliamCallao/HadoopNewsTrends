import { useState } from 'react'
import { articlesData } from './data/articles'
import { ArticleCard } from './components/article-card'
import { FaSpinner } from 'react-icons/fa'

type ProcessedTextItem = {
  palabra: string
  frecuencia: number
}

export const App = () => {
  const [words, setWords] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<string>('')
  const [articles] = useState(articlesData)
  const [news, setNews] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [processedText, setProcessedText] = useState<ProcessedTextItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onChangeSelectedWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWord(e.target.id)
  }
  
  const formatDateString = (date: string) => {
    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formattedStartDate = formatDateString(startDate)
    const formattedEndDate = formatDateString(endDate)
    console.log(`Fecha Inicial: ${formattedStartDate}`)
    console.log(`Fecha Final: ${formattedEndDate}`)
    try {
      // Primer endpoint: obtener las noticias
      const response = await fetch(`http://localhost:3001/news?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
      const data = await response.json()
      console.log('Response from server:', data)
      setNews(data)
      // Segundo endpoint: obtener la cadena concatenada
      const response2 = await fetch('http://localhost:3001/concatenate-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articles: data })
      })
      const result = await response2.json()
      console.log('Concatenated Text:', result.concatenatedText)
      // Llamar al endpoint process-text con el texto concatenado
      const response3 = await fetch('http://localhost:3001/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: result.concatenatedText })
      })
      const processedData = await response3.json()
      console.log('Processed Text Response:', processedData)
      setProcessedText(processedData.result)
      setWords(processedData.result.map((item: ProcessedTextItem) => `Palabra: ${item.palabra}, Frecuencia: ${item.frecuencia}`))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto mt-5 min-h-screen">
      <header>
        <form className="flex items-end gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="startDate">Fecha Inicial</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate">Fecha Final</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
      <section className="mt-5 grid grid-cols-[250px_1fr] gap-5">
        <aside className="sticky top-5 h-fit rounded-lg border border-gray-300 bg-gray-50 p-5">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Palabras encontradas
          </h3>
          <ul className="grid gap-1">
            {processedText.map((wordObj, index) => (
              <li key={index}>
                <label className="flex items-center gap-1">
                  <input
                    className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    id={`word-${wordObj.palabra}`}
                    type="radio"
                    onChange={onChangeSelectedWord}
                    checked={selectedWord === `word-${wordObj.palabra}`}
                  />
                  <span className="ms-2 font-medium text-gray-900">{`${wordObj.palabra} (${wordObj.frecuencia})`}</span>
                </label>
              </li>
            ))}
          </ul>
        </aside>
        <div className="mb-5 grid gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  )
}
