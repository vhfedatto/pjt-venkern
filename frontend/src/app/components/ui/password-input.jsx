import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useState } from 'react';
import { Input } from './input';
import { cn } from './utils';
export function PasswordInput({
  className,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-10', className)} />
      <button type="button" onClick={() => setVisible(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:pointer-events-none disabled:opacity-50" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} tabIndex={-1}>
        {visible ? <EyeSlash size={18} weight="duotone" /> : <Eye size={18} weight="duotone" />}
      </button>
    </div>;
}