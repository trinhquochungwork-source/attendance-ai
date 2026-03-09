import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Attendance from './pages/Monitor/Attendance';
import Dashboard from './pages/Dashboard/Dashboard';

// Route Bảo vệ - Ngăn sinh viên vào Dashboard giáo viên và ngược lại
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to='/signin' replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'student' ? '/attendance' : '/dashboard'} replace />;
    }

    return children;
};

// Route Không cho phép truy cập đã đăng nhập (VD: Vào lại trang Login)
const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={user.role === 'student' ? '/attendance' : '/dashboard'} replace />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Routes công khai với tên chuyên nghiệp */}
                    <Route
                        path='/signin'
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path='/signup'
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path='/forgot-password'
                        element={
                            <PublicRoute>
                                <ForgotPassword />
                            </PublicRoute>
                        }
                    />

                    {/* Routes bảo vệ */}
                    <Route
                        path='/attendance'
                        element={
                            <ProtectedRoute allowedRoles={['student', 'admin']}>
                                <Attendance />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/dashboard'
                        element={
                            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Mặc định redirect về login */}
                    <Route path='*' element={<Navigate to='/signin' replace />} />
                </Routes>
                <Toaster position='top-right' reverseOrder={false} />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
