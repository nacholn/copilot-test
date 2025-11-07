// Mock data store (replace with database in production)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
let nextUserId = 3;

// Get all users
const getAllUsers = (req, res) => {
  res.json({ success: true, data: users });
};

// Get user by ID
const getUserById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
};

// Create new user
const createUser = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }
  
  const newUser = {
    id: nextUserId++,
    name,
    email
  };
  
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
};

// Update user
const updateUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  users[userIndex] = { ...users[userIndex], ...req.body, id: userId };
  res.json({ success: true, data: users[userIndex] });
};

// Delete user
const deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ success: true, message: 'User deleted successfully' });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
