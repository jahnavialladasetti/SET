import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-indigo-500" />
    </div>
  );
};

export default Spinner;
