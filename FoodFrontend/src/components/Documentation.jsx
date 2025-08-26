import { useState, useEffect } from 'react';
import { 
  Play, 
  MapPin, 
  Truck, 
  Drone, 
  Users, 
  BarChart3, 
  Shield,
  Zap,
  Globe,
  Smartphone,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  Target,
  Award,
  Rocket,
  Sparkles
} from 'lucide-react';

const Documentation = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        const response = await fetch('/api/v1/documentation');
        const data = await response.json();
        if (data.success) {
          setBlocks(data.data.blocks);
        }
      } catch (error) {
        console.error('Failed to fetch documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, []);

  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading':
        return (
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 text-center mb-8 leading-tight">
            {block.content.text}
          </h1>
        );

      case 'subheading':
        return (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight text-center">
            {block.content.text}
          </h2>
        );

      case 'paragraph':
        return (
          <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-4xl mx-auto text-center">
            {block.content.text}
          </p>
        );

      case 'image':
        return (
          <div className="my-12 flex justify-center">
            <div className="relative group">
              <img
                src={block.content.url}
                alt={block.content.altText || 'Documentation image'}
                className="rounded-2xl shadow-2xl max-w-full h-auto transform transition-transform duration-300 group-hover:scale-105"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="my-12 flex justify-center">
            <div className="relative w-full max-w-5xl">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <iframe
                  src={block.content.url}
                  title="Documentation video"
                  className="w-full aspect-video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        );

      case 'bullet_points':
        return (
          <div className="my-12 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {block.content.items?.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-gray-700 leading-relaxed font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-purple-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Drone className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 mb-8 leading-tight">
              Food & Drone Delivery
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Revolutionizing the future of food delivery with cutting-edge technology and seamless user experiences
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-24">
          {/* Dynamic Content Blocks */}
          {blocks.map((block, index) => (
            <div key={block._id || index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              {renderBlock(block)}
            </div>
          ))}

          {/* Default Content if no blocks exist */}
          {blocks.length === 0 && (
            <>
              {/* Key Features Section */}
              <section className="text-center mb-24">
                <div className="mb-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl mb-8 shadow-xl">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Key Features</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Discover the powerful features that make our platform the future of food delivery
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Feature Card 1 */}
                  <div className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Role System</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Seamless experience for customers, powerful tools for sellers, and comprehensive oversight for administrators.
                      </p>
                    </div>
                  </div>

                  {/* Feature Card 2 */}
                  <div className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Tracking</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Watch your order travel from restaurant to doorstep with live GPS tracking and delivery updates.
                      </p>
                    </div>
                  </div>

                  {/* Feature Card 3 */}
                  <div className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                        <Drone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Drone Logistics</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Autonomous drone delivery system with intelligent routing and weather-optimized operations.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Role-Specific Benefits */}
              <section className="text-center mb-24">
                <div className="mb-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-8 shadow-xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Benefits for Everyone</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Each role in our ecosystem enjoys unique advantages designed for their specific needs
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Customer Benefits */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                    <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">For Customers</h3>
                    <ul className="text-left space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Intuitive ordering experience</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Real-time delivery tracking</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Multiple delivery options</span>
                      </li>
                    </ul>
                  </div>

                  {/* Seller Benefits */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                    <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">For Sellers</h3>
                    <ul className="text-left space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Comprehensive analytics dashboard</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Product & offer management</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Customer engagement tools</span>
                      </li>
                    </ul>
                  </div>

                  {/* Admin Benefits */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
                    <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">For Admins</h3>
                    <ul className="text-left space-y-3">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Fleet management control</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Real-time monitoring</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Safety & compliance oversight</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Drone Technology Section */}
              <section className="bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                <div className="relative">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
                      <Rocket className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">The Future of Delivery</h2>
                    <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                      Our autonomous drone technology represents the cutting edge of delivery innovation, 
                      combining AI-powered navigation with advanced safety systems.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Precision Navigation</h3>
                          <p className="opacity-80">Advanced GPS and obstacle detection ensure safe, accurate deliveries to your exact location.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Lightning Speed</h3>
                          <p className="opacity-80">Direct aerial routes reduce delivery times by up to 70% compared to traditional methods.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Safety First</h3>
                          <p className="opacity-80">Multiple safety systems including emergency landing and real-time monitoring ensure secure operations.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <div className="text-center">
                          <Drone className="w-16 h-16 text-white mx-auto mb-4" />
                          <h4 className="text-lg font-semibold mb-2">Live Fleet Status</h4>
                          <p className="opacity-80 text-sm">Monitor all active drones in real-time with our advanced control center.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience the Future?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of customers and restaurants already using our platform to revolutionize food delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
