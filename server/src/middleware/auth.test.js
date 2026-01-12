import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { generateToken, verifyToken, authorize } from './auth.js'

// Mock JWT secret for testing
const JWT_SECRET = 'candiez-ca-super-secret-key-change-in-production'

describe('Auth Middleware', () => {
  describe('generateToken', () => {
    it('generates a valid JWT token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        firstName: 'Test',
        lastName: 'User',
      }

      const token = generateToken(user)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('includes user data in token payload', () => {
      const user = {
        id: 42,
        email: 'budtender@candiez.com',
        role: 'budtender',
        firstName: 'John',
        lastName: 'Doe',
      }

      const token = generateToken(user)
      const decoded = jwt.verify(token, JWT_SECRET)

      expect(decoded.id).toBe(42)
      expect(decoded.email).toBe('budtender@candiez.com')
      expect(decoded.role).toBe('budtender')
      expect(decoded.firstName).toBe('John')
      expect(decoded.lastName).toBe('Doe')
    })

    it('sets token expiration', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        firstName: 'Test',
        lastName: 'User',
      }

      const token = generateToken(user)
      const decoded = jwt.verify(token, JWT_SECRET)

      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()
      // Token should expire after iat (issued at)
      expect(decoded.exp).toBeGreaterThan(decoded.iat)
    })
  })

  describe('verifyToken', () => {
    it('returns decoded payload for valid token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'manager',
        firstName: 'Test',
        lastName: 'User',
      }

      const token = generateToken(user)
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded.id).toBe(1)
      expect(decoded.email).toBe('test@example.com')
      expect(decoded.role).toBe('manager')
    })

    it('returns null for invalid token', () => {
      const result = verifyToken('invalid.token.here')
      expect(result).toBeNull()
    })

    it('returns null for expired token', () => {
      // Create an expired token manually
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      )

      const result = verifyToken(expiredToken)
      expect(result).toBeNull()
    })

    it('returns null for malformed token', () => {
      expect(verifyToken('')).toBeNull()
      expect(verifyToken('not-a-jwt')).toBeNull()
      expect(verifyToken(null)).toBeNull()
    })
  })

  describe('authorize', () => {
    let mockReq, mockRes, mockNext

    beforeEach(() => {
      mockReq = { user: null }
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      }
      mockNext = vi.fn()
    })

    it('calls next() when user has allowed role', () => {
      mockReq.user = { id: 1, role: 'admin' }

      const middleware = authorize('admin', 'manager')
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('returns 401 when user is not authenticated', () => {
      mockReq.user = null

      const middleware = authorize('admin')
      middleware(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('returns 403 when user lacks required role', () => {
      mockReq.user = { id: 1, role: 'budtender' }

      const middleware = authorize('admin', 'manager')
      middleware(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied',
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('allows multiple roles', () => {
      mockReq.user = { id: 1, role: 'manager' }

      const middleware = authorize('admin', 'manager', 'budtender')
      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })
})
