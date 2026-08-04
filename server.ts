import express from "express";
import path from "path";
import cors from "cors";
import crypto from "crypto";
import { Firestore, FieldValue } from "@google-cloud/firestore";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";
import * as gemini from "./server/gemini.js";

const require = createRequire(import.meta.url);
const firebaseConfig = require("./firebase-applet-config.json");

const adminDb = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get("/api/sample-voice", (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'sample_interviewer_voice.mp3');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
  });

  // API routes
  app.post("/api/gemini/score-resume", async (req, res) => {
    try {
      const { resumeInput } = req.body;
      const result = await gemini.analyzeResume(resumeInput);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/architect-resume", async (req, res) => {
    try {
      const { resumeInput, improvements, auditFindings, targetCompany, targetCountry, visaStatus, visaValidTill } = req.body;
      const result = await gemini.generateFormattedResume(resumeInput, improvements, auditFindings, targetCompany, targetCountry, visaStatus, visaValidTill);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/career-strategy", async (req, res) => {
    try {
      const { role, inputs, symbol, resumeData } = req.body;
      const result = await gemini.generateCareerStrategy(role, inputs, symbol, resumeData);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/market-intelligence", async (req, res) => {
    try {
      const { role, location, symbol, resumeData } = req.body;
      const result = await gemini.generateMarketIntelligence(role, location, symbol, resumeData);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/career-paths", async (req, res) => {
    try {
      const { scores, location, userType, resumeData, currentCompensation } = req.body;
      const result = await gemini.predictCareerPaths(scores, location, userType, resumeData, currentCompensation);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/outreach", async (req, res) => {
    try {
      const { inputs, screenshotData } = req.body;
      const result = await gemini.getOutreachMessage(inputs, screenshotData);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/interview-question", async (req, res) => {
    try {
      const { inputs, jdData, historySummary, lastTwoExchanges, questionCount } = req.body;
      console.log("DEBUG /api/gemini/interview-question payload:", { inputs, jdData, historySummary, lastTwoExchanges, questionCount });
      const result = await gemini.getInterviewQuestion(inputs, jdData, historySummary, lastTwoExchanges, questionCount);
      res.json(result);
    } catch (e: any) {
      console.error("ERROR /api/gemini/interview-question:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/audit-interview", async (req, res) => {
    try {
      const { transcript, inputs } = req.body;
      const result = await gemini.auditFullInterview(transcript, inputs);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/worth-questionnaire", async (req, res) => {
    try {
      const { inputs, jdData } = req.body;
      const result = await gemini.getWorthinessQuestionnaire(inputs, jdData);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/worth-review", async (req, res) => {
    try {
      const { inputs, painPoints, answers } = req.body;
      const result = await gemini.generatePersonalizedWorthinessReview(inputs, painPoints, answers);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/tts", async (req, res) => {
    try {
      const { text, isIndia, location, accent } = req.body;
      const result = await gemini.generateTTS(text, isIndia, location, accent);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/parse-resume", async (req, res) => {
    try {
      const { data, mimeType, text } = req.body;
      const result = await gemini.parseResumeDetails(data, mimeType, text);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const result = await gemini.getChatResponse(messages, systemInstruction);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/gemini/visual-analysis", async (req, res) => {
    try {
      const { base64 } = req.body;
      const result = await gemini.analyzeVisualVibe(base64);
      res.json({ text: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Razorpay Webhook Route: Credits user only after successful payment from Razorpay link
  const handleRazorpayWebhook = async (req: express.Request, res: express.Response) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"] as string;

      // Validate signature if secret is configured
      if (webhookSecret && signature) {
        const payloadStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(payloadStr)
          .digest("hex");

        if (signature !== expectedSignature) {
          console.warn("[RAZORPAY WEBHOOK] Invalid webhook signature.");
          return res.status(400).json({ error: "Invalid signature" });
        }
      }

      const body = req.body || {};
      const event = body.event || "payment_link.paid";

      console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

      if (
        event === "payment_link.paid" ||
        event === "payment.captured" ||
        event === "order.paid" ||
        event === "test.payment"
      ) {
        const payload = body.payload || {};
        const paymentLinkEntity = payload.payment_link?.entity || {};
        const paymentEntity = payload.payment?.entity || {};

        const notes = paymentLinkEntity.notes || paymentEntity.notes || body.notes || {};

        let userId =
          notes.uid ||
          notes.user_id ||
          notes.userId ||
          body.userId ||
          body.uid ||
          (req.query.uid as string);

        let planId =
          notes.plan ||
          notes.plan_id ||
          notes.planId ||
          body.planId ||
          body.plan;

        let creditsToAdd = Number(notes.credits || body.credits);
        const amount = Number(paymentEntity.amount || paymentLinkEntity.amount || body.amount || 0);

        if (!creditsToAdd || isNaN(creditsToAdd)) {
          if (planId === "starter" || amount === 19900 || amount === 300) {
            creditsToAdd = 50;
            planId = "starter";
          } else if (planId === "pro" || amount === 49900 || amount === 900) {
            creditsToAdd = 200;
            planId = "pro";
          } else if (planId === "ultra-pro" || amount === 149900 || amount === 1800) {
            creditsToAdd = 500;
            planId = "ultra-pro";
          } else {
            creditsToAdd = 50;
            planId = planId || "starter";
          }
        }

        if (!userId) {
          console.warn("[RAZORPAY WEBHOOK] Webhook received but no userId found in notes or body.", body);
          return res.status(200).json({ status: "ignored_no_userId", message: "Missing userId in notes" });
        }

        const paymentId =
          paymentEntity.id ||
          paymentLinkEntity.id ||
          body.payment_id ||
          `tx_${Date.now()}`;

        // Idempotency check in Firestore
        const paymentRef = adminDb.collection("processed_payments").doc(paymentId);
        const existingPayment = await paymentRef.get();

        if (existingPayment.exists) {
          console.log(`[RAZORPAY WEBHOOK] Payment ${paymentId} already processed.`);
          return res.json({ status: "already_processed", paymentId });
        }

        // Grant credits to user in Firestore
        const userRef = adminDb.collection("users").doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          await userRef.set({
            credits: creditsToAdd,
            isPro: true,
            planId: planId,
            trialUsed: false,
            location: "",
            currency: "USD",
            symbol: "$",
            tasks: {
              profilePic: false,
              resumeAdded: false,
              compAdded: false,
              noticeAdded: false,
              scorerUsed: false,
              careerUsed: false,
              outreachUsed: false,
              interviewUsed: false
            }
          });
        } else {
          await userRef.update({
            credits: FieldValue.increment(creditsToAdd),
            isPro: true,
            planId: planId,
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        // Record payment processing
        await paymentRef.set({
          paymentId,
          userId,
          planId,
          creditsAdded: creditsToAdd,
          amount,
          event,
          processedAt: FieldValue.serverTimestamp()
        });

        console.log(`[RAZORPAY WEBHOOK] Successfully added ${creditsToAdd} credits to user ${userId} for payment ${paymentId}`);
        return res.json({
          status: "success",
          userId,
          creditsAdded: creditsToAdd,
          planId,
          paymentId
        });
      }

      return res.json({ status: "ignored_event", event });
    } catch (err: any) {
      console.error("[RAZORPAY WEBHOOK ERROR]", err);
      return res.status(500).json({ error: err.message || "Webhook processing failed" });
    }
  };

  app.post("/api/razorpay-webhook", handleRazorpayWebhook);
  app.post("/api/webhooks/razorpay", handleRazorpayWebhook);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
