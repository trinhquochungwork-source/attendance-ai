import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AuthLayout from '../../components/Common/AuthLayout';
import toast from 'react-hot-toast';
import { Mail, Key, Lock, ArrowLeft, Send, RefreshCw } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
    const [formData, setFormData] = useState({ code: '', new_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!identifier) {
            toast.error('Vui lòng nhập Email hoặc Số điện thoại!');
            return;
        }

        setLoading(true);
        const otpToast = toast.loading('Đang gửi mã xác thực hệ thống...');
        try {
            const data = await authService.forgotPassword(identifier);
            if (data.status === 'success') {
                toast.success('Mã xác thực đã được gửi! Kiểm tra terminal backend.', {
                    id: otpToast,
                });
                setStep(2);
            } else {
                toast.error(data.message, { id: otpToast });
            }
        } catch (err) {
            toast.error('Lỗi kết nối Server!', { id: otpToast });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!formData.code || !formData.new_password) {
            toast.error('Vui lòng nhập đầy đủ mã OTP và mật khẩu mới!');
            return;
        }

        setLoading(true);
        const resetToast = toast.loading('Đang cập nhật mật khẩu mới...');
        try {
            const data = await authService.resetPassword(
                identifier,
                formData.code,
                formData.new_password
            );
            if (data.status === 'success') {
                toast.success('Mật khẩu đã được đổi thành công!', { id: resetToast });
                navigate('/signin');
            } else {
                toast.error(data.message, { id: resetToast });
            }
        } catch (err) {
            toast.error('Lỗi kết nối Server!', { id: resetToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? 'Khôi phục mật khẩu' : 'Xác thực bảo mật'}
            isRegister={false}
        >
            {step === 1 ? (
                <>
                    <p
                        style={{
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            lineHeight: '1.4',
                        }}
                    >
                        Nhập Email hoặc Số điện thoại để hệ thống gửi mã xác thực OTP 6 chữ số.
                    </p>
                    <div className='auth-form-group'>
                        <div style={{ position: 'relative' }}>
                            <Mail
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
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        className='btn-primary'
                        onClick={handleSendOTP}
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
                            'Đang gửi...'
                        ) : (
                            <>
                                <Send size={18} /> Gửi mã xác thực
                            </>
                        )}
                    </button>

                    <button
                        className='btn-stop'
                        onClick={() => navigate('/signin')}
                        style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            background: 'transparent',
                        }}
                    >
                        <ArrowLeft size={16} /> Quay lại Đăng nhập
                    </button>
                </>
            ) : (
                <>
                    <p
                        style={{
                            color: '#10b981',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            fontWeight: '500',
                        }}
                    >
                        Mã OTP đã được gửi tới {identifier}.
                    </p>
                    <div className='auth-form-group'>
                        <div style={{ position: 'relative' }}>
                            <Key
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
                                placeholder='Nhập mã OTP 6 số'
                                className='auth-input'
                                style={{ paddingLeft: '48px' }}
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                maxLength={6}
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
                                placeholder='Mật khẩu mới cực mạnh'
                                className='auth-input'
                                style={{ paddingLeft: '48px' }}
                                value={formData.new_password}
                                onChange={(e) =>
                                    setFormData({ ...formData, new_password: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <button
                        className='btn-primary'
                        onClick={handleResetPassword}
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
                            'Đang cập nhật...'
                        ) : (
                            <>
                                <RefreshCw size={18} /> Cập nhật mật khẩu
                            </>
                        )}
                    </button>

                    <button
                        className='btn-stop'
                        onClick={() => setStep(1)}
                        style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            background: 'transparent',
                        }}
                    >
                        Thử lại với Email khác
                    </button>
                </>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;
