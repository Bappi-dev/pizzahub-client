import Footer from '@/components/sheard/Footer';
import React from 'react';

const RootLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <div>
           {children} 
            <Footer />
        </div>
    );
};

export default RootLayout;