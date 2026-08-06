const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const MemoBuilder = require("../models/memoBuilderModel");
const User = require("../models/userModel");
const {
  ScheduleEntry,
  TeamLeaderEntry,
} = require("../models/ScheduleAndAttendanceModel");

const VALID_STATUSES = ["draft", "published", "archived"];
const VALID_TARGET_TYPES = ["all", "group", "employee"];

const validateId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid memo ID");
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCanonicalGroups = async () => {
  const entries = await TeamLeaderEntry.find({}, "teamLeader").lean();
  const groupsByKey = new Map();

  entries.forEach((entry) => {
    const name = String(entry.teamLeader || "").trim();
    if (!name || name.toLowerCase() === "inactive") return;
    const key = name.toLocaleLowerCase();
    if (!groupsByKey.has(key)) groupsByKey.set(key, name);
  });

  return [...groupsByKey.values()].sort((first, second) =>
    first.localeCompare(second, undefined, { sensitivity: "base" }),
  );
};

const resolveTarget = async (body) => {
  const targetType = String(body.targetType || "all").toLowerCase();
  if (!VALID_TARGET_TYPES.includes(targetType)) {
    const error = new Error("Invalid memo target type");
    error.statusCode = 400;
    throw error;
  }

  if (targetType === "group") {
    const requestedGroup = String(body.targetGroup || "").trim();
    const groups = await getCanonicalGroups();
    const targetGroup = groups.find(
      (group) => group.toLowerCase() === requestedGroup.toLowerCase(),
    );
    if (!targetGroup) {
      const error = new Error("The selected group is invalid or no longer exists");
      error.statusCode = 400;
      throw error;
    }
    return { targetType, targetGroup, targetEmployee: null };
  }

  if (targetType === "employee") {
    const employeeId = String(body.targetEmployee || "");
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      const error = new Error("A valid target employee is required");
      error.statusCode = 400;
      throw error;
    }
    const employee = await User.findOne({
      _id: employeeId,
      isAdmin: false,
      status: { $ne: "inactive" },
    }).select("_id");
    if (!employee) {
      const error = new Error("The selected employee is invalid or inactive");
      error.statusCode = 400;
      throw error;
    }
    return { targetType, targetGroup: null, targetEmployee: employee._id };
  }

  return { targetType: "all", targetGroup: null, targetEmployee: null };
};

const resolveAudienceUserIds = async (target) => {
  if (target.targetType === "employee") return [target.targetEmployee];

  const userFilter = { isAdmin: false, status: { $ne: "inactive" } };
  if (target.targetType === "group") {
    const employeeIds = await ScheduleEntry.distinct("employeeId", {
      teamLeader: {
        $regex: `^${escapeRegex(target.targetGroup)}$`,
        $options: "i",
      },
    });
    userFilter._id = {
      $in: employeeIds.filter((id) => mongoose.Types.ObjectId.isValid(id)),
    };
  }

  const users = await User.find(userFilter).select("_id").lean();
  if (target.targetType === "group" && users.length === 0) {
    const error = new Error("The selected group has no active employees");
    error.statusCode = 400;
    throw error;
  }
  return users.map((user) => user._id);
};

const throwTargetError = (error, res) => {
  res.status(error.statusCode || 500);
  throw error;
};

