const express = require("express");
// const CourtroomPricingController = require("../../controllers/courtRoomPricing-controller");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");
const {
  CourtroomPricingController,
  CourtroomFreeController,
} = require("../../controllers");

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
router.post("/login", CourtroomFreeController.loginToCourtRoom);
router.post(
  "/admin-login-validation",
  CourtroomFreeController.adminLoginValidation
);
router.post("/adminLogin/login", CourtroomFreeController.AdminLoginToCourtRoom);
router.post(
  "/getCourtroomUser",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.getUserDetails
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
  CourtroomFreeController.newcase1
);

router.post(
  "/fileUpload",
  upload.single("file"),
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.newcase2
);

router.post(
  "/getoverview-formfilename",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.getoverviewFormfilename
);

router.post(
  "/api/case_summary",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.caseSummary
);

router.post(
  "/api/new_case/text",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.newCaseText
);

router.post(
  "/edit_case",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.judge_arguemnt
);

router.post(
  "/api/summary",
  authMiddleware.checkFreeUserControllerApi,
  CourtroomFreeController.summary
);

router.post(
  "/api/relevant_cases_judge_lawyer_updated",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.relevantCasesJudgeLawyer
);

router.post(
  "/api/setFavor",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.setFavor
);

router.post(
  "/api/draft",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkCourtroomAuth,
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
  CourtroomPricingController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",

  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",

  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,

  CourtroomPricingController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkCourtroomAuth,

  CourtroomPricingController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkCourtroomAuth,

  CourtroomPricingController.getHistory
);

router.post(
  "/api/evidence",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.evidence
);

router.post(
  "/api/ask_query",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.askQuery
);

router.post(
  "/resetUserid",
  authMiddleware.checkCourtroomAuth,

  CourtroomPricingController.resetUserId
);

router.post(
  "/api/relevant_case_law_updated",
  authMiddleware.checkCourtroomAuth,

  CourtroomPricingController.relevantCaseLaw
);

router.post(
  "/api/testimony_questions",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.testimonyQuestions
);

router.post(
  "/api/application",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.application
);

router.post(
  "/api/case_search",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.caseSearch
);

router.post(
  "/api/view_document",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.viewDocument
);

router.post(
  "/api/print_case_details",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.printCaseDetails
);

router.post(
  "/api/edit_application",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.editApplication
);

router.post(
  "/api/sidebar-casesearch",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.sidebarCasesearch
);

router.post(
  "/api/draft_next_appeal",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.draftNextAppeal
);

router.post(
  "/api/pro_application",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.proApplication
);

router.post(
  "/api/edit_pro_application",
  authMiddleware.checkCourtroomAuth,
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
  CourtroomPricingController.documentEvidence
);

router.post(
  "/api/generate_hypo_draft",
  authMiddleware.checkCourtroomAuth,
  CourtroomPricingController.generateHypoDraft
);

// chatbot api

router.post(
  "/api/consultant",
  authMiddleware.checkCourtroomAuth,
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

module.exports = router;
