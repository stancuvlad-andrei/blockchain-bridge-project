export const Alert = ({ children, className }) => (
  <div className={`p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const AlertDescription = ({ children, className }) => (
  <p className={`text-sm text-blue-800 ${className}`}>
    {children}
  </p>
);