const getMemos = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "all").toLowerCase();

  if (status !== "all" && !VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }

  const filter = {};
  if (status !== "all") filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["title", "subject", "content"].map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    }));
  }

  const canManage =
    req.user.isAdmin || ["TL", "TM"].includes(req.user.role);
  const requesterId = req.user._id.toString();
  if (!canManage) {
    filter.status = "published";
    filter.$and = [
      {
        $or: [
          { audienceUserIds: req.user._id },
          {
            audienceResolvedAt: null,
            $or: [
              { targetType: "all" },
              { targetType: { $exists: false } },
            ],
          },
        ],
      },
    ];
  }

  const [memos, total] = await Promise.all([
    MemoBuilder.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("targetEmployee", "name email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MemoBuilder.countDocuments(filter),
  ]);

  const visibleMemos = memos.map((memo) => ({
    ...memo,
    acknowledgedBy: canManage
      ? memo.acknowledgedBy || []
      : (memo.acknowledgedBy || []).filter(
          (entry) => String(entry.userId) === requesterId,
        ),
  }));

  res.json({
    data: visibleMemos,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

const getMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("targetEmployee", "name email");
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  const canManage =
    req.user.isAdmin || ["TL", "TM"].includes(req.user.role);
  const isLegacyAllEmployees =
    !memo.audienceResolvedAt && (!memo.targetType || memo.targetType === "all");
  const isTargeted = memo.audienceUserIds.some((userId) =>
    userId.equals(req.user._id),
  );
  if (!canManage && (memo.status !== "published" || (!isLegacyAllEmployees && !isTargeted))) {
    res.status(404);
    throw new Error("Memo not found");
  }
  res.json(memo);
});

const getTargetOptions = asyncHandler(async (_req, res) => {
  const [groups, employees, schedules] = await Promise.all([
    getCanonicalGroups(),
    User.find({ isAdmin: false, status: { $ne: "inactive" } }, "name email")
      .sort({ name: 1 })
      .lean(),
    ScheduleEntry.find({}, "employeeId teamLeader").lean(),
  ]);
  const groupByEmployeeId = new Map(
    schedules.map((entry) => [
      String(entry.employeeId),
      String(entry.teamLeader || "").trim() || null,
    ]),
  );

  res.json({
    groups,
    employees: employees.map((employee) => ({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      group: groupByEmployeeId.get(employee._id.toString()) || null,
    })),
  });
});

const createMemo = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const subject = String(req.body.subject || "").trim();
  const content = String(req.body.content || "").trim();
  const status = String(req.body.status || "draft").toLowerCase();
  if (!title || !subject || !content) {
    res.status(400);
    throw new Error("Title, subject, and content are required");
  }
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }

  let target;
  try {
    target = await resolveTarget(req.body);
  } catch (error) {
    throwTargetError(error, res);
  }

  let audienceUserIds = [];
  if (status === "published") {
    try {
      audienceUserIds = await resolveAudienceUserIds(target);
    } catch (error) {
      throwTargetError(error, res);
    }
  }

  const now = new Date();
  const memo = await MemoBuilder.create({
    title,
    subject,
    content,
    status,
    ...target,
    audienceUserIds,
    audienceResolvedAt: status === "published" ? now : null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    publishedAt: status === "published" ? now : null,
    archivedAt: status === "archived" ? now : null,
  });
  res.status(201).json(await memo.populate("createdBy updatedBy", "name email"));
});

const updateMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  ["title", "subject", "content"].forEach((field) => {
    if (req.body[field] !== undefined) memo[field] = String(req.body[field]).trim();
  });
  if (!memo.title || !memo.subject || !memo.content) {
    res.status(400);
    throw new Error("Title, subject, and content are required");
  }
  if (
    req.body.targetType !== undefined ||
    req.body.targetGroup !== undefined ||
    req.body.targetEmployee !== undefined
  ) {
    if (memo.status !== "draft") {
      res.status(409);
      throw new Error("Memo targeting can only be changed while the memo is a draft");
    }
    try {
      const target = await resolveTarget(req.body);
      memo.targetType = target.targetType;
      memo.targetGroup = target.targetGroup;
      memo.targetEmployee = target.targetEmployee;
    } catch (error) {
      throwTargetError(error, res);
    }
  }
  memo.updatedBy = req.user._id;
  await memo.save();
  res.json(await memo.populate("createdBy updatedBy", "name email"));
});

const updateMemoStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const status = String(req.body.status || "").toLowerCase();
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid memo status");
  }
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  if (status === "published") {
    try {
      const target = await resolveTarget({
        targetType: memo.targetType || "all",
        targetGroup: memo.targetGroup,
        targetEmployee: memo.targetEmployee,
      });
      memo.targetType = target.targetType;
      memo.targetGroup = target.targetGroup;
      memo.targetEmployee = target.targetEmployee;
      memo.audienceUserIds = await resolveAudienceUserIds(target);
      memo.audienceResolvedAt = new Date();
    } catch (error) {
      throwTargetError(error, res);
    }
  }
  memo.status = status;
  memo.updatedBy = req.user._id;
  if (status === "published" && !memo.publishedAt) memo.publishedAt = new Date();
  if (status === "archived") memo.archivedAt = new Date();
  if (status !== "archived") memo.archivedAt = null;
  if (status === "draft") {
    memo.audienceUserIds = [];
    memo.audienceResolvedAt = null;
  }
  await memo.save();
  res.json(await memo.populate("createdBy updatedBy", "name email"));
});

const deleteMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  await memo.deleteOne();
  res.json({ id: req.params.id, message: "Memo deleted successfully" });
});

const acknowledgeMemo = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const signature = String(req.body.signature || "");
  if (
    !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature) ||
    signature.length > 500000
  ) {
    res.status(400);
    throw new Error("A valid PNG employee signature is required");
  }
  const memo = await MemoBuilder.findById(req.params.id);
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }
  if (memo.status !== "published") {
    res.status(409);
    throw new Error("Only published memos can be acknowledged");
  }

  const userId = req.user._id.toString();
  const isLegacyAllEmployees =
    !memo.audienceResolvedAt && (!memo.targetType || memo.targetType === "all");
  const isTargeted = memo.audienceUserIds.some((targetedId) =>
    targetedId.equals(req.user._id),
  );
  if (!isLegacyAllEmployees && !isTargeted) {
    res.status(403);
    throw new Error("This memo is not assigned to you");
  }
  const existingAcknowledgement = memo.acknowledgedBy.some(
    (entry) => entry.userId === userId,
  );
  if (!existingAcknowledgement) {
    memo.acknowledgedBy.push({
      userId,
      name: req.user.name,
      email: req.user.email || "",
      signature,
      acknowledgedAt: new Date(),
    });
    await memo.save();
  }

  res.json({
    message: existingAcknowledgement
      ? "Memo already acknowledged"
      : "Memo acknowledged successfully",
    acknowledged: true,
    acknowledgedBy: memo.acknowledgedBy,
  });
});

const getMemoAcknowledgements = asyncHandler(async (req, res) => {
  validateId(req.params.id, res);
  const memo = await MemoBuilder.findById(req.params.id).lean();
  if (!memo) {
    res.status(404);
    throw new Error("Memo not found");
  }

  const audienceIdSet = memo.audienceResolvedAt
    ? new Set((memo.audienceUserIds || []).map((id) => String(id)))
    : null;
  const acknowledgements = (memo.acknowledgedBy || []).filter(
    (entry) => !audienceIdSet || audienceIdSet.has(String(entry.userId)),
  );
  const signedUserIds = acknowledgements.map((entry) => entry.userId);
  const eligibleBefore = memo.publishedAt || memo.createdAt;
  const unsignedUserFilter = memo.audienceResolvedAt
    ? { _id: { $in: memo.audienceUserIds || [], $nin: signedUserIds } }
    : {
        _id: { $nin: signedUserIds },
        isAdmin: false,
        status: { $ne: "inactive" },
        createdAt: { $lte: eligibleBefore },
      };
  const unsignedUsers = await User.find(
    unsignedUserFilter,
    "name email role",
  )
    .sort({ name: 1 })
    .lean();

  const signed = [...acknowledgements].sort(
    (first, second) =>
      new Date(second.acknowledgedAt).getTime() -
      new Date(first.acknowledgedAt).getTime(),
  );

  res.json({
    memoId: memo._id,
    signed,
    unsigned: unsignedUsers.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })),
    summary: {
      signed: signed.length,
      unsigned: unsignedUsers.length,
      total: signed.length + unsignedUsers.length,
    },
  });
});

module.exports = {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  updateMemoStatus,
  deleteMemo,
  acknowledgeMemo,
  getMemoAcknowledgements,
  getTargetOptions,
};
