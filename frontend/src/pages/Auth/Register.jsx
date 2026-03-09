import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AuthLayout from '../../components/Common/AuthLayout';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, UserCheck, Shield, UserPlus } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'student',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (
            !formData.email ||
            !formData.full_name ||
            !formData.phone ||
            !formData.username ||
            !formData.password
        ) {
            toast.error('Vui lòng điền đầy đủ tất cả các trường!');
            return;
        }

        setLoading(true);
        const registerToast = toast.loading('Đang khởi tạo tài khoản hệ thống...');
        try {
            const data = await authService.register(formData);
            if (data.status === 'success') {
                toast.success('Đăng ký thành công! Chào mừng bạn gia nhập TQH.', {
                    id: registerToast,
                });
                navigate('/signin');
            } else {
                toast.error(data.message, { id: registerToast });
            }
        } catch (err) {
            toast.error('Lỗi kết nối Server!', { id: registerToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title='Gia nhập TQH Attendance' isRegister={true}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                }}
                className='auth-form-group'
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <input
                            placeholder='Họ và tên đầy đủ'
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.full_name}
                            onChange={(e) =>
                                setFormData({ ...formData, full_name: e.target.value })
                            }
                        />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr',
                            gap: '0.75rem',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                }}
                            />
                            <input
                                placeholder='Email'
                                className='auth-input'
                                style={{ paddingLeft: '48px' }}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Phone
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                }}
                            />
                            <input
                                placeholder='Số điện thoại'
                                className='auth-input'
                                style={{ paddingLeft: '48px' }}
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <UserCheck
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <input
                            placeholder='Tên đăng nhập mới'
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock
                            size={18}
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
                            placeholder='Mật khẩu bảo mật'
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Shield
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />
                        <select
                            className='auth-input'
                            style={{ paddingLeft: '48px' }}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value='student'>🎓 Sinh viên</option>
                            <option value='teacher'>👨‍🏫 Giáo viên</option>
                            <option value='admin'>👮 Quản trị viên</option>
                        </select>
                    </div>
                </div>

                <button
                    type='submit'
                    className='btn-primary'
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                    }}
                >
                    {loading ? (
                        'Đang khởi tạo...'
                    ) : (
                        <>
                            Tạo tài khoản ngay <UserPlus size={18} />
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Register;
