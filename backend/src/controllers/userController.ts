import { Request, Response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
}

// Mock data store (replace with database in production)
let users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
let nextUserId = 3;

// Get all users
export const getAllUsers = (req: Request, res: Response): void => {
  res.json({ success: true, data: users });
};

// Get user by ID
export const getUserById = (req: Request, res: Response): void => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
};

// Create new user
export const createUser = (req: Request, res: Response): void => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ success: false, error: 'Name and email are required' });
    return;
  }
  
  const newUser: User = {
    id: nextUserId++,
    name,
    email
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
};

// Update user
export const updateUser = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  
  // Only allow updating name and email fields
  const { name, email } = req.body;
  if (name !== undefined) users[userIndex].name = name;
  if (email !== undefined) users[userIndex].email = email;
  
  res.json({ success: true, data: users[userIndex] });
};

// Delete user
export const deleteUser = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  
  users.splice(userIndex, 1);
  res.json({ success: true, message: 'User deleted successfully' });
};
