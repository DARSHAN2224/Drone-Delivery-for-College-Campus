import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Settings,
  Palette,
  Type,
  Image,
  Video,
  File,
  Music,
  Sparkles,
  Zap,
  Layers,
  Grid,
  Users,
  User,
  Store,
  Shield,
  CheckCircle,
  Star,
  Heart,
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  Play,
  ExternalLink
} from 'lucide-react';
import { api } from '../../stores/api.js';

const AdminDocumentation = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in as an admin user.');
        return;
      }

      const response = await api.get('/admin/documentation', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const blocks = response.data.data || [];
        const groupedSections = groupBlocksIntoSections(blocks);
        setSections(groupedSections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to fetch documentation sections');
    } finally {
      setLoading(false);
    }
  };

  const groupBlocksIntoSections = (blocks) => {
    const sectionMap = new Map();
    
    blocks.forEach(block => {
      const sectionId = block.sectionId || 'default';
      const sectionName = block.sectionName || 'Main Section';
      
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, {
          id: sectionId,
          name: sectionName,
          blocks: [],
          isActive: true,
          isExpanded: true
        });
      }
      
      sectionMap.get(sectionId).blocks.push(block);
    });
    
    return Array.from(sectionMap.values());
  };

  const addBlockToSection = (section, blockType) => {
    const newBlock = {
      _id: `block_${Date.now()}`,
      type: blockType,
      order: section.blocks.length + 1,
      content: getDefaultContent(blockType),
      style: getDefaultStyle(blockType),
      sectionId: section.id,
      sectionName: section.name,
      isActive: true
    };

    const updatedSections = sections.map(s => 
      s.id === section.id 
        ? { ...s, blocks: [...s.blocks, newBlock] }
        : s
    );
    
    setSections(updatedSections);
    setActiveSection(updatedSections.find(s => s.id === section.id));
  };

  const getDefaultContent = (blockType) => {
    const defaults = {
      hero: {
        title: '🚀 Welcome to Our Platform',
        text: 'Experience amazing features and capabilities',
        description: 'Start your journey with us today'
      },
      heading: {
        text: 'Section Heading',
        title: 'Section Heading'
      },
      modern_card: {
        title: '✨ Amazing Feature',
        description: 'This feature will revolutionize your experience',
        icon: 'Star',
        color: 'gradient-blue',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      },
      role_card: {
        title: '👤 User Role',
        description: 'Perfect for this type of user',
        icon: 'User',
        color: 'purple',
        items: ['Feature 1', 'Feature 2', 'Feature 3']
      },
      animated_section: {
        title: '⚡ Animated Section',
        description: 'Section with smooth animations',
        animation: 'slide-up',
        backgroundColor: 'gradient-purple',
        content: 'Animated content here'
      },
      interactive_card: {
        title: '🎨 Interactive Card',
        description: 'Card with hover effects',
        icon: 'Sparkles',
        color: 'gradient-pink',
        hoverEffect: 'scale',
        content: 'Interactive content'
      }
    };
    
    return defaults[blockType] || { text: 'New content' };
  };

  const getDefaultStyle = (blockType) => {
    const defaults = {
      hero: {
        fontSize: '4rem',
        fontFamily: 'Inter',
        color: '#ffffff',
        backgroundColor: 'gradient-indigo',
        textAlign: 'center',
        fontWeight: 'bold',
        animation: 'fade-in'
      },
      heading: {
        fontSize: '3rem',
        fontFamily: 'Inter',
        color: '#111827',
        textAlign: 'center',
        fontWeight: 'bold',
        animation: 'slide-up'
      },
      modern_card: {
        fontSize: '1.125rem',
        fontFamily: 'Inter',
        color: '#374151',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fade-in',
        hoverEffect: 'scale'
      }
    };
    
    return defaults[blockType] || {
      fontSize: '1rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'transparent'
    };
  };

  const saveSection = async (section) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in as an admin user.');
        return;
      }

      const blocksToSave = section.blocks.map(block => ({
        ...block,
        sectionId: section.id,
        sectionName: section.name
      }));

      const response = await api.put('/admin/documentation/bulk-update', {
        blocks: blocksToSave
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchSections();
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setError('Failed to save section');
    }
  };

  const updateBlock = (sectionId, blockId, updates) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          blocks: section.blocks.map(block => 
            block._id === blockId ? { ...block, ...updates } : block
          )
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    setActiveSection(updatedSections.find(s => s.id === sectionId));
  };

  const deleteBlock = (sectionId, blockId) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          blocks: section.blocks.filter(block => block._id !== blockId)
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    setActiveSection(updatedSections.find(s => s.id === sectionId));
  };

  const renderStylePanel = () => {
    if (!selectedBlock) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-40">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Style Editor</h3>
            <button
              onClick={() => setShowStylePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Typography */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Typography</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                  <select
                    value={selectedBlock.style?.fontSize || '1rem'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, fontSize: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="0.75rem">Small (12px)</option>
                    <option value="1rem">Normal (16px)</option>
                    <option value="1.125rem">Large (18px)</option>
                    <option value="1.25rem">XL (20px)</option>
                    <option value="1.5rem">2XL (24px)</option>
                    <option value="2rem">3XL (32px)</option>
                    <option value="3rem">4XL (48px)</option>
                    <option value="4rem">5XL (64px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                  <select
                    value={selectedBlock.style?.fontWeight || 'normal'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, fontWeight: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                    <option value="extrabold">Extra Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Text Align</label>
                  <div className="flex space-x-2">
                    {[
                      { icon: 'left', value: 'left' },
                      { icon: 'center', value: 'center' },
                      { icon: 'right', value: 'right' },
                      { icon: 'justify', value: 'justify' }
                    ].map(({ icon, value }) => (
                      <button
                        key={value}
                        onClick={() => updateBlock(activeSection.id, selectedBlock._id, {
                          style: { ...selectedBlock.style, textAlign: value }
                        })}
                        className={`p-2 rounded-lg border ${
                          selectedBlock.style?.textAlign === value
                            ? 'bg-blue-100 border-blue-300 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedBlock.style?.color || '#374151'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, color: e.target.value }
                    })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Background</label>
                  <select
                    value={selectedBlock.style?.backgroundColor || 'transparent'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, backgroundColor: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="white">White</option>
                    <option value="gray-50">Light Gray</option>
                    <option value="gradient-blue">Blue Gradient</option>
                    <option value="gradient-purple">Purple Gradient</option>
                    <option value="gradient-pink">Pink Gradient</option>
                    <option value="gradient-indigo">Indigo Gradient</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Animations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Animations</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Animation Type</label>
                  <select
                    value={selectedBlock.style?.animation || 'none'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, animation: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="none">None</option>
                    <option value="fade-in">Fade In</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="scale-in">Scale In</option>
                    <option value="bounce">Bounce</option>
                    <option value="pulse">Pulse</option>
                    <option value="spin">Spin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hover Effect</label>
                  <select
                    value={selectedBlock.style?.hoverEffect || 'none'}
                    onChange={(e) => updateBlock(activeSection.id, selectedBlock._id, {
                      style: { ...selectedBlock.style, hoverEffect: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="none">None</option>
                    <option value="scale">Scale</option>
                    <option value="lift">Lift</option>
                    <option value="glow">Glow</option>
                    <option value="rotate">Rotate</option>
                    <option value="shake">Shake</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlockEditor = (block, section) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getBlockIcon(block.type)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{getBlockTypeName(block.type)}</h4>
              <p className="text-sm text-gray-500">Block #{block.order}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedBlock(block);
                setShowStylePanel(true);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingBlock(editingBlock === block._id ? null : block._id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteBlock(section.id, block._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {editingBlock === block._id && (
          <div className="space-y-4">
            {renderBlockForm(block, section)}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview:</h5>
          {renderBlockPreview(block)}
        </div>
      </div>
    );
  };

  const renderBlockForm = (block, section) => {
    const updateContent = (updates) => {
      updateBlock(section.id, block._id, {
        content: { ...block.content, ...updates }
      });
    };

    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={block.content?.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content?.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={block.content?.description || ''}
                onChange={(e) => updateContent({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Enter description"
              />
            </div>
          </div>
        );

      case 'modern_card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={block.content?.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Card title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={block.content?.description || ''}
                onChange={(e) => updateContent({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Card description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <select
                value={block.content?.icon || 'Star'}
                onChange={(e) => updateContent({ icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Star">Star</option>
                <option value="Sparkles">Sparkles</option>
                <option value="Zap">Zap</option>
                <option value="Heart">Heart</option>
                <option value="Award">Award</option>
                <option value="Target">Target</option>
                <option value="TrendingUp">Trending Up</option>
                <option value="Users">Users</option>
                <option value="Shield">Shield</option>
                <option value="CheckCircle">Check Circle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
              <select
                value={block.content?.color || 'gradient-blue'}
                onChange={(e) => updateContent({ color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="gradient-blue">Blue Gradient</option>
                <option value="gradient-purple">Purple Gradient</option>
                <option value="gradient-pink">Pink Gradient</option>
                <option value="gradient-indigo">Indigo Gradient</option>
                <option value="gradient-green">Green Gradient</option>
                <option value="gradient-orange">Orange Gradient</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
              <textarea
                value={block.content?.features?.join('\n') || ''}
                onChange={(e) => updateContent({ 
                  features: e.target.value.split('\n').filter(item => item.trim()) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={block.content?.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="4"
              placeholder="Enter content"
            />
          </div>
        );
    }
  };

  const renderBlockPreview = (block) => {
    const getIconComponent = (iconName) => {
      const iconMap = {
        Star, Sparkles, Zap, Heart, Award, Target, TrendingUp, Users, Shield, CheckCircle
      };
      return iconMap[iconName] || Star;
    };

    switch (block.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-2">{block.content?.title || 'Hero Title'}</h2>
            <p className="text-lg mb-2">{block.content?.text || 'Hero subtitle'}</p>
            <p className="text-sm opacity-90">{block.content?.description || 'Hero description'}</p>
          </div>
        );

      case 'modern_card':
        const IconComponent = getIconComponent(block.content?.icon);
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{block.content?.title || 'Card Title'}</h3>
            </div>
            <p className="text-gray-600 mb-4">{block.content?.description || 'Card description'}</p>
            {block.content?.features && (
              <ul className="space-y-2">
                {block.content.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-700">{block.content?.text || 'Content preview'}</p>
          </div>
        );
    }
  };

  const getBlockIcon = (type) => {
    const icons = {
      hero: <Sparkles className="w-5 h-5 text-blue-600" />,
      heading: <Type className="w-5 h-5 text-gray-600" />,
      modern_card: <Grid className="w-5 h-5 text-purple-600" />,
      animated_section: <Zap className="w-5 h-5 text-yellow-600" />,
      interactive_card: <Layers className="w-5 h-5 text-green-600" />,
      role_card: <Users className="w-5 h-5 text-indigo-600" />
    };
    return icons[type] || <Settings className="w-5 h-5 text-gray-600" />;
  };

  const getBlockTypeName = (type) => {
    const names = {
      hero: 'Hero Section',
      heading: 'Heading',
      modern_card: 'Modern Card',
      animated_section: 'Animated Section',
      interactive_card: 'Interactive Card',
      role_card: 'Role Card'
    };
    return names[type] || 'Content Block';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documentation editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Editor</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchSections}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modern UI Documentation Editor</h1>
              <p className="text-gray-600 mt-2">Create stunning, animated documentation with modern design elements</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newSection = {
                    id: `section_${Date.now()}`,
                    name: 'New Section',
                    blocks: [],
                    isActive: true,
                    isExpanded: true
                  };
                  setSections([...sections, newSection]);
                  setActiveSection(newSection);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        const updatedSections = sections.map(s => 
                          s.id === section.id ? { ...s, isExpanded: !s.isExpanded } : s
                        );
                        setSections(updatedSections);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {section.isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => {
                        const updatedSections = sections.map(s => 
                          s.id === section.id ? { ...s, name: e.target.value } : s
                        );
                        setSections(updatedSections);
                      }}
                      className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setActiveSection(section);
                        setShowAddBlock(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Block
                    </button>
                    <button
                      onClick={() => saveSection(section)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Save Section
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {section.isExpanded && (
                <div className="p-6">
                  {section.blocks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks yet</h3>
                      <p className="text-gray-600 mb-6">Add your first block to get started</p>
                      <button
                        onClick={() => {
                          setActiveSection(section);
                          setShowAddBlock(true);
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Add Block
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {section.blocks.map((block) => (
                        <div key={block._id || block.id || `block_${block.order}`}>
                          {renderBlockEditor(block, section)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Block Modal */}
        {showAddBlock && activeSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add Modern UI Block</h3>
                <button
                  onClick={() => setShowAddBlock(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Hero Section', type: 'hero', icon: Sparkles, color: 'from-blue-500 to-purple-600', desc: 'Full-screen hero with animations' },
                  { name: 'Modern Card', type: 'modern_card', icon: Grid, color: 'from-purple-500 to-pink-600', desc: 'Beautiful card with hover effects' },
                  { name: 'Animated Section', type: 'animated_section', icon: Zap, color: 'from-yellow-500 to-orange-600', desc: 'Section with smooth animations' },
                  { name: 'Interactive Card', type: 'interactive_card', icon: Layers, color: 'from-green-500 to-blue-600', desc: 'Interactive card with effects' },
                  { name: 'Heading', type: 'heading', icon: Type, color: 'from-gray-500 to-gray-700', desc: 'Styled heading text' },
                  { name: 'Role Card', type: 'role_card', icon: Users, color: 'from-indigo-500 to-purple-600', desc: 'User role information card' }
                ].map((blockType) => (
                  <div
                    key={blockType.type}
                    onClick={() => {
                      addBlockToSection(activeSection, blockType.type);
                      setShowAddBlock(false);
                    }}
                    className="group border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${blockType.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <blockType.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{blockType.name}</h4>
                    <p className="text-sm text-gray-600">{blockType.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Panel */}
        {showStylePanel && renderStylePanel()}

        {/* Preview Link */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-blue-900">Preview Your Modern Documentation</h3>
              <p className="text-blue-700 mt-1">See how your beautiful, animated documentation will appear to users</p>
            </div>
            <a
              href="/documentation"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>View Public Page</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentation;
