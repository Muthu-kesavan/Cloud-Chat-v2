const CommentSkeletonLoader = () => {
  return (
    <div className="animate-pulse flex items-start py-2 border-t">
      <div className="mr-2">
        <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
      </div>
      <div className="flex-grow space-y-2">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-400 rounded w-1/4"></div>
          <div className="h-3 bg-gray-400 rounded w-1/6"></div>
        </div>
        <div className="h-4 bg-gray-400 rounded w-full"></div>
        <div className="h-4 bg-gray-400 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default CommentSkeletonLoader;