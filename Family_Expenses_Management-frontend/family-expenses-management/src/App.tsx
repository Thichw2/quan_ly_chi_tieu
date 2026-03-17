import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import RootLayout from './Layout';
import Budget from './pages/Budget';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CreateFamilyPage from './pages/CreateFamily';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function CreateFamilyDialog() {
  const navigate = useNavigate();
  const family_id = localStorage.getItem('family_id');
  
  const user_id = localStorage.getItem('user_id');
  const access_token = localStorage.getItem('access_token');
  const publicPaths = ['/login', '/register', '/create-family'];
  const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));
  const shouldShowDialog = Boolean(family_id === 'null' && user_id && access_token && !isPublicPath);
  
  return (
    <Dialog open={shouldShowDialog} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Family Information Required</DialogTitle>
          <DialogDescription>
            Before proceeding, you need to set up your family information. This will help us personalize your experience and organize your household finances better.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Setting up your family profile includes:
          </p>
          <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
            <li>Creating a family name</li>
            <li>Setting up expense categories for better organization</li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={() => navigate('/create-family')}
            className="w-full sm:w-auto"
          >
            Create Family Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const user_id = localStorage.getItem('user_id');
  const access_token = localStorage.getItem('access_token');

  useEffect(() => {
    const publicPaths = ['/login', '/register'];
    const currentPath = window.location.pathname;
    const isPublicPath = publicPaths.some(path => currentPath.includes(path));

    if ((!user_id || !access_token) && !isPublicPath) {
      navigate('/login', { replace: true });
    } 
    if (user_id && access_token && isPublicPath) {
      navigate('/', { replace: true }); 
    }
  }, [user_id, access_token, navigate]);

  return (
    <>
      <CreateFamilyDialog />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-family" element={<CreateFamilyPage />} />
        <Route path="/" element={<RootLayout><Dashboard /></RootLayout>} />
        <Route path="/budget" element={<RootLayout><Budget /></RootLayout>} />
        <Route path="/expenses" element={<RootLayout><Expenses /></RootLayout>} />
        <Route path="/reports" element={<RootLayout><Reports /></RootLayout>} />
        <Route path="/settings" element={<RootLayout><Settings /></RootLayout>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;