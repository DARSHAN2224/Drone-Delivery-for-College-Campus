import AdminSidebar from './AdminSidebar';
import AdminFeedback from './AdminFeedback';

const AdminFeedbackPage = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Customer Feedback & Engagement</h1>
          <p className="text-gray-600 mt-2">Monitor ratings, likes, and comments across all shops, sellers, and products</p>
        </div>
        <AdminFeedback />
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
