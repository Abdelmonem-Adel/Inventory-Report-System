import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            try {
                // Decode JWT to get user object
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userData = {
                    name: payload.name || payload.email?.split('@')[0] || 'User',
                    email: payload.email,
                    role: payload.role
                };

                // Save to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Redirect to inventory
                navigate('/inventory');
            } catch (err) {
                console.error('Failed to decode token', err);
                navigate('/login?error=' + encodeURIComponent('Invalid token received'));
            }
        } else if (error) {
            navigate('/login?error=' + encodeURIComponent(error));
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-gray-600 italic">Authenticating...</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
