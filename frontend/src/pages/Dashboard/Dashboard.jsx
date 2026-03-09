import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        toast.success('Đã đăng xuất thành công!');
        navigate('/signin');
    };

    return (
        <div className='container'>
            <header
                className='header'
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ textAlign: 'left' }}>
                    <h1>PORTAL {user?.role?.toUpperCase()}</h1>
                    <p>
                        Chào mừng Quản trị viên:{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {user?.full_name}
                        </span>
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className='btn-stop'
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <LogOut size={18} /> Đăng xuất
                </button>
            </header>

            <div className='card'>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '1.5rem',
                    }}
                >
                    <LayoutDashboard color='var(--primary)' size={28} />
                    <h3 style={{ margin: 0 }}>Bảng điều khiển Quản lý</h3>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1rem',
                    }}
                >
                    <div
                        className='info-row'
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '15px',
                            borderRadius: '12px',
                        }}
                    >
                        <div
                            className='info-label'
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <Phone size={14} /> SĐT:
                        </div>
                        <div className='info-value'>{user?.phone || 'N/A'}</div>
                    </div>
                    <div
                        className='info-row'
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '15px',
                            borderRadius: '12px',
                        }}
                    >
                        <div
                            className='info-label'
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <Mail size={14} /> Email:
                        </div>
                        <div className='info-value'>{user?.email || 'N/A'}</div>
                    </div>
                </div>

                <p
                    style={{
                        marginTop: '2.5rem',
                        opacity: 0.6,
                        fontStyle: 'italic',
                        textAlign: 'center',
                    }}
                >
                    Các tính năng thống kê chuyên sâu và quản lý điểm danh đang trong quá trình tích
                    hợp AI phân tích...
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
