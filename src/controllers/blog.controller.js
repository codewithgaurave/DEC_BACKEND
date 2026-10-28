import mongoose from 'mongoose'
import Blog from '../models/Blog.model.js'
import { SEED_BLOGS } from '../data/seedBlogs.js'

/**
 * Generate a clean URL-friendly slug from title
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * @desc    Get All Blogs with Filter, Search & Pagination
 * @route   GET /api/blog
 * @access  Public
 */
export const getAllBlogs = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 100,
      sort = 'newest',
    } = req.query

    const filter = {}

    // Status Filter
    if (status && status.toLowerCase() !== 'all') {
      filter.status = new RegExp(`^${status.trim()}$`, 'i')
    } else if (!status) {
      filter.status = 'Published'
    }

    // Category Filter
    if (category && category !== 'All' && category !== 'all') {
      filter.category = new RegExp(category.trim(), 'i')
    }

    // Search Query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: regex },
        { leadExcerpt: regex },
        { content: regex },
        { 'author.name': regex },
        { tags: { $in: [regex] } },
      ]
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 20)
    const skip = (pageNum - 1) * limitNum

    // Sort
    let sortOptions = { order: 1, createdAt: -1 }
    if (sort === 'oldest') sortOptions = { createdAt: 1 }
    if (sort === 'popular') sortOptions = { viewsCount: -1 }
    if (sort === 'title') sortOptions = { title: 1 }

    const [total, items] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blogs retrieved successfully.',
      count: items.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: items,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Blog Statistics (Counts & Categories)
 * @route   GET /api/blog/stats
 * @access  Public
 */
export const getBlogStats = async (req, res, next) => {
  try {
    const [total, published, draft, archived, categoriesAgg] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'Published' }),
      Blog.countDocuments({ status: 'Draft' }),
      Blog.countDocuments({ status: 'Archived' }),
      Blog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blog statistics retrieved successfully.',
      data: {
        total,
        published,
        draft,
        archived,
        categories: categoriesAgg.map((c) => ({
          category: c._id || 'Uncategorized',
          count: c.count,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get Single Blog by Slug or ID
 * @route   GET /api/blog/:slugOrId
 * @access  Public
 */
export const getBlogBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params

    let blog = null

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      blog = await Blog.findByIdAndUpdate(
        slugOrId,
        { $inc: { viewsCount: 1 } },
        { new: true }
      )
    }

    if (!blog) {
      blog = await Blog.findOneAndUpdate(
        { slug: slugOrId.toLowerCase() },
        { $inc: { viewsCount: 1 } },
        { new: true }
      )
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Blog article not found for '${slugOrId}'`,
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blog article retrieved successfully.',
      data: blog,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create New Blog Post
 * @route   POST /api/blog
 * @access  Private (Admin)
 */
export const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      slug: customSlug,
      leadExcerpt,
      content,
      category,
      author,
      featuredImage,
      tableOfContents,
      contentSections,
      faqs,
      tags,
      status,
      readTime,
      metaTitle,
      metaDescription,
      order,
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Blog title is required.',
      })
    }

    let finalSlug = customSlug ? generateSlug(customSlug) : generateSlug(title)
    if (!finalSlug) finalSlug = `blog-${Date.now()}`

    // Check slug collision
    const existingSlug = await Blog.findOne({ slug: finalSlug })
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Math.round(Math.random() * 1e4)}`
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      leadExcerpt: leadExcerpt?.trim() || '',
      content: content || '',
      category: category?.trim() || 'Engineering & Infrastructure',
      author: {
        name: author?.name?.trim() || 'DEC Technical Advisory Board',
        role: author?.role?.trim() || 'MMUP Grade A & QCDD Certified Experts',
        avatar: author?.avatar?.trim() || '/logo.png',
      },
      featuredImage: featuredImage?.trim() || '/projects-gallery/01.jpg',
      tableOfContents: Array.isArray(tableOfContents) ? tableOfContents : [],
      contentSections: Array.isArray(contentSections) ? contentSections : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      status: status || 'Published',
      readTime: readTime || '5 min read',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      order: order !== undefined ? parseInt(order, 10) : 0,
      publishedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      viewsCount: 0,
    })

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Blog post created successfully.',
      data: newBlog,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update Existing Blog Post
 * @route   PUT /api/blog/:id
 * @access  Private (Admin)
 */
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid blog ID format.',
      })
    }

    const updateData = { ...req.body }

    // If slug is changed, check uniqueness
    if (updateData.slug) {
      updateData.slug = generateSlug(updateData.slug)
      const existing = await Blog.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      })
      if (existing) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `Slug '${updateData.slug}' is already taken by another article.`,
        })
      }
    }

    // Process tags
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Blog post not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blog post updated successfully.',
      data: updatedBlog,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Toggle Blog Publication Status
 * @route   PATCH /api/blog/:id/status
 * @access  Private (Admin)
 */
export const toggleBlogStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid blog ID format.',
      })
    }

    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Blog post not found.',
      })
    }

    const newStatus =
      status || (blog.status === 'Published' ? 'Draft' : 'Published')
    blog.status = newStatus
    await blog.save()

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Blog status updated to '${newStatus}'.`,
      data: blog,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete Blog Post
 * @route   DELETE /api/blog/:id
 * @access  Private (Admin)
 */
export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid blog ID format.',
      })
    }

    const deleted = await Blog.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Blog post not found.',
      })
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blog post deleted successfully.',
      data: { id: deleted._id, title: deleted.title },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Seed Initial Blogs
 * @route   POST /api/blog/seed
 * @access  Private (Admin)
 */
export const seedBlogs = async (req, res, next) => {
  try {
    await Blog.deleteMany({})
    const inserted = await Blog.insertMany(SEED_BLOGS)

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Successfully seeded ${inserted.length} blog articles.`,
      count: inserted.length,
      data: inserted,
    })
  } catch (error) {
    next(error)
  }
}
