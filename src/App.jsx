import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Goals from './pages/Goals'
import Create from './pages/Create'
import Dashboard from './pages/Dashboard'
import GoalDetail from './pages/GoalDetail'
import Metrics from "./pages/Metrics";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/create" element={<Create />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goal/:id" element={<GoalDetail />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App