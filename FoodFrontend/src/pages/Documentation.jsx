import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Zap, 
  User, 
  Store, 
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Truck,
  Globe,
  Smartphone,
  Database,
  Code,
  Zap as Lightning,
  BookOpen,
  Layers,
  Sparkles,
  File,
  Download,
  Music,
  ChevronDown,
  Play,
  ExternalLink
} from 'lucide-react';
import { api } from '../stores/api.js';

const Documentation = () => {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/documentation');
      if (response.data.success) {
        setBlocks(response.data.data || []);
      } else {
        setError('Failed to load documentation');
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
      setError('Failed to load documentation');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, MapPin, Zap, User, Store, Shield, CheckCircle, ArrowRight,
      Star, Clock, Truck, Globe, Smartphone, Database, Code, Lightning
    };
    return iconMap[iconName] || Users;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
      indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
      red: 'bg-gradient-to-br from-red-500 to-red-600 text-white'
    };
    return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-600 text-white';
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case 'hero':
        return (
          <div key={block._id} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-fade-in">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <div className="animate-slide-up">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-8 backdrop-blur-sm border border-white/20 animate-bounce">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-pulse">
                  {block.content.title}
                </h1>
                <p className="text-2xl md:text-4xl mb-12 text-purple-200 max-w-5xl mx-auto leading-relaxed font-light">
                  {block.content.text}
                </p>
                <p className="text-xl text-pink-200 max-w-4xl mx-auto font-medium mb-12">
                  {block.content.description}
                </p>
                <div className="flex justify-center space-x-6">
                  <button className="group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:scale-105">
                    <span className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>Get Started</span>
                    </span>
                  </button>
                  <button className="group bg-transparent text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 font-medium border border-white/30 hover:scale-105">
                    <span className="flex items-center space-x-2">
                      <ExternalLink className="w-5 h-5" />
                      <span>Learn More</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/60" />
            </div>
          </div>
        );

      case 'heading':
        return (
          <div key={block._id} className="relative py-32 bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="relative">
                <h2 
                  className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
                  style={{
                    fontSize: block.style?.fontSize || '4rem',
                    fontFamily: block.style?.fontFamily || 'Inter',
                    color: block.style?.color || '#111827',
                    fontWeight: block.style?.fontWeight || 'bold',
                    textAlign: block.style?.textAlign || 'center'
                  }}
                >
                  {block.content.text || block.content.title}
                </h2>
                <div className="w-48 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'feature_card':
        const IconComponent = getIconComponent(block.content.icon);
        return (
          <div key={block._id} className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 p-12 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-4 animate-fade-in overflow-hidden">
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 ${getColorClasses(block.content.color)} shadow-lg`}>
                <IconComponent className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8 group-hover:text-blue-600 transition-colors duration-300">
                {block.content.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-xl group-hover:text-gray-800 transition-colors duration-300">
                {block.content.description}
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{animationDelay: '0.2s'}}></div>
          </div>
        );

      case 'role_card':
        const RoleIcon = getIconComponent(block.content.icon);
        return (
          <div key={block._id} className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 p-12 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-4 animate-fade-in overflow-hidden">
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 ${getColorClasses(block.content.color)} shadow-lg`}>
                <RoleIcon className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8 group-hover:text-purple-600 transition-colors duration-300">
                {block.content.title}
              </h3>
              <p className="text-gray-600 mb-10 leading-relaxed text-xl group-hover:text-gray-800 transition-colors duration-300">
                {block.content.description}
              </p>
              <ul className="space-y-6">
                {block.content.items?.map((item, index) => (
                  <li key={index} className="flex items-start group/item">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-6 mt-1 group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 leading-relaxed text-xl group-hover/item:text-gray-900 transition-colors duration-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{animationDelay: '0.2s'}}></div>
          </div>
        );

      case 'paragraph':
        return (
          <div key={block._id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-16 border border-blue-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <p className="text-2xl text-gray-700 leading-relaxed text-center font-medium bg-gradient-to-r from-gray-700 to-blue-700 bg-clip-text text-transparent">
                {block.content.text}
              </p>
            </div>
          </div>
        );

      case 'bullet_points':
        return (
          <div key={block._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-16 border border-purple-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="grid md:grid-cols-2 gap-12">
                {block.content.items?.map((item, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6 mt-1 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white text-lg font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 leading-relaxed text-xl group-hover:text-gray-900 transition-colors duration-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rich_text':
        return (
          <div key={block._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div 
              className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-16 border border-indigo-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden"
              style={{
                fontSize: block.style?.fontSize || '20px',
                fontFamily: block.style?.fontFamily || 'Inter',
                color: block.style?.color || '#374151',
                backgroundColor: block.style?.backgroundColor || 'transparent',
                textAlign: block.style?.textAlign || 'left',
                fontWeight: block.style?.fontWeight || 'normal',
                fontStyle: block.style?.fontStyle || 'normal',
                textDecoration: block.style?.textDecoration || 'none',
                lineHeight: block.style?.lineHeight || '1.8',
                letterSpacing: block.style?.letterSpacing || '0px',
                padding: block.style?.padding || '20px',
                margin: block.style?.margin || '0px',
                border: block.style?.border || 'none',
                borderRadius: block.style?.borderRadius || '24px',
                boxShadow: block.style?.boxShadow || 'none',
                width: block.style?.width || '100%',
                height: block.style?.height || 'auto'
              }}
            >
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-20 translate-x-20 opacity-50 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-16 -translate-x-16 opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <div className="relative z-10">
                {block.content.html ? (
                  <div className="prose prose-2xl max-w-none" dangerouslySetInnerHTML={{ __html: block.content.html }} />
                ) : (
                  <>
                    {block.content.title && (
                      <div className="mb-12">
                        <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                          {block.content.title}
                        </h2>
                        <div className="w-32 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    {block.content.text && (
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed text-2xl mb-12 bg-gradient-to-r from-gray-50 to-blue-50 p-12 rounded-3xl border-l-8 border-blue-500 shadow-lg">
                        {block.content.text}
                      </div>
                    )}
                    {block.content.description && (
                      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-3xl border border-blue-200 shadow-lg">
                        <p className="text-gray-700 text-xl italic font-medium">
                          {block.content.description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={block._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-12 border border-blue-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              {block.content.title && (
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  {block.content.title}
                </h3>
              )}
              <div className="relative group">
                <img 
                  src={block.content.url} 
                  alt={block.content.altText || 'Documentation image'}
                  className="w-full h-auto rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 border-4 border-blue-200 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              {block.content.description && (
                <p className="text-gray-600 mt-8 text-center text-xl italic bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-blue-200">
                  {block.content.description}
                </p>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div key={block._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-12 border border-purple-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              {block.content.title && (
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                  {block.content.title}
                </h3>
              )}
              <div className="relative group">
                <video 
                  src={block.content.url} 
                  controls
                  className="w-full h-auto rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 border-4 border-purple-200 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              {block.content.description && (
                <p className="text-gray-600 mt-8 text-center text-xl italic bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  {block.content.description}
                </p>
              )}
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={block._id} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl p-12 border border-orange-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              {block.content.title && (
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
                  {block.content.title}
                </h3>
              )}
              <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-red-50 p-12 rounded-3xl border border-orange-200 text-center shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                  <File className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">{block.content.altText || 'Documentation File'}</h4>
                <p className="text-gray-600 mb-8 text-lg">Click to download or view the file</p>
                <a 
                  href={block.content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="w-6 h-6" />
                  <span>Download File</span>
                </a>
              </div>
              {block.content.description && (
                <p className="text-gray-600 mt-8 text-center text-xl italic bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-2xl border border-orange-200">
                  {block.content.description}
                </p>
              )}
            </div>
          </div>
        );

      case 'audio':
        return (
          <div key={block._id} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl shadow-2xl p-12 border border-pink-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              {block.content.title && (
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-gray-900 via-pink-800 to-purple-800 bg-clip-text text-transparent">
                  {block.content.title}
                </h3>
              )}
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 p-12 rounded-3xl border border-pink-200 text-center shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">{block.content.altText || 'Audio Content'}</h4>
                <audio 
                  src={block.content.url} 
                  controls
                  className="w-full max-w-lg mx-auto"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
              {block.content.description && (
                <p className="text-gray-600 mt-8 text-center text-xl italic bg-gradient-to-r from-gray-50 to-pink-50 p-6 rounded-2xl border border-pink-200">
                  {block.content.description}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto mb-8"></div>
          <p className="text-2xl font-medium">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-red-400 text-8xl mb-8">⚠️</div>
          <h2 className="text-3xl font-bold mb-6">Error Loading Documentation</h2>
          <p className="text-xl mb-10 text-red-200">{error}</p>
          <button
            onClick={fetchDocumentation}
            className="bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Modern Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">FoodHub Docs</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-10">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 text-lg">
                Home
              </a>
              <a href="/documentation" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2 relative text-lg">
                Documentation
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        <div className="space-y-0">
          {blocks.map((block, index) => (
            <div key={block._id} style={{ animationDelay: `${index * 0.2}s` }}>
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mr-4">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">Ready to Get Started?</h3>
            </div>
            <p className="text-gray-300 mb-12 max-w-3xl mx-auto text-xl leading-relaxed">
              Join thousands of users who have already embraced the future of food delivery. 
              Experience the power of drone technology and real-time tracking today.
            </p>
            <div className="flex justify-center space-x-8">
              <button className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-12 py-5 rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center font-medium shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                <span className="flex items-center space-x-3">
                  <Play className="w-6 h-6" />
                  <span>Get Started</span>
                </span>
              </button>
              <button className="group bg-transparent text-white px-12 py-5 rounded-2xl hover:bg-white/10 transition-all duration-300 font-medium border-2 border-white/30 hover:border-white/50 transform hover:-translate-y-1">
                <span className="flex items-center space-x-3">
                  <ExternalLink className="w-6 h-6" />
                  <span>Learn More</span>
                </span>
              </button>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-lg">
              © 2024 FoodHub - Advanced Food & Drone Delivery Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
