const express = require("express");
const { CourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", CourtroomController.bookCourtRoom);
router.post(
  "/adminLogin/book-courtroom",
  CourtroomController.adminLoginBookCourtRoom
);
router.post(
  "/book-courtroom-validation",
  CourtroomController.bookCourtRoomValidation
);
router.get("/book-courtroom", CourtroomController.getBookedData);
router.post("/login", CourtroomController.loginToCourtRoom);
router.post(
  "/admin-login-validation",
  CourtroomController.adminLoginValidation
);
router.post("/adminLogin/login", CourtroomController.AdminLoginToCourtRoom);
router.post(
  "/getCourtroomUser",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getUserDetails
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
  CourtroomController.newcase1
);

router.post(
  "/fileUpload",
  upload.single("file"),
  authMiddleware.checkCourtroomAuth,
  CourtroomController.newcase2
);

router.post(
  "/getoverview-formfilename",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getoverviewFormfilename
);

router.post(
  "/api/case_summary",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.caseSummary
);

router.post(
  "/api/new_case/text",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.newCaseText
);

router.post(
  "/edit_case",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.judge_arguemnt
);

router.post(
  "/api/summary",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.summary
);

router.post(
  "/api/relevant_cases_judge_lawyer_updated",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.relevantCasesJudgeLawyer
);

router.post(
  "/api/setFavor",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.setFavor
);

router.post(
  "/api/draft",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.restCase
);
router.post(
  "/api/end",
  // authMiddleware.checkCourtroomAuth,
  CourtroomController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",

  authMiddleware.checkCourtroomAuth,
  CourtroomController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",

  authMiddleware.checkCourtroomAuth,
  CourtroomController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,

  CourtroomController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkCourtroomAuth,

  CourtroomController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkCourtroomAuth,

  CourtroomController.getHistory
);

router.post(
  "/api/evidence",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.evidence
);

router.post(
  "/api/ask_query",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.askQuery
);

router.post(
  "/resetUserid",
  authMiddleware.checkCourtroomAuth,

  CourtroomController.resetUserId
);

router.post(
  "/api/relevant_case_law_updated",
  authMiddleware.checkCourtroomAuth,

  CourtroomController.relevantCaseLaw
);

router.post(
  "/api/testimony_questions",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.testimonyQuestions
);

router.post(
  "/api/application",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.application
);

router.post(
  "/api/case_search",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.caseSearch
);

router.post(
  "/api/view_document",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.viewDocument
);

router.post(
  "/api/print_case_details",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.printCaseDetails
);

router.post(
  "/api/edit_application",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.editApplication
);

router.post(
  "/api/sidebar-casesearch",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.sidebarCasesearch
);

router.post(
  "/api/draft_next_appeal",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.draftNextAppeal
);

router.post(
  "/api/pro_application",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.proApplication
);

router.post(
  "/api/edit_pro_application",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.editProApplication
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
  CourtroomController.documentEvidence
);

router.post(
  "/api/generate_hypo_draft",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.generateHypoDraft
);

// chatbot api

router.post(
  "/api/consultant",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.consultant
);

router.post("/verify-coupon", CourtroomController.verifyCoupon);

// AddContactUsQuery Route
router.post(
  "/api/feedback",
  // authMiddleware.checkCourtroomAuth,
  CourtroomController.Courtroomfeedback
);
router.post("/add/ContactUsQuery", CourtroomController.AddContactUsQuery);
router.post("/get_pdf", CourtroomController.getpdf);

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

// API endpoint
router.get("/random-arrays", (req, res) => {
  const { array1, array2 } = getRandomArrays();
  res.json({ array1, array2 });
});

module.exports = router;
