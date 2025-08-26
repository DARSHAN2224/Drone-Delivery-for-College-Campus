const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => (
  <div className="flex items-center justify-between mt-4">
    <div className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </div>
    <div className="flex space-x-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
);

export default Pagination;


