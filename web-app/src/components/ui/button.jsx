export const Button = ({ children, className, onClick, disabled }) => (
  <button
    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out ${
      disabled
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
    } ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);