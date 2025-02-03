const mongoose = require("mongoose");

const courtroomPlanFeaturesSchema = new mongoose.Schema({
  AiLawyer: {
    type: Boolean,
    required: true,
  },
  AiJudge: {
    type: Boolean,
    required: true,
  },
  AiAssistant: {
    type: Boolean,
    required: true,
  },
  AiDrafterNormal: {
    type: Boolean,
    required: true,
  },
  AiDrafterPro: {
    type: Boolean,
    required: true,
  },
  FirstDraft: {
    type: Boolean,
    required: true,
  },
  Verdict: {
    type: Boolean,
    required: true,
  },
  RelevantCaseLaws: {
    type: Boolean,
    required: true,
  },
  Evidences: {
    type: Boolean,
    required: true,
  },
  LegalGPT: {
    type: Boolean,
    required: true,
  },
  caseSearch: {
    type: Boolean,
    required: true,
  },
  testimonyAssessment: {
    type: Boolean,
    required: true,
  },
});

const courtroomPlanSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  duration: {
    type: String,
    required: true,
    enum: ["Daily", "Monthly", "LifeTime"],
  },
  totalTime: { type: Number, required: true },
  features: courtroomPlanFeaturesSchema,
});

const courtroomPlan = mongoose.model("courtroomPlan", courtroomPlanSchema);

module.exports = courtroomPlan;
