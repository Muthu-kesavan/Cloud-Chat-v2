import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { apiClient } from './lib/api-client';
import { GET_USER_INFO } from './utils/constants';
import { ClipLoader } from 'react-spinners';
import Auth from './pages/auth/index';
import Chat from './pages/chat';

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
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-lg mx-auto mb-8">
          <p className="text-base sm:text-lg md:text-xl font-medium text-purple-700 mb-4">
            Thanks for your patience!
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Our free hosting may take a moment to load.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <ClipLoader color="#5A00EE" size={40} className="sm:scale-125 md:scale-150" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col justify-center items-center px-4">
            <div className="text-center mb-6">
              <p className="text-sm sm:text-base text-gray-600">Loading...</p>
            </div>
            <ClipLoader color="#5A00EE" size={40} className="sm:scale-125" />
          </div>
        }
      >
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <PrivateRoute>
                <Explore />
              </PrivateRoute>
            }
          />
          <Route
            path="/lets-post"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <PrivateRoute>
                <SinglePost />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
