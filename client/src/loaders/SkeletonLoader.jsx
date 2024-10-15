const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="flex items-center mb-3">
      <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
      <div className="ml-3 w-24 h-6 bg-gray-400 rounded"></div>
    </div>
    <div className="h-4 bg-gray-400 rounded w-full mb-3"></div>
    <div className="h-64 bg-gray-400 rounded-lg"></div>
  </div>
);

export default SkeletonLoader;