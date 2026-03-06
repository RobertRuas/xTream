import localFont from 'next/font/local';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
    title: 'xTream Play',
    description: 'Premium Streaming Experience',
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
