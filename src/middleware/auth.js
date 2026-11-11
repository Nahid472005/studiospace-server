import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'studiospace_super_secure_jwt_secret_key_2026_xyz';

export function authenticateUser(req, res, next) {
  const token = req.cookies?.studiospace_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Access denied. No valid authentication token provided in HTTPOnly cookie or header.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session expired or invalid authentication token.'
    });
  }
}
