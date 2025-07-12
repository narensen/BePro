import React, { useEffect, useState } from 'react';

const fetchTrendingNews = async () => {
    
  return [
    { title: "BePro launches new feature!", url: "https://bepro.live/news/1" },
    { title: "Top profiles this week", url: "https://bepro.live/news/2" },
    { title: "Community event announced", url: "https://bepro.live/news/3" }
  ];
};

const TrendingNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchTrendingNews().then(setNews);
  }, []);

  return (
    <div>
      <h2 className="font-bold text-orange-700 mb-4 text-xl">Trending News</h2>
      <ul className="space-y-3">
        {news.map((item, idx) => (
          <li key={idx}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-orange-800 hover:text-orange-600 underline">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingNews;