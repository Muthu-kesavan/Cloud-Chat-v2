import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { apiClient } from './lib/api-client';
import { GET_USER_INFO } from './utils/constants';
import { ClipLoader } from 'react-spinners';

const Auth = lazy(() => import('./pages/auth/index'));
const Chat = lazy(() => import('./pages/chat'));
const Profile = lazy(() => import('./pages/profile'));
const Explore = lazy(() => import('./pages/explore'));
const CreatePost = lazy(() => import('./pages/createPost'));
const NotFound = lazy(() => import('./pages/notFound'));
const SinglePost = lazy(() => import('./pages/nonUserPage'));

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data.id) {
          setUserInfo(res.data);
        } else {
          setUserInfo(undefined);
        }
      } catch (err) {
        setUserInfo(undefined);
        console.log({ err });
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen justify-between">
        <div className="flex items-center justify-center pt-10">
          <p className="text-lg font-semifold text-purple-700">
          Thanks for your patience! Our free hosting may take a moment to load, typically 1–2 minutes.
          </p>
        </div>
        <div className="flex items-center justify-center pb-10">
          <ClipLoader color="#5A00EE" size={50} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <ClipLoader color="#5A00EE" size={50} />
          </div>
        }
      >
        <Routes>
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
          <Route path="/lets-post" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/post/:postId" element={<SinglePost />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
