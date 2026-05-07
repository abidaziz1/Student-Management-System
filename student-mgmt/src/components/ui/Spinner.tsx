interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${SIZES[size]} border-blue-100 border-t-blue-500 rounded-full animate-spin ${className}`}
    />
  );
}
