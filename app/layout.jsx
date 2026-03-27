import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export const metadata = {
  title: 'DoctorApp — Smart Appointment Management',
  description: 'Manage patients, doctors, and appointments with intelligent scheduling.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
