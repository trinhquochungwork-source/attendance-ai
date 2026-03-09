import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import AuthLayout from '../../components/Common/AuthLayout';
import toast from 'react-hot-toast';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!formData.identifier || !formData.password) {
            toast.error('Vui lòng nhập Email/Số điện thoại và Mật khẩu!');
            return;
        }

        setLoading(true);
        const loginToast = toast.loading('Đ đang xác thực...');
        try {
            const data = await authService.login(formData.identifier, formData.password);
            if (data.status === 'success') {
                loginUser(data.user);
                toast.success(`Chào mừng ${data.user.full_name} trở lại!`, { id: loginToast });
                navigate(data.user.role === 'student' ? '/attendance' : '/dashboard');
            } else {
                toast.error(data.message, { id: loginToast });
            }
        } catch (err) {
            toast.error('Lỗi kết nối Server!', { id: loginToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title='Đăng nhập hệ thống' isRegister={false}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
                className='auth-form-group'
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <input
                            placeholder='Email hoặc Số điện thoại'
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.identifier}
                            onChange={(e) =>
                                setFormData({ ...formData, identifier: e.target.value })
                            }
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <input
                            type='password'
                            placeholder='Mật khẩu'
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                    <span
                        onClick={() => navigate('/forgot-password')}
                        style={{
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        Quên mật khẩu?
                    </span>
                </div>

                <button
                    type='submit'
                    className='btn-primary'
                    disabled={loading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                    }}
                >
                    {loading ? (
                        'Đang xử lý...'
                    ) : (
                        <>
                            Đăng nhập ngay <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
