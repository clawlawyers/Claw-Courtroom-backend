const prisma = require("../config/prisma-client");
const CourtroomUserPlan = require("../models/courtroomUserPlan");

// Create a function that deletes expired plans
async function deleteExpiredPlans() {
  try {
    // Find and delete documents where endData is in the past
    const result = await CourtroomUserPlan.deleteMany({
      endData: { $lt: new Date() }, // endData should be less than the current date and time
    });

    console.log(`${result.deletedCount} expired plans were deleted.`);
  } catch (err) {
    console.error("Error deleting expired plans:", err);
  }
}

module.exports = {
  deleteExpiredPlans,
};
