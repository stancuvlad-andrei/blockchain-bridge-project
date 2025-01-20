export const Select = ({ value, onValueChange, children, className }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-md ${className}`}
    >
      {children}
    </select>
  );
  
  export const SelectTrigger = ({ children, className }) => (
    <div className={`w-full px-3 py-2 border rounded-md ${className}`}>
      {children}
    </div>
  );
  
  export const SelectContent = ({ children, className }) => (
    <div className={`mt-1 w-full bg-white border rounded-md shadow-lg ${className}`}>
      {children}
    </div>
  );
  
  export const SelectItem = ({ value, children, className }) => (
    <option value={value} className={`px-3 py-2 hover:bg-gray-100 ${className}`}>
      {children}
    </option>
  );
  
  export const SelectValue = ({ placeholder }) => (
    <span>{placeholder}</span>
  );