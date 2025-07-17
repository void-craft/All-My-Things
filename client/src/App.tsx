import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { HomePage } from '@/pages/HomePage';
import { RoomPage } from '@/pages/RoomPage';
import { GroupPage } from '@/pages/GroupPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShoppingPage } from '@/pages/ShoppingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:id" element={<RoomPage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
