import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '智能项目管理平台',
  description: '带AI建议的运营项目管理平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-[#FEFCF9] via-[#FEFCF9] to-[#F5F5F0]">
        {children}
      </body>
    </html>
  );
}
