const express = require("express");
// const CourtroomPricingController = require("../../controllers/courtRoomPricing-controller");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");
const { CourtroomPricingController } = require("../../controllers");
const { verifyClientMiddleware } = require("../../middlewares/auth-middleware");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create-new-plan", CourtroomPricingController.createNewPlan);

router.get("/getAllPlans", CourtroomPricingController.getAllPlans);

router.post(
  "/book-courtroom",
  // verifyClientMiddleware,
  CourtroomPricingController.bookCourtRoom
);
router.post(
  "/adminLogin/book-courtroom",
  CourtroomPricingController.adminLoginBookCourtRoom
);
router.post(
  "/book-courtroom-validation",
  CourtroomPricingController.bookCourtRoomValidation // this
);
router.get("/book-courtroom", CourtroomPricingController.getBookedData);
router.post("/login", CourtroomPricingController.loginToCourtRoom); // this
router.post(
  "/admin-login-validation",
  CourtroomPricingController.adminLoginValidation
);
router.post(
  "/adminLogin/login",
  CourtroomPricingController.AdminLoginToCourtRoom
);
router.post(
  "/getCourtroomUser",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.getUserDetails // this
);

router.post(
  "/newcase",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.newcase1
);

router.post(
  "/fileUpload",
  upload.single("file"),
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.newcase2
);

router.post(
  "/getoverview-formfilename",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.getoverviewFormfilename
);

router.post(
  "/api/case_summary",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.caseSummary
);

router.post(
  "/api/new_case/text",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.newCaseText
);

router.post(
  "/edit_case",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.judge_arguemnt
);

router.post(
  "/api/summary",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.summary
);

router.post(
  "/api/relevant_cases_judge_lawyer_updated",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.relevantCasesJudgeLawyer
);

router.post(
  "/api/setFavor",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.setFavor
);

router.post(
  "/api/draft",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.restCase
);
router.post(
  "/api/end",
  // authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",

  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.getHistory
);

router.post(
  "/api/evidence",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.evidence
);

router.post(
  "/api/ask_query",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.askQuery
);

router.post(
  "/resetUserid",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.resetUserId
);

router.post(
  "/api/relevant_case_law_updated",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.relevantCaseLaw
);

router.post(
  "/api/testimony_questions",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.testimonyQuestions
);

router.post(
  "/api/application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.application
);

router.post(
  "/api/case_search",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.caseSearch
);

router.post(
  "/api/view_document",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.viewDocument
);

router.post(
  "/api/print_case_details",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.printCaseDetails
);

router.post(
  "/api/edit_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.editApplication
);

router.post(
  "/api/sidebar-casesearch",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.sidebarCasesearch
);

router.post(
  "/api/draft_next_appeal",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.draftNextAppeal
);

router.post(
  "/api/pro_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.proApplication
);

router.post(
  "/api/edit_pro_application",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
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
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.documentEvidence
);

router.post(
  "/api/generate_hypo_draft",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.generateHypoDraft
);

// chatbot api

router.post(
  "/api/consultant",
  authMiddleware.checkCourtroomAuth,
  authMiddleware.checkCourtroomPricingUserId,
  CourtroomPricingController.consultant
);

router.post("/verify-coupon", CourtroomPricingController.verifyCoupon);

// AddContactUsQuery Route
router.post(
  "/api/feedback",
  // authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.Courtroomfeedback
);
router.post(
  "/add/ContactUsQuery",
  CourtroomPricingController.AddContactUsQuery
);
router.post("/get_pdf", CourtroomPricingController.getpdf);

// dummy apis

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

// Reset Password

router.post(
  "/resetPassword-sendOtp",
  CourtroomPricingController.resetPasswordSendOtp
);

router.post(
  "/resetPassword-verifyOtp",
  CourtroomPricingController.resetPasswordVerifyOtp
);

router.post(
  "/resetPassword",
  authMiddleware.checkUserPasswordReset,
  CourtroomPricingController.resetPasswordResetPassword
);

// API endpoint
router.get("/random-arrays", (req, res) => {
  const { array1, array2 } = getRandomArrays();
  res.json({ array1, array2 });
});

//time storing

router.post(
  "/api/storeTime",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.storeTime // this
);

router.post("/addPlanUser", CourtroomPricingController.addPlanUser);

router.post(
  "/book/courtroomSlot",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.BookCourtroomSlot
);

router.patch(
  "/delete/courtroomSlot",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.DeleteCourtroomSlot
);

router.get(
  "/enterCourtroom",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.enterCourtroom
);

module.exports = router;
