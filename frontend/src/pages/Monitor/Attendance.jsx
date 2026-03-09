import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WS_STREAM_URL } from '../../services/api';
import { Camera, LogOut, ShieldCheck, Activity, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Attendance = () => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [streaming, setStreaming] = useState(false);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState({ user: 'N/A', liveness: 0.0, state: 'Chưa bắt đầu' });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const ws = useRef(null);
    const intervalRef = useRef(null);

    const connectWS = () => {
        ws.current = new WebSocket(WS_STREAM_URL);
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStatus({
                user: data.recognized_user || 'Unknown',
                liveness: (data.liveness_score * 100).toFixed(1),
                state: data.status || 'Đang quét',
            });
            if (data.status === 'Attending') {
                setLogs((prev) => [
                    {
                        time: new Date().toLocaleTimeString(),
                        msg: `[${data.role.toUpperCase()}] ${data.recognized_user} hiện diện`,
                    },
                    ...prev.slice(0, 10),
                ]);
            }
        };
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreaming(true);
                connectWS();
                intervalRef.current = setInterval(() => {
                    if (videoRef.current && ws.current?.readyState === WebSocket.OPEN) {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        ws.current.send(canvas.toDataURL('image/jpeg', 0.5));
                    }
                }, 500);
            }
        } catch (err) {
            alert('Lỗi camera: ' + err.message);
        }
    };

    const stopCamera = () => {
        videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
        ws.current?.close();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStreaming(false);
    };

    const handleLogout = () => {
        stopCamera();
        logoutUser();
        toast.success('Hẹn gặp lại bạn!');
        navigate('/signin');
    };

    return (
        <div className='container'>
            <header
                className='header'
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ textAlign: 'left' }}>
                    <h1>HỆ THỐNG ĐIỂM DANH TQH</h1>
                    <p>
                        Xin chào:{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {user?.full_name}
                        </span>{' '}
                        ({user?.role})
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className='btn-stop'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                    }}
                >
                    <LogOut size={18} /> Thoát
                </button>
            </header>

            <main className='main-layout'>
                <section className='camera-section'>
                    <div className='video-wrapper'>
                        <video ref={videoRef} autoPlay playsInline muted />
                        <canvas
                            ref={canvasRef}
                            width='640'
                            height='360'
                            style={{ display: 'none' }}
                        />
                        {streaming && (
                            <div className='scan-overlay'>
                                <div className='scan-line'></div>
                                <div className='face-focus'></div>
                            </div>
                        )}
                        {!streaming && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    flexDirection: 'column',
                                    gap: '15px',
                                }}
                            >
                                <Camera size={48} color='#444' />
                                <p>Camera đang tắt</p>
                            </div>
                        )}
                    </div>
                    <div className='controls'>
                        {!streaming ? (
                            <button className='btn-primary' onClick={startCamera}>
                                <Activity size={18} style={{ marginRight: '8px' }} /> Bắt đầu quét
                                khuôn mặt
                            </button>
                        ) : (
                            <button className='btn-stop' onClick={stopCamera}>
                                Dừng giám sát
                            </button>
                        )}
                    </div>
                </section>
                <aside className='status-panel'>
                    <div className='card'>
                        <div className='status-indicator'>
                            <div className={`dot ${streaming ? 'active' : ''}`}></div>
                            <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                {streaming ? 'LIVE STREAMING' : 'OFFLINE'}
                            </span>
                        </div>
                        <div className='info-row'>
                            <span
                                className='info-label'
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Users size={14} /> Sinh viên:
                            </span>
                            <span className='info-value' style={{ color: 'var(--primary)' }}>
                                {status.user}
                            </span>
                        </div>
                        <div className='info-row'>
                            <span
                                className='info-label'
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <ShieldCheck size={14} /> Độ tin cậy:
                            </span>
                            <span
                                className='info-value'
                                style={{
                                    color: status.liveness < 70 ? 'var(--accent-red)' : '#10b981',
                                }}
                            >
                                {status.liveness}%{' '}
                                {status.liveness < 70 && status.liveness > 0 && '⚠️'}
                            </span>
                        </div>
                    </div>
                    <div className='card attendance-log'>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#94a3b8' }}>
                            NHẬT KÝ
                        </h3>
                        {logs.map((log, i) => (
                            <div
                                key={i}
                                className='log-item'
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    {log.time}
                                </span>{' '}
                                <br />
                                <span>{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default Attendance;
