import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import HandTracker from './components/hand/HandTracker';
import Statistics from './components/stats/Statistics';
import { database } from './config/firebase';
import { ref, set } from 'firebase/database';
import Predictions from './components/Predictions';



const testFirebase = async () => {
  try {
    const testRef = ref(database, 'test');
    await set(testRef, {
      message: 'Test successful',
      timestamp: Date.now()
    });
    console.log('Firebase connection successful');
  } catch (error) {
    console.error('Firebase error:', error);
  }
};
testFirebase();
const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/track"
          element={
            <PrivateRoute>
              <HandTracker />
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          }
        />
      <Route
          path="/predictions"
          element={
            <PrivateRoute>
              <Predictions />
            </PrivateRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;