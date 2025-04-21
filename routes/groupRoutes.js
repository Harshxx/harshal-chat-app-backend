const express = require("express");
const Group = require("../models/groupModel");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const groupRouter = express.Router();

//create a new group
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    //check if group already exists
    const groupExists = await Group.findOne({ name });
    if (groupExists) {
      return res.status(401).json({ message: "Group already exists" });
    }
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(201).json({ populatedGroup });
  } catch (err) {
    res.status(400).json({ message: `Group create error : ${err.message}` });
  }
});

//get all routes
groupRouter.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email");
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: `Group get error : ${error.message}` });
  }
});

//join group
groupRouter.post("/:groupId/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "User already in group" });
    }
    group.members.push(req.user._id);
    await group.save();
    res.json({ message: "User successfully joined group" });
  } catch (error) {
    res.status(400).json({ message: `Group join error : ${error.message}` });
  }
});

//leave group
groupRouter.post("/:groupId/leave", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "User not in group" });
    }
    group.members = group.members.filter(
      (member) => !member.equals(req.user._id)
    );
    await group.save();
    res.json({ message: "User successfully left group" });
  } catch (error) {
    res.status(400).json({ message: `Group leave error : ${error.message}` });
  }
});
module.exports = groupRouter;
