export const Button = ({ children, className, onClick, disabled }) => (
    <button
      className={`px-4 py-2 rounded-md transition-all ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );