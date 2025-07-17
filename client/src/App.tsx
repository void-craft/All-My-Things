import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { AddRoomPage } from '@/pages/AddRoomPage';
import { RoomPage } from '@/pages/RoomPage';
import { GroupPage } from '@/pages/GroupPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShoppingPage } from '@/pages/ShoppingPage';
import { StoresPage } from '@/pages/StoresPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { User } from '@/types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/new" element={<AddRoomPage />} />
          <Route path="/room/:id" element={<RoomPage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
