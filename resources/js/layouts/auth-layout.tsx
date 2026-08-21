import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    bgImage?: string;
    reverse?: boolean;
}

export default function AuthLayout({ 
    children, 
    title, 
    description, 
    reverse,
    ...props 
}: AuthLayoutProps) {
    // Otomatis bernilai true jika route saat ini adalah 'register', 
    // atau jika prop reverse dikirim manual secara eksplisit.
    const isRegister = reverse ?? (typeof route !== 'undefined' ? route().current('register') : false);

    return (
        <AuthSplitLayout 
            title={title} 
            description={description} 
            reverse={isRegister}
            {...props}
        >
            {children}
        </AuthSplitLayout>
    );
}