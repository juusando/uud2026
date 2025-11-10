import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import pb from './services/pocketbase';
import './verify.scss';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams(); // Get route parameters
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL route parameter (e.g., /verify/token) or query parameter (e.g., /verify?token=...)
        const token = params.token || searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link - no token found');
          return;
        }

        // Confirm verification via PocketBase client
        await pb.collection('users').confirmVerification(token);

        setStatus('success');
        setMessage('Email verified successfully!');

        // Auto-login using stored credentials and redirect to /lab
        try {
          const email = localStorage.getItem('pb_pending_email');
          const password = localStorage.getItem('pb_pending_password');
          if (email && password) {
            const auth = await pb.collection('users').authWithPassword(email, password);
            if (auth?.record) {
              localStorage.removeItem('pb_pending_email');
              localStorage.removeItem('pb_pending_password');
              setTimeout(() => navigate('/lab'), 1000);
              return;
            }
          }
        } catch {}

        // Fallback redirect
        setTimeout(() => navigate('/lab'), 1500);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, params]);

  return (
    <div className="verify-container">
      <div className="verify-box">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h1>Verifying Your Email...</h1>
            <p>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon icon-success">
              <span className="checkmark">✓</span>
            </div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to your page in 3 seconds...</p>
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => navigate('/lab')}>
                Go to My Page
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Back to Login
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon icon-error">✕</div>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/')}
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}