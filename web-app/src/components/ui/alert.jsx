export const Alert = ({ children, className }) => (
    <div className={`p-4 rounded-md ${className}`}>
      {children}
    </div>
  );
  
  export const AlertDescription = ({ children, className }) => (
    <p className={`text-sm ${className}`}>
      {children}
    </p>
  );