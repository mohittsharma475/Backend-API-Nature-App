const getAllUsers = (req, res) => {
    res.send("Hello from getALL USERS")
};

const getUser = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

const createUser = (req, res) => {
    
    res.status(201).json({
        status:"success",
        data:{
            user: "Mohit"
        }
    })
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
};
