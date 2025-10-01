import { Routes, Route } from "react-router-dom";
import Home from './pages/home';
import Loading from "./pages/loading";
import Upload from "./pages/upload";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </div>
  );
}

export default App;
