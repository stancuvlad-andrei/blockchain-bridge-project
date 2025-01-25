export const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={`bg-gradient-to-r from-blue-600 to-purple-600 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h2 className={`text-2xl font-bold text-white ${className}`}>
    {children}
  </h2>
);

export const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);