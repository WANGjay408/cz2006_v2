import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import MapPage from './pages/map';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="map-page" element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
