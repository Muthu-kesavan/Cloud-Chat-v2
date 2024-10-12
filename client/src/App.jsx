import React, { useEffect, useState } from 'react'
import Auth from './pages/auth/index'
import Chat from './pages/chat'
import Profile from './pages/profile'
import Explore from './pages/explore'
import CreatePost from './pages/createPost'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store'
import { apiClient } from './lib/api-client'
import { GET_USER_INFO } from './utils/constants'
import SinglePost from './pages/nonUserPage'



const PrivateRoute = ({children})=> {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

const AuthRoute = ({children})=> {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
}
const App = () => {
  const {userInfo, setUserInfo} = useAppStore();
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const getUserData = async()=> {
    try{
      const res = await apiClient.get(GET_USER_INFO, {
        withCredentials: true,
      });
      if (res.status === 200 && res.data.id){
        setUserInfo(res.data);
      }else{
        setUserInfo(undefined);
      }
    }catch(err){
      setUserInfo(undefined);
      console.log({err});
    } finally{
      setLoading(false);
    }}
    
    if (!userInfo){
      getUserData();
    }else{
      setLoading(false);
    }
  },[userInfo, setUserInfo]);

  if (loading){
    return <div> Loading...</div>;
  }
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/auth' element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path='/chat' element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path='/explore' element={<PrivateRoute><Explore /></PrivateRoute>} /> 
      <Route  path='/lets-post' element={<PrivateRoute><CreatePost /></PrivateRoute>}/>
      <Route path='/post/:postId' element={<SinglePost />} />
      <Route path='*' element={<Navigate to="/auth" />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App