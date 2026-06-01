import { Routes, Route, Navigate } from 'react-router-dom'
import SelectKid from './pages/SelectKid'
import KidView from './pages/KidView'
import ParentView from './pages/ParentView'
import Onboarding from './pages/Onboarding'

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<SelectKid />} />
      <Route path="/onboarding"   element={<Onboarding />} />
      <Route path="/kid/:kidId"   element={<KidView />} />
      <Route path="/parent"       element={<ParentView />} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  )
}
