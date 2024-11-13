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
  SpecificLawyerCourtroomController.newcase1
);

router.post(
  "/newcase1",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.newcase1
);

router.post(
  "/fileUpload",
  upload.single("file"),
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.newcase2
);

router.post(
  "/getoverview-formfilename",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getoverviewFormfilename
); 

router.post(
  "/api/case_summary",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.caseSummary
); //Not encrypted

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
); //Not encrypted
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
  "/api/summary",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.summary
); //Not encrypted

router.post(
  "/api/relevant_cases_judge_lawyer_updated",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.relevantCasesJudgeLawyer
);

router.post(
  "/api/setFavor",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.setFavor
); //Not encrypted

router.post(
  "/api/draft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.getDraft
);

// not encrypted
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

// encrypted
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
); //encrypted

//encrypted
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
// not encrypted

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
// not encrypted

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
);// //Not  encrypted


router.post(
  "/api/relevant_case_law_updated",
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
  "/api/print_case_details",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.printCaseDetails
);

router.post(
  "/api/edit_application",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.editApplication
);

router.post(
  "/api/sidebar-casesearch",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.sidebarCasesearch
);

router.post(
  "/api/draft_next_appeal",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.draftNextAppeal
);  //Not encrypted

router.post(
  "/api/pro_application",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.proApplication
);  //Not encrypted

router.post(
  "/api/edit_pro_application",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.editProApplication 
);// //Not encrypted

router.post(
  "/api/document_evidence",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.documentEvidence
); //Not encrypted

router.post(
  "/api/generate_hypo_draft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.generateHypoDraft
);//not encrypted

// chatbot

router.post(
  "/api/consultant",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  authMiddleware.checkSpecificLawyerCourtroomUserId,
  SpecificLawyerCourtroomController.consultant
); //Not encrypted

// AddContactUsQuery Route 

router.post(
  "/add/ContactUsQuery",
  SpecificLawyerCourtroomController.AddContactUsQuery
); //Not encrypted

//time storing

router.post(
  "/api/storeTime",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.storeTime
);

module.exports = router;
