import { Info, Users, Heart, Shield } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to FoodCourt</h2>
            <p className="text-gray-600">
              Your one-stop destination for delicious food from the best local restaurants and food vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-sm text-gray-600">
                Connecting local food vendors with food lovers in your community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-sm text-gray-600">
                Every vendor is carefully vetted to ensure the highest quality standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-600">
                Your safety and security are our top priorities.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600 mb-4">
              To revolutionize the way people discover and order food from local vendors, 
              making it easier than ever to support local businesses while enjoying delicious meals.
            </p>
            <p className="text-gray-600">
              We believe in the power of community and the importance of supporting local food vendors 
              who bring unique flavors and experiences to our neighborhoods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
