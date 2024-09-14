const express = require("express");
const { SpecificLawyerCourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", SpecificLawyerCourtroomController.bookCourtRoom);

router.post(
  "/book-courtroom-validation",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.bookCourtRoomValidation
);

// router.get("/book-courtroom", SpecificLawyerCourtroomController.getBookedData);

router.post("/login", SpecificLawyerCourtroomController.loginToCourtRoom);

router.post(
  "/getCourtroomUser",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getUserDetails
);

router.post(
  "/getusername",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getusername
);

router.post(
  "/newcase",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.newcase
);

router.post(
  "/api/new_case/text",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.newCaseText
);

router.post(
  "/edit_case",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.judge_arguemnt
);

router.post(
  "/api/relevant_cases_judge_lawyer",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.relevantCasesJudgeLawyer
);

router.post(
  "/api/draft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,

  SpecificLawyerCourtroomController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,

  SpecificLawyerCourtroomController.restCase
);
router.post(
  "/api/end",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,

  SpecificLawyerCourtroomController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,

  SpecificLawyerCourtroomController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getHistory
);

router.post(
  "/api/evidence",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.evidence
);

router.post(
  "/api/ask_query",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.askQuery
);

router.post(
  "/resetUserid",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.resetUserId
);

router.post(
  "/api/relevant_case_law",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.relevantCaseLaw
);

router.post(
  "/api/testimony_questions",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.testimonyQuestions
);

router.post(
  "/api/application",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.application
);

router.post(
  "/api/case_search",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.caseSearch
);

router.post(
  "/api/view_document",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.viewDocument
);

router.post(
  "/api/edit_application",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.editApplication
);

// AddContactUsQuery Route

router.post(
  "/add/ContactUsQuery",
  SpecificLawyerCourtroomController.AddContactUsQuery
);

//time storing

router.post(
  "/api/storeTime",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.storeTime
);

module.exports = router;
