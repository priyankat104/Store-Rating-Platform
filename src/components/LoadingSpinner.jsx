const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-slate-700 border-t-primary-500 ${sizes[size]}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
