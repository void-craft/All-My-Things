// client/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { AddRoomPage } from '@/pages/AddRoomPage';
import { RoomPage } from '@/pages/RoomPage';
import { GroupPage } from '@/pages/GroupPage';
import { AddItemPage } from '@/pages/AddItemPage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShoppingPage } from '@/pages/ShoppingPage';
import { StoresPage } from '@/pages/StoresPage';
import { AddStorePage } from '@/pages/AddStorePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { User } from '@/types';
import { RoomEditPage } from '@/pages/RoomEditPage'; 

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch('/api/current_user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    checkCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout on backend:', error);
    } finally {
      setUser(null);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <p className="text-xl text-primary font-bold animate-pulse">Loading App...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/new" element={<AddRoomPage />} />
          <Route path="/room/:id" element={<RoomPage />} />
          <Route path="/room/:id/edit" element={<RoomEditPage />} />
          <Route path="/room/:roomId/item/new" element={<AddItemPage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/group/:groupId/item/new" element={<AddItemPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/store/new" element={<AddStorePage />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;