import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/payment/:orderId" element={<PaymentPage />} />
              <Route path="/payment-result/:orderId" element={<PaymentResultPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </HashRouter>
  );
}
