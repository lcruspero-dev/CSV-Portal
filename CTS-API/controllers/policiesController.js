import User from "../models/userModel";
import mongoose from "mongoose";

import Policies from "../models/policiesModel";

export const getAllPolicies = async (_req, res) => {
  try {
    const user = await User.findById(_req.user._id);

    let policies;
    if (user.isAdmin) {
      policies = await Policies.find().sort({
        createdAt: -1,
      });
    } else {
      policies = await Policies.find({
        $or: [
          {
            isPinned: true,
          },
          {
            $or: [{ isPinned: false }, { isPinned: { $exists: false } }],
            createdAt: { $gte: user.createdAt },
          },
        ],
      }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: "Fetch policies",
      policies,
    });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({
      success: false,
      message: "Policies not found",
    });
  }
};

export const createPolicies = async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      throw new Error("Please add all required fields");
    }

    const policies = await Policies.create(req.body);
    res.status(200).json(policies);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePolicies = async (req, res) => {

  try {
    const policies = await Policies.findById(req.params.id);

  if (!policies) {
    return res.status(404).json({
      success: false,
      message: "Policy not found",
    });
  }

  const { subject, description } = req.body;
  
  if (!subject || !description) {
    return res.status(400).json({
      success: false,
      message: "Please add all required fields",
    });
  }

  const updatedPolicies = await Policies.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Successfully update policies",
    updatedPolicies
  });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

};

export const deletePolicies = async (req, res) => {
 
  try {
  const policies = await Policies.findById(req.params.id);

  if (!policies) {
    return res.status(404).json({
      success: false,
      message: "Policy not found"
    });
  }

  await policies.remove();

  res.status(200).json({
    success: true,
    message: "Delete policy",
    id: req.params.id,
  });   

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
    
  }
};

export const getPoliciesById = async (req, res) => {
  
  try {
    
  const policies = await Policies.findById(req.params.id);

  if (!policies) {
    res.status(404);
    throw new Error("Policy not found");
  }

  res.status(200).json({
    success: true,
    message: "Fetch policy by ID",
    policies
  });  

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const updateAcknowledged = async (req, res) => {
  const userId = req.user.id;
  const name = req.user.name;
  const { id } = req.params;

  const policies = await Policies.findById(id);
  if (!policies) {
    res.status(404);
    throw new Error("Policy not found");
  }

  const alreadyAcknowledged = policies.acknowledgedby.some(
    (acknowledged) => acknowledged.userId === userId,
  );

  if (alreadyAcknowledged) {
    res.status(400);
    throw new Error("You already acknowledged this policy");
  }

  const newAcknowledgment = {
    name,
    userId,
    acknowledgedAt: new Date(),
  };

  const updatedPolicy = await Policies.findByIdAndUpdate(
    id,
    {
      $push: { acknowledgedby: newAcknowledgment },
    },
    { new: true },
  );

  res.status(200).json(updatedPolicy);
};

export const getUserUnacknowledged = async (req, res) => {
  try {
    // The parameter name might be different. Try using req.params.id instead
    const policyId = req.params.policyId;

    console.log("Received policy ID:", policyId, "from params:", req.params);

    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      console.log("Invalid ObjectId:", policyId);
      return res.status(400).json({ message: "Invalid policy ID" });
    }

    const policies = await Policies.findById(policyId);
    if (!policies) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const acknowledgedUserIds = policies.acknowledgedby.map(
      (ack) => ack.userId,
    );
    const unacknowledgedUsers = await User.find(
      {
        _id: { $nin: acknowledgedUserIds },
        status: { $ne: "inactive" },
        createdAt: { $lte: policies.createdAt },
      },
      "name _id",
    );

    return res.status(200).json({
      policyId,
      unacknowledgedUsers: unacknowledgedUsers.map((user) => ({
        userId: user._id,
        name: user.name,
      })),
    });
  } catch (error) {
    console.error("Error in getUserUnacknowledged:", error);
    return res.status(500).json({ message: error.message });
  }
};
