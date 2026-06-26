import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Accueil from './screens/Accueil'
import Lecons from './screens/Lecons'
import Exercice from './screens/Exercice'
import Stats from './screens/Stats'
import Classement from './screens/Classement'
import Amis from './screens/Amis'
import Conversation from './screens/Conversation'
import Profil from './screens/Profil'
import Login from './screens/Login'
import { useSyncStatsWithAuth } from './hooks/useSyncStatsWithAuth'

export default function App(): JSX.Element {
  useSyncStatsWithAuth()

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/lecons" element={<Lecons />} />
          <Route path="/exercice" element={<Exercice />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/classement" element={<Classement />} />
          <Route path="/amis" element={<Amis />} />
          <Route path="/amis/:friendId" element={<Conversation />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
