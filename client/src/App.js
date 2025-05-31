import logo from "./logo.svg";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Toaster } from "sonner";

import { Login } from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
