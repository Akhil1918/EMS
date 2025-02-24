// Add to event validation middleware
const validateEventInput = (req, res, next) => {
  const { capacity, image } = req.body;
  
  if (capacity && (typeof capacity !== 'number' || capacity < 1)) {
    return res.status(400).json({ 
      success: false,
      message: 'Capacity must be a number greater than 0' 
    });
  }

  if (image && !image.startsWith('data:image/')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image format. Use base64 encoded image'
    });
  }
  
  next();
}; 