
import React from 'react';
import { Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

const PublicRoutes: React.FC = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Login />} /> {/* Redirect verification to login page */}
    </>
  );
};

export default PublicRoutes;
