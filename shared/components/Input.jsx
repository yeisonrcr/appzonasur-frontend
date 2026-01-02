function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-base font-semibold text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

export default Input