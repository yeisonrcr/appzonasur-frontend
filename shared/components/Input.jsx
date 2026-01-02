// Input.jsx
function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

export default Input