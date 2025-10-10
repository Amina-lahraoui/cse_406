import { Routes, Route } from "react-router-dom";
import { Hero, Auth, Forgot, Loading, Upload } from "@/pages";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Auth />} />
        {/* <Route path="/sign" element={<Sign />} /> */}
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/loading" element={<Loading />} />
        {/* <Route path="/home" element={<Home />} /> */}
      </Routes>
    </div>
  );
}

export default App;
