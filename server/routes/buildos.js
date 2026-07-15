import express from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "../db.js";

const router = express.Router();

function verifySignature(req) {
  const sig = req.headers["x-buildos-signature"];
  const secret = process.env.BUILDOS_WEBHOOK_SECRET;
  if (!sig || !secret) return false;
  const expected = `sha256=${createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

// POST /api/buildos-webhook — receives events from BuildOS ERP
router.post("/", async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { event, data } = req.body || {};
  if (!event || !data) {
    return res.status(400).json({ error: "event and data are required" });
  }

  if (event === "purchase-request.created" || event === "rfq.sent") {
    const { error } = await supabase.from("requests").insert([
      {
        profile_id: data.supplierId || data.vendorId,
        title: data.description || data.rfqRef || data.prRef || "ERP Request",
        amount: data.totalAmount || data.budgetAmount || 0,
        currency: data.currency || "NGN",
        status: "pending",
        buildos_ref: data.id,
        buildos_event: event,
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });
  }

  res.json({ received: true, event });
});

export default router;
