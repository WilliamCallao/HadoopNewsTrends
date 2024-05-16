import { Article } from '../interfaces'

interface Props {
  article: Article
}

export const ArticleCard = ({ article }: Props) => {
  return (
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
          {article.source} - {new Date(article.date).toLocaleDateString()}
        </small>
        <a className="text-sm text-blue-600 hover:underline" href="/">
          Ver nota completa
        </a>
      </footer>
    </article>
  )
}
