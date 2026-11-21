import { Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/AppError';
import errorMiddleware from './error.middleware';

describe('errorMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      requestId: 'test-request-id-123',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('handles AppError with correct status and message', () => {
    const err = new AppError('Custom error', 409);
    errorMiddleware(err, mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error',
    });
  });

  it('handles ZodError with 400 and first issue message', () => {
    const zodErr = new ZodError([
      { code: 'invalid_type', expected: 'string', received: 'number', path: ['field'], message: 'Expected string' } as any,
    ]);
    errorMiddleware(zodErr, mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Expected string',
    });
  });

  it('returns generic message for unexpected errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const err = new Error('Sensitive internal error');
    errorMiddleware(err, mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error (requestId: test-request-id-123)',
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  it('returns detailed message for unexpected errors in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const err = new Error('Sensitive internal error');
    errorMiddleware(err, mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Sensitive internal error',
    });
    
    process.env.NODE_ENV = originalEnv;
  });
});