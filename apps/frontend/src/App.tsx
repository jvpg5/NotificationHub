import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./routes/Dashboard'));
const Simulator = lazy(() => import('./routes/Simulator'));
const History = lazy(() => import('./routes/History'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="history" element={<History />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;