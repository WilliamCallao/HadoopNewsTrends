import { useState } from 'react'

const wordList = new Array(20).fill('').map((_, idx) => `Palabra #${idx + 1}`)

interface Article {
  id: string
  title: string
  content: string
  date: string
  source: string
}

const sources = ['Los tiempos', 'La razon', 'El deber']

const articlesData: Article[] = new Array(20).fill('').map((_, idx) => ({
  id: crypto.randomUUID(),
  title: `Artículo #${idx + 1}`,
  content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc faucibus quam ac sagittis efficitur. Nulla a tortor non mauris lobortis sodales eget eget lorem. Suspendisse at elit sed lacus vehicula efficitur. Integer feugiat gravida risus, eget porttitor turpis maximus nec. Vivamus quis condimentum arcu. Donec pulvinar, sem ut dictum finibus, nisi risus dictum libero, in dapibus lacus enim at orci. Ut sed nibh vestibulum, consequat quam malesuada, sollicitudin diam. Aliquam vulputate turpis eu magna dictum pretium. Suspendisse potenti. Quisque faucibus, felis et aliquam semper, mauris nunc aliquet est, ut dignissim felis massa consequat mauris. Cras elementum facilisis laoreet. Duis rutrum lectus a mauris sodales feugiat. Suspendisse sit amet varius tellus.

Morbi non odio non ante convallis dictum. Vivamus placerat convallis erat a ullamcorper. Maecenas ornare vestibulum dui in consequat. Curabitur mollis elit sed augue pretium pretium. Proin nisi libero, porttitor id tristique a, aliquam id lacus. Nulla eleifend turpis at erat consequat accumsan. Sed finibus faucibus pulvinar. Sed id eros ac ipsum accumsan placerat nec non erat. Quisque faucibus lorem sed scelerisque aliquam. Etiam eros lorem, volutpat sed ultrices sit amet, convallis eu magna. Fusce ac gravida velit, in consequat orci. Phasellus viverra ultricies lectus in ornare. Nullam porta feugiat magna, in semper elit semper nec. Fusce elementum ligula dui, ut hendrerit enim feugiat vitae.

Cras metus felis, dictum et vehicula ut, dictum ac nisi. In ut nibh a libero tincidunt hendrerit eget ac mi. Vivamus quis convallis leo, eget maximus nisi. Cras enim sapien, varius in mattis id, volutpat in augue. Etiam quis turpis in est ultricies varius laoreet in est. Nullam facilisis nisl urna. Ut blandit finibus nisi, sit amet pellentesque arcu elementum at. Quisque et augue lobortis, sollicitudin purus in, lobortis lacus. Praesent vel pharetra libero. Integer tempus ex nec ornare accumsan. Praesent dui erat, feugiat et finibus ut, porttitor sed ligula.
`,
  date: new Date().toISOString(),
  source: sources[Math.floor(Math.random() * sources.length)],
}))

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
            <article
              key={article.id}
              className="rounded-lg border border-gray-300 bg-gray-50 p-5"
            >
              <h2 className="mb-2 text-lg font-medium text-gray-900">
                {article.title}
              </h2>
              <p className="mb-2 text-gray-600">{article.content}</p>
              <footer className="flex items-center justify-between">
                <small className="text-sm text-gray-600">
                  {article.source} -{' '}
                  {new Date(article.date).toLocaleDateString()}
                </small>
                <a className="text-sm text-blue-600 hover:underline" href="/">
                  Ver nota completa
                </a>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
