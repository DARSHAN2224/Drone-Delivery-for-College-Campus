import mongoose from 'mongoose';

const documentationBlockSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['heading', 'subheading', 'paragraph', 'image', 'bullet_points', 'hero', 'feature_card', 'role_card', 'rich_text', 'video', 'file', 'audio', 'gallery', 'slideshow', 'chart', 'form', 'code'],
        required: true
    },
    content: {
        html: {
            type: String,
            default: ''
        },
        text: {
            type: String,
            default: ''
        },
        url: {
            type: String,
            default: ''
        },
        altText: {
            type: String,
            default: ''
        },
        items: [{
            type: String
        }],
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        color: {
            type: String,
            default: 'blue'
        }
    },
    style: {
        fontSize: {
            type: String,
            default: '16px'
        },
        fontFamily: {
            type: String,
            default: 'Inter'
        },
        color: {
            type: String,
            default: '#000000'
        },
        backgroundColor: {
            type: String,
            default: 'transparent'
        },
        textAlign: {
            type: String,
            enum: ['left', 'center', 'right', 'justify'],
            default: 'left'
        },
        fontWeight: {
            type: String,
            enum: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
            default: 'normal'
        },
        fontStyle: {
            type: String,
            enum: ['normal', 'italic'],
            default: 'normal'
        },
        textDecoration: {
            type: String,
            enum: ['none', 'underline', 'line-through'],
            default: 'none'
        },
        lineHeight: {
            type: String,
            default: '1.6'
        },
        letterSpacing: {
            type: String,
            default: '0px'
        },
        padding: {
            type: String,
            default: '20px'
        },
        margin: {
            type: String,
            default: '0px'
        },
        border: {
            type: String,
            default: 'none'
        },
        borderRadius: {
            type: String,
            default: '8px'
        },
        boxShadow: {
            type: String,
            default: 'none'
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: 'auto'
        }
    },
    sectionId: {
        type: String,
        default: ''
    },
    sectionName: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient ordering
documentationBlockSchema.index({ order: 1 });

export const DocumentationBlock = mongoose.model('DocumentationBlock', documentationBlockSchema);
