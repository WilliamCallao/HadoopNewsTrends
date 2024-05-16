import { useState } from 'react'
import { articlesData } from './data/articles'
import { ArticleCard } from './components/article-card'

const wordList = new Array(20).fill('').map((_, idx) => `Palabra #${idx + 1}`)

export const App = () => {
  const [words, setWords] = useState(wordList)
  const [selectedWord, setSelectedWord] = useState('')
  const [articles] = useState(articlesData)

  const onChangeSelectedWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWord(e.target.id)
  }

  return (
    <main className="container mx-auto mt-5 min-h-screen">
      <header>
        <form className="flex items-end gap-5 ">
          <div className="flex flex-col">
            <label htmlFor="startDate">Fecha Inicial</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              id="startDate"
              type="date"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate">Fecha Final</label>
            <input
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              id="endDate"
              type="date"
            />
          </div>

          <input
            className="w-full cursor-pointer rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto "
            type="submit"
            value="Enviar"
          />
        </form>
      </header>
      <section className="mt-5 grid grid-cols-[250px_1fr] gap-5">
        <aside className="h-fit rounded-lg border border-gray-300 bg-gray-50 p-5">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Palabras encontradas
          </h3>

          <ul className="grid gap-1">
            {words.map((word) => (
              <li key={word}>
                <label className="flex items-center gap-1">
                  <input
                    className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    id={`word-${word}`}
                    type="radio"
                    onChange={onChangeSelectedWord}
                    checked={selectedWord === `word-${word}`}
                  />
                  <span className="ms-2 font-medium text-gray-900">{word}</span>
                </label>
              </li>
            ))}
          </ul>

          <button
            className="my-2 w-full rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
            onClick={() => {
              setWords([...words, `Palabra #${words.length + 1}`])
            }}
          >
            Buscar artículos
          </button>
        </aside>
        <div className="grid gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  )
}
