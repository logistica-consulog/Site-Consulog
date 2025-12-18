import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import { IMaskInput } from 'react-imask'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
  mask?: string
  onAccept?: (value: string) => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, showPasswordToggle, mask, onAccept, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type

    const inputClassName = cn(
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-red-500 focus:ring-red-500',
      showPasswordToggle && 'pr-10',
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {mask ? (
            <IMaskInput
              mask={mask}
              className={inputClassName}
              value={String(props.value || '')}
              placeholder={props.placeholder}
              disabled={props.disabled}
              required={props.required}
              onAccept={(value) => {
                if (onAccept) {
                  onAccept(value)
                } else if (onChange) {
                  // Create a synthetic event for onChange compatibility
                  onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
                }
              }}
            />
          ) : (
            <input
              type={inputType}
              className={inputClassName}
              ref={ref}
              onChange={onChange}
              {...props}
            />
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }