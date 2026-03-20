import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Goals from './pages/Goals'
import Create from './pages/Create'
import Dashboard from './pages/Dashboard'
import GoalDetail from './pages/GoalDetail'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App