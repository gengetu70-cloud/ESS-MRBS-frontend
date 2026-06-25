const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

// All user routes require authentication and admin authorization
router.use(protect);
router.use(authorize("admin"));

router.route("/")
  .get(getUsers)
  .post(createUser);

router.get("/stats", getUserStats);

router.route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;