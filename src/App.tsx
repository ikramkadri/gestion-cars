import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // تأكدي من المسار
import Home from "./pages/Home";
import Cars from "./pages/Cars";

function App() {
  return (
    <Router>
      <Navbar /> {/* هكذا الـ Navbar يبقى ديما الفوق */}
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;