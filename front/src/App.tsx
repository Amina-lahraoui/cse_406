import { Routes, Route } from "react-router-dom";
import Home from './pages/home';
import Exec from "./pages/exec";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exec" element={<Exec />} />
      </Routes>
    </div>
  );
}

export default App;
