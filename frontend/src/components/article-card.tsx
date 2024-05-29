import { useState } from 'react';
import { Article } from '../interfaces';
import { ArrowDown } from './icons';

interface Props {
  article: Article;
  selectedWord: string;
}

export const ArticleCard = ({ article, selectedWord }: Props) => {
  const [showFullArticle, setShowFullArticle] = useState(false);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-300">{part}</mark> : part
    );
  };

  const content = showFullArticle
    ? highlightText(article.content, selectedWord)
    : highlightText(article.content.slice(0, 450) + ' ...', selectedWord);

  const handleOpenArticle = () => {
    window.open(article.id, '_blank', 'noopener,noreferrer');
    console.log("ssss", article);
  };

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
        <button
          className="text-sm text-blue-600 hover:underline focus:outline-none"
          onClick={handleOpenArticle}
        >
          Abrir artículo
        </button>
      </footer>
    </article>
  );
};
