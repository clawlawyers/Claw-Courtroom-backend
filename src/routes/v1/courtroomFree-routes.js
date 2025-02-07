const express = require("express");
// const CourtroomPricingController = require("../../controllers/courtRoomPricing-controller");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");
const {
  CourtroomPricingController,
  CourtroomFreeController,
} = require("../../controllers");
const CourtroomFreeUser = require("../../models/courtroomFreeUser");
const CourtroomHistory = require("../../models/courtroomFreeHistory");
const { verifyClientMiddleware } = require("../../middlewares/auth-middleware");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", CourtroomPricingController.bookCourtRoom);
router.post(
  "/adminLogin/book-courtroom",
  CourtroomPricingController.adminLoginBookCourtRoom
);
router.post(
  "/book-courtroom-validation",
  CourtroomPricingController.bookCourtRoomValidation
);
router.get("/book-courtroom", CourtroomPricingController.getBookedData);
router.post(
  "/login",
  verifyClientMiddleware,
  CourtroomFreeController.loginToCourtRoom
);
router.post(
  "/admin-login-validation",
  CourtroomFreeController.adminLoginValidation
);
router.post("/adminLogin/login", CourtroomFreeController.AdminLoginToCourtRoom);
router.post(
  "/getCourtroomUser",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.getUserDetails
);

router.post(
  "/newcase",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.newcase1
);

router.post(
  "/fileUpload",
  upload.single("file"),
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.newcase2
);

router.post(
  "/getoverview-formfilename",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.getoverviewFormfilename
);

router.post(
  "/api/case_summary",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.caseSummary
);

router.post(
  "/api/new_case/text",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.newCaseText
);

router.post(
  "/edit_case",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.judge_arguemnt
);

router.post(
  "/api/summary",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.summary
);

router.post(
  "/api/relevant_cases_judge_lawyer_updated",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.relevantCasesJudgeLawyer
);

router.post(
  "/api/setFavor",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.setFavor
);

router.post(
  "/api/draft",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.restCase
);
router.post(
  "/api/end",
  // authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkFreeUserControllerApi,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.getHistory
);

router.post(
  "/api/evidence",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.evidence
);

router.post(
  "/api/ask_query",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.askQuery
);

router.post(
  "/resetUserid",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.resetUserId
);

router.post(
  "/api/relevant_case_law_updated",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.relevantCaseLaw
);

router.post(
  "/api/testimony_questions",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.testimonyQuestions
);

router.post(
  "/api/application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.application
);

router.post(
  "/api/case_search",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.caseSearch
);

router.post(
  "/api/view_document",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.viewDocument
);

router.post(
  "/api/print_case_details",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.printCaseDetails
);

router.post(
  "/api/edit_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.editApplication
);

router.post(
  "/api/sidebar-casesearch",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.sidebarCasesearch
);

router.post(
  "/api/draft_next_appeal",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.draftNextAppeal
);

router.post(
  "/api/pro_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.proApplication
);

router.post(
  "/api/edit_pro_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.editProApplication
);

router.post(
  "/api/document_evidence",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.documentEvidence
);

router.post(
  "/api/generate_hypo_draft",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.generateHypoDraft
);

// chatbot api

router.post(
  "/api/consultant",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomFreeUserId,
  CourtroomPricingController.consultant
);

router.post("/verify-coupon", CourtroomPricingController.verifyCoupon);

// AddContactUsQuery Route
router.post(
  "/api/feedback",
  // authMiddleware.checkFreeUserControllerApi,
  // authMiddleware.checkCourtroomFreeUserId,
  CourtroomFreeController.Courtroomfeedback
);
router.post(
  "/add/ContactUsQuery",
  CourtroomPricingController.AddContactUsQuery
);
router.post("/get_pdf", CourtroomPricingController.getpdf);

// dummy apis

router.get("/getAllusers", CourtroomFreeController.getAllusers);
router.delete("/getAllusers", CourtroomFreeController.deleteallusers);

// Function to generate the two arrays with unique random numbers
function getRandomArrays() {
  const min = 9;
  const max = 21;
  const array1Length = 3;
  const array2Length = 2;
  const numbers = new Set();

  // Generate unique random numbers
  while (numbers.size < array1Length + array2Length) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }

  // Split into two arrays
  const numArray = Array.from(numbers);
  const array1 = numArray.slice(0, array1Length);
  const array2 = numArray.slice(array1Length);

  return { array1, array2 };
}

// API endpoint
router.get("/random-arrays", (req, res) => {
  const { array1, array2 } = getRandomArrays();
  res.json({ array1, array2 });
});

router.post(
  "updateTime",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.updateTime
);

router.post("/updateUser", async (req, res) => {
  const user = await CourtroomFreeUser.findOneAndUpdate(
    { phoneNumber: "8603805697" },
    { todaysSlot: new Date("2024-11-21T10:00:00.000Z") }
  );
  return res.send(user);
});
router.get("/getHistroy", async (req, res) => {
  const user = await CourtroomHistory.find({});
  return res.send(user);
});

module.exports = router;
