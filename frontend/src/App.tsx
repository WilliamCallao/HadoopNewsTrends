import { useState } from 'react'

const wordList = new Array(20).fill('').map((_, idx) => `Palabra #${idx + 1}`)

export const App = () => {
  const [words, setWords] = useState(wordList)
  const [selectedWord, setSelectedWord] = useState('')

  const onChangeSelectedWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWord(e.target.id)
  }

  return (
    <main className="container mx-auto min-h-screen ">
      <header>
        <form className="flex items-center gap-5">
          <div className="flex flex-col">
            <label htmlFor="">Fecha Inicial</label>
            <input type="date" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="">Fecha Final</label>
            <input type="date" />
          </div>

          <input type="submit" value="Enviar" />
        </form>
      </header>
      <section className="mt-5 grid grid-cols-[300px_1fr]">
        <aside>
          <ul className="grid gap-1">
            {words.map((word) => (
              <li key={word}>
                <label className="flex items-center gap-3">
                  <input
                    id={`word-${word}`}
                    type="radio"
                    onChange={onChangeSelectedWord}
                    checked={selectedWord === `word-${word}`}
                  />
                  <span className="cursor-pointer">{word}</span>
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              setWords([...words, `Palabra #${words.length + 1}`])
            }}
          >
            Buscar Palabra
          </button>
        </aside>
        <div></div>
      </section>
    </main>
  )
}
