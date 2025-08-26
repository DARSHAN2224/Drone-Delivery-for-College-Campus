import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { DocumentationBlock } from '../models/documentationModel.js';

// Public endpoint to get all active documentation blocks
export const getDocumentation = asyncHandler(async (req, res) => {
    const blocks = await DocumentationBlock.find({ isActive: true })
        .sort({ order: 1 });

    res.status(200).json(new ApiResponse(200, blocks, "Documentation retrieved successfully"));
});

// Admin: Get all documentation blocks (including inactive)
export const getAllDocumentationBlocks = asyncHandler(async (req, res) => {
  const blocks = await DocumentationBlock.find({})
        .sort({ order: 1 });

    res.status(200).json(new ApiResponse(200, blocks, "All documentation blocks retrieved successfully"));
});

// Admin: Create a new documentation block
export const createDocumentationBlock = asyncHandler(async (req, res) => {
    const { order, type, content, isActive = true } = req.body;

    // Check if order already exists
    const existingBlock = await DocumentationBlock.findOne({ order });
    if (existingBlock) {
        throw new ApiError("Order already exists", 400, "A block with this order already exists");
    }

    const newBlock = new DocumentationBlock({
        order,
    type,
        content,
        isActive
    });

    await newBlock.save();

    res.status(201).json(new ApiResponse(201, newBlock, "Documentation block created successfully"));
});

// Admin: Update a documentation block
export const updateDocumentationBlock = asyncHandler(async (req, res) => {
  const { blockId } = req.params;
    const updateData = req.body;

    // If order is being updated, check for conflicts
    if (updateData.order) {
        const existingBlock = await DocumentationBlock.findOne({ 
            order: updateData.order, 
            _id: { $ne: blockId } 
        });
        if (existingBlock) {
            throw new ApiError("Order already exists", 400, "A block with this order already exists");
        }
    }

  const updatedBlock = await DocumentationBlock.findByIdAndUpdate(
    blockId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedBlock) {
        throw new ApiError("Block not found", 404, "Documentation block not found");
    }

    res.status(200).json(new ApiResponse(200, updatedBlock, "Documentation block updated successfully"));
});

// Admin: Delete a documentation block
export const deleteDocumentationBlock = asyncHandler(async (req, res) => {
  const { blockId } = req.params;

    const deletedBlock = await DocumentationBlock.findByIdAndDelete(blockId);

    if (!deletedBlock) {
        throw new ApiError("Block not found", 404, "Documentation block not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Documentation block deleted successfully"));
});

// Admin: Reorder documentation blocks
export const reorderDocumentationBlocks = asyncHandler(async (req, res) => {
    const { blocks } = req.body; // Array of { blockId, order }

  if (!Array.isArray(blocks)) {
        throw new ApiError("Invalid data", 400, "Blocks must be an array");
    }

    // Update all blocks with new orders
    const updatePromises = blocks.map(({ blockId, order }) =>
        DocumentationBlock.findByIdAndUpdate(blockId, { order }, { new: true })
    );

    const updatedBlocks = await Promise.all(updatePromises);

    res.status(200).json(new ApiResponse(200, updatedBlocks, "Documentation blocks reordered successfully"));
});

// Admin: Toggle block active status
export const toggleBlockStatus = asyncHandler(async (req, res) => {
    const { blockId } = req.params;

    const block = await DocumentationBlock.findById(blockId);
    if (!block) {
        throw new ApiError("Block not found", 404, "Documentation block not found");
    }

    block.isActive = !block.isActive;
    await block.save();

    res.status(200).json(new ApiResponse(200, block, "Block status toggled successfully"));
});

// Admin: Bulk update documentation sections and blocks
export const bulkUpdateDocumentation = asyncHandler(async (req, res) => {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
        throw new ApiError("Invalid data", 400, "Sections must be an array");
    }

    try {
        // If updating a single section, only delete blocks from that section
        if (sections.length === 1) {
            const section = sections[0];
            if (section._id && section._id !== 'default_section') {
                // Delete only blocks from this specific section
                await DocumentationBlock.deleteMany({ sectionId: section._id });
            } else {
                // For default section or new sections, delete all blocks
                await DocumentationBlock.deleteMany({});
            }
        } else {
            // For multiple sections, delete all blocks
            await DocumentationBlock.deleteMany({});
        }

        // Create new blocks from sections
        const newBlocks = [];
        let globalOrder = 1;

        for (const section of sections) {
            if (section.blocks && Array.isArray(section.blocks)) {
                for (const block of section.blocks) {
                    // Ensure the block has all required fields
                    const blockData = {
                        order: globalOrder++,
                        type: block.type || 'rich_text',
                        content: {
                            html: block.content?.html || '',
                            text: block.content?.text || '',
                            title: block.content?.title || '',
                            description: block.content?.description || '',
                            items: Array.isArray(block.content?.items) ? block.content.items : [],
                            url: block.content?.url || '',
                            altText: block.content?.altText || '',
                            icon: block.content?.icon || '',
                            color: block.content?.color || 'blue'
                        },
                        style: {
                            fontSize: block.style?.fontSize || '16px',
                            fontFamily: block.style?.fontFamily || 'Inter',
                            color: block.style?.color || '#000000',
                            backgroundColor: block.style?.backgroundColor || 'transparent',
                            textAlign: block.style?.textAlign || 'left',
                            fontWeight: block.style?.fontWeight || 'normal',
                            fontStyle: block.style?.fontStyle || 'normal',
                            textDecoration: block.style?.textDecoration || 'none',
                            lineHeight: block.style?.lineHeight || '1.6',
                            letterSpacing: block.style?.letterSpacing || '0px',
                            padding: block.style?.padding || '20px',
                            margin: block.style?.margin || '0px',
                            border: block.style?.border || 'none',
                            borderRadius: block.style?.borderRadius || '8px',
                            boxShadow: block.style?.boxShadow || 'none',
                            width: block.style?.width || '100%',
                            height: block.style?.height || 'auto'
                        },
                        isActive: block.isActive !== undefined ? block.isActive : true,
                        sectionId: section._id || 'default_section',
                        sectionName: section.name || 'Default Section'
                    };

                    // Validate the block data before creating
                    const newBlock = new DocumentationBlock(blockData);
                    
                    // Validate the block (this will throw an error if validation fails)
                    await newBlock.validate();
                    
                    newBlocks.push(newBlock);
                }
            }
        }

        // Save all blocks
        if (newBlocks.length > 0) {
            await DocumentationBlock.insertMany(newBlocks);
        }

        res.status(200).json(new ApiResponse(200, { 
            message: "Documentation updated successfully",
            blocksCount: newBlocks.length,
            sectionsCount: sections.length
        }, "Documentation sections and blocks updated successfully"));

    } catch (error) {
        console.error('Error in bulk update:', error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            throw new ApiError("Validation failed", 400, "Documentation validation failed: " + error.message);
        } else if (error.code === 11000) {
            throw new ApiError("Duplicate order", 400, "Duplicate order numbers detected. Please ensure each block has a unique order.");
        } else {
            throw new ApiError("Update failed", 500, "Failed to update documentation: " + error.message);
        }
    }
});
