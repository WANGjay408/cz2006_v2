import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import MapPage from './pages/map';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/map-page" element={<MapPage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
