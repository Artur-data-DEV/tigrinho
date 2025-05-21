interface MessageProps {
    children: React.ReactNode;
    type?: 'error' | 'success' | 'info';
  }
  
  const colors = {
    error: 'text-red-500',
    success: 'text-green-600',
    info: 'text-gray-700',
  };
  
  export default function Message({ children, type = 'info' }: MessageProps) {
    return <p className={`mt-3 ${colors[type]}`}>{children}</p>;
  }
  