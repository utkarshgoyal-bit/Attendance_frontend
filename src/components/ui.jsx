import { forwardRef, useState, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';

// Button
export const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-gray-100',
    outline: 'border border-gray-300 hover:bg-gray-50',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}{children}
    </button>
  );
});

// Input
export const Input = forwardRef(({ className = '', label, error, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input ref={ref} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`} {...props} />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

// Select
export const Select = forwardRef(({ className = '', label, error, options = [], ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select ref={ref} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`} {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

// Card
export const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`} {...props}>{children}</div>
);
export const CardHeader = ({ className = '', children }) => <div className={`px-6 py-4 border-b ${className}`}>{children}</div>;
export const CardContent = ({ className = '', children }) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

// Toast Context
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const toast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  
  return (
    <ToastContext.Provider value={{ toast, success: m => toast(m, 'success'), error: m => toast(m, 'error') }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Badge
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>{children}</span>;
};

// Table
export const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>{children}</table>
  </div>
);
export const Th = ({ children, className = '' }) => <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
export const Td = ({ children, className = '' }) => <td className={`px-4 py-3 whitespace-nowrap ${className}`}>{children}</td>;
