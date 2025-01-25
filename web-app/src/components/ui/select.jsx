export const Select = ({ value, onValueChange, children, className }) => (
  <div
    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white shadow-sm ${className}`}
    onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
  >
    {children}
  </div>
);

export const SelectTrigger = ({ children, className, onClick }) => (
  <div
    onClick={onClick}
    className={`w-full px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer bg-white shadow-sm ${className}`}
  >
    {children}
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
);

export const SelectContent = ({ children, className }) => (
  <div
    className={`mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const SelectItem = ({ value, children, onClick, className }) => (
  <div
    onClick={() => {
      console.log('Selected Coin ID:', value); // Debugging
      onClick(value);
    }}
    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all ${className}`}
  >
    {children}
  </div>
);

export const SelectValue = ({ placeholder }) => (
  <span className="text-gray-700">{placeholder}</span>
);