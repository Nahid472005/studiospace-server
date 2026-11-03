import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export async function getAllStudios(req, res) {
  try {
    const db = getDB();
    const { category, search, sort, limit, featured } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All' && category !== 'all') {
      // Case-insensitive regex match or exact match
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Filter by Featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Keyword Search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { overview: searchRegex },
        { amenities: { $in: [searchRegex] } }
      ];
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { hourlyRate: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { hourlyRate: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    let cursor = db.collection('studios').find(query).sort(sortOptions);

    if (limit) {
      cursor = cursor.limit(parseInt(limit, 10));
    }

    const studios = await cursor.toArray();

    return res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    console.error('Get all studios error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch studio spaces.' });
  }
}

export async function getStudioById(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Studio ID format.' });
    }

    const db = getDB();
    const studio = await db.collection('studios').findOne({ _id: new ObjectId(id) });

    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio workspace not found.' });
    }

    return res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    console.error('Get studio by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve studio details.' });
  }
}

export async function createStudio(req, res) {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      images,
      image,
      amenities,
      overview
    } = req.body;

    if (!title || !category || !hourlyRate || !location || !overview) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Title, Category, Hourly Rate, Location, and Overview are mandatory.'
      });
    }

    const db = getDB();

    // Prepare images array
    let imageList = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.filter(Boolean);
    } else if (image && typeof image === 'string') {
      imageList = [image];
    } else {
      imageList = ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'];
    }

    // Format amenities
    let amenitiesList = [];
    if (Array.isArray(amenities)) {
      amenitiesList = amenities;
    } else if (typeof amenities === 'string') {
      amenitiesList = amenities.split(',').map(a => a.trim()).filter(Boolean);
    }

    const newStudio = {
      title: title.trim(),
      category: category.trim(),
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit || 0),
      maxCapacity: Number(maxCapacity || 10),
      location: location.trim(),
      image: imageList[0],
      images: imageList,
      amenities: amenitiesList,
      overview: overview.trim(),
      hostName: req.user.name || 'Studio Host',
      hostEmail: req.user.email.toLowerCase(),
      hostAvatar: req.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name)}`,
      rating: 4.9,
      reviewsCount: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('studios').insertOne(newStudio);

    return res.status(201).json({
      success: true,
      message: 'Creative studio listed successfully!',
      studioId: result.insertedId,
      studio: { ...newStudio, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create studio error:', error);
    return res.status(500).json({ success: false, message: 'Server error while publishing new studio.' });
  }
}

export async function updateStudio(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Studio ID format.' });
    }

    const db = getDB();
    const existing = await db.collection('studios').findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Studio listing not found.' });
    }

    // Verify ownership
    if (existing.hostEmail !== req.user.email.toLowerCase() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own studio listings.' });
    }

    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      images,
      image,
      amenities,
      overview
    } = req.body;

    const updateFields = {
      updatedAt: new Date()
    };

    if (title) updateFields.title = title.trim();
    if (category) updateFields.category = category.trim();
    if (hourlyRate !== undefined) updateFields.hourlyRate = Number(hourlyRate);
    if (securityDeposit !== undefined) updateFields.securityDeposit = Number(securityDeposit);
    if (maxCapacity !== undefined) updateFields.maxCapacity = Number(maxCapacity);
    if (location) updateFields.location = location.trim();
    if (overview) updateFields.overview = overview.trim();

    if (Array.isArray(images) && images.length > 0) {
      updateFields.images = images;
      updateFields.image = images[0];
    } else if (image) {
      updateFields.image = image;
      updateFields.images = [image];
    }

    if (Array.isArray(amenities)) {
      updateFields.amenities = amenities;
    } else if (typeof amenities === 'string') {
      updateFields.amenities = amenities.split(',').map(a => a.trim()).filter(Boolean);
    }

    await db.collection('studios').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const updatedStudio = await db.collection('studios').findOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'Studio listing updated successfully!',
      studio: updatedStudio
    });
  } catch (error) {
    console.error('Update studio error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating studio.' });
  }
}

export async function deleteStudio(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Studio ID format.' });
    }

    const db = getDB();
    const existing = await db.collection('studios').findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Studio listing not found.' });
    }

    // Ownership check
    if (existing.hostEmail !== req.user.email.toLowerCase() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own listings.' });
    }

    await db.collection('studios').deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'Studio listing has been permanently removed.'
    });
  } catch (error) {
    console.error('Delete studio error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting studio.' });
  }
}

export async function getUserStudios(req, res) {
  try {
    const email = (req.params.email || req.user.email).toLowerCase();
    const db = getDB();

    const studios = await db.collection('studios')
      .find({ hostEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    console.error('Get user studios error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch your studio listings.' });
  }
}
