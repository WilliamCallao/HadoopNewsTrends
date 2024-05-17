import { useState } from 'react'
import { Article } from '../interfaces'
import { ArrowDown } from './icons'

interface Props {
  article: Article
}

export const ArticleCard = ({ article }: Props) => {
  const [showFullArticle, setShowFullArticle] = useState(false)

  const content = showFullArticle
    ? article.content
    : article.content.slice(0, 450) + ' ...'

  return (
    <article
      key={article.id}
      className="rounded-lg border border-gray-300 bg-gray-50 p-5"
    >
      <h2 className="mb-2 text-lg font-medium text-gray-900">
        {article.title}
      </h2>
      <p className="mb-2 text-gray-600">{content}</p>

      <div className="my-3 flex justify-end">
        <button
          className="ml-auto"
          onClick={() => setShowFullArticle(!showFullArticle)}
        >
          <ArrowDown
            className={`transition-transform delay-100 duration-500 ${showFullArticle ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      </div>

      <footer className="flex items-center justify-between">
        <small className="text-sm text-gray-600">
          {article.source} - {new Date(article.date).toLocaleDateString()}
        </small>
        <a className="text-sm text-blue-600 hover:underline" href="/">
          Ver nota completa
        </a>
      </footer>
    </article>
  )
}
