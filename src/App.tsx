import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ArticlesList from './components/ArticlesList';
import ArticleForm from './components/ArticleForm';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<ArticlesList />} />
          <Route path="/new" element={<ArticleForm />} />
          <Route path="/edit/:id" element={<ArticleForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
