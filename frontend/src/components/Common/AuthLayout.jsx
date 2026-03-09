import { Link } from 'react-router-dom';

const AuthLayout = ({ title, children, isRegister, error }) => {
    const logoUrl = '/logo_tqh.png';

    return (
        <div
            className='container'
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '1rem',
            }}
        >
            <div className='auth-card'>
                <div className='brand-container'>
                    <img src={logoUrl} alt='Logo TQH' className='brand-logo' />
                    <h2 className='brand-name'>TQH ATTENDANCE</h2>
                    <p
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.95rem',
                            marginTop: '0.5rem',
                            fontWeight: '500',
                        }}
                    >
                        Giám sát Sinh viên Thế hệ mới
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h3
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#fff',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {title}
                    </h3>
                    <div
                        style={{
                            width: '40px',
                            hieght: '3px',
                            background: 'var(--primary)',
                            margin: '10px auto',
                            borderRadius: '4px',
                            height: '4px',
                        }}
                    ></div>
                </div>

                {error && (
                    <div
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            padding: '12px',
                            borderRadius: '16px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className='auth-form-group'>{children}</div>

                <div
                    className='auth-footer'
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '2rem',
                        marginTop: '2rem',
                    }}
                >
                    <span style={{ opacity: 0.8 }}>
                        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                    </span>
                    <Link
                        to={isRegister ? '/signin' : '/signup'}
                        className='auth-link'
                        style={{ marginLeft: '8px' }}
                    >
                        {isRegister ? 'Đăng nhập ngay' : 'Gia nhập ngay'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
