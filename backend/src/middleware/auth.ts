import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(403).json({ error: 'No token provided' })
  }

  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || 'secret-key')
    ;(req as any).user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
