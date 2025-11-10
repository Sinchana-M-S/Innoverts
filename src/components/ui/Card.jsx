import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg transition-all hover:shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={cn('text-xl font-bold text-black dark:text-white', className)}>{children}</h3>;
}

export function CardDescription({ children, className }) {
  return <p className={cn('text-gray-600 dark:text-gray-400 text-sm', className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={cn('', className)}>{children}</div>;
}

