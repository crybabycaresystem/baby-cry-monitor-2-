const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

// Serve website files if they are in this folder
app.use(express.static(__dirname));

// ==========================================
// STORE LATEST ESP32 STATUS
// ==========================================

let latestStatus = {
    status: "NO CRY",
    confidence: 0,
    lastSeen: 0
};

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {
    res.json({
        ok: true,
        server: "Baby Cry AI Relay",
        time: new Date().toISOString()
    });
});

// ==========================================
// ESP32 SENDS STATUS HERE
// ==========================================

app.post("/api/esp-status", (req, res) => {

    const status = String(
        req.body.status || "NO CRY"
    );

    const confidence = Number(
        req.body.confidence || 0
    );

    latestStatus = {
        status: status,
        confidence: confidence,
        lastSeen: Date.now()
    };

    console.log(
        "ESP32:",
        status,
        confidence.toFixed(1) + "%"
    );

    res.json({
        ok: true,
        received: {
            status: status,
            confidence: confidence
        }
    });
});

// ==========================================
// WEBSITE GETS CURRENT ESP32 STATUS
// ==========================================

app.get("/api/status", (req, res) => {

    const now = Date.now();

    const age =
        now - latestStatus.lastSeen;

    // ESP32 is considered online
    // if it reported within the last 10 seconds
    const online =
        latestStatus.lastSeen > 0 &&
        age < 10000;

    res.json({
        online: online,
        status: latestStatus.status,
        confidence: latestStatus.confidence,
        lastSeen: latestStatus.lastSeen
    });
});

// ==========================================
// CHATBOT
// ==========================================

app.post("/api/chat", async (req, res) => {

    const question = String(
        req.body.question || ""
    );

    const status = String(
        req.body.status || latestStatus.status
    );

    const confidence = Number(
        req.body.confidence || latestStatus.confidence
    );

    const q = question.toLowerCase();

    let answer;

    // -------------------------------
    // STATUS
    // -------------------------------

    if (q.includes("status")) {

        answer =
            `The current Baby Cry AI status is <b>${status}</b> with a confidence of <b>${confidence.toFixed(1)}%</b>.`;
    }

    // -------------------------------
    // HUNGER
    // -------------------------------

    else if (
        q.includes("hunger") ||
        q.includes("hungry") ||
        q.includes("feed") ||
        q.includes("feeding") ||
        q.includes("milk")
    ) {

        answer =
            "If the system detects HUNGER, check the baby's hunger cues and feed the baby if appropriate. Burp the baby after feeding if needed.";
    }

    // -------------------------------
    // DISTRESS
    // -------------------------------

    else if (
        q.includes("distress") ||
        q.includes("pain") ||
        q.includes("uncomfortable")
    ) {

        answer =
            "If the system detects DISTRESS, check the baby's diaper, temperature, clothing and comfort. Seek medical advice if you are concerned.";
    }

    // -------------------------------
    // CRYING
    // -------------------------------

    else if (
        q.includes("cry") ||
        q.includes("crying")
    ) {

        answer =
            "Babies can cry because of hunger, discomfort, tiredness or needing attention. Check feeding, diaper and comfort first.";
    }

    // -------------------------------
    // SLEEP
    // -------------------------------

    else if (
        q.includes("sleep") ||
        q.includes("tired") ||
        q.includes("nap")
    ) {

        answer =
            "Keep the baby's sleeping environment safe, calm and comfortable.";
    }

    // -------------------------------
    // DIAPER
    // -------------------------------

    else if (
        q.includes("diaper") ||
        q.includes("nappy")
    ) {

        answer =
            "Check whether the diaper is wet or dirty and make sure it is not too tight.";
    }

    // -------------------------------
    // TEMPERATURE
    // -------------------------------

    else if (
        q.includes("temperature") ||
        q.includes("hot") ||
        q.includes("cold")
    ) {

        answer =
            "Make sure the baby is comfortably dressed and the environment is neither too hot nor too cold.";
    }

    // -------------------------------
    // DOCTOR
    // -------------------------------

    else if (
        q.includes("doctor") ||
        q.includes("hospital") ||
        q.includes("fever") ||
        q.includes("sick")
    ) {

        answer =
            "If you are concerned about the baby's health, contact a healthcare professional. Seek urgent medical care if the baby has serious symptoms such as difficulty breathing.";
    }

    // -------------------------------
    // GREETING
    // -------------------------------

    else if (
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("hey")
    ) {

        answer =
            "Hello! 👋 I'm your Baby Care Assistant. I can help with baby crying, hunger, distress, feeding, sleeping and diapers.";
    }

    // -------------------------------
    // DEFAULT
    // -------------------------------

    else {

        answer =
            "I can help with baby crying, hunger, distress, feeding, sleeping, diapers and the current AI status.";
    }

    res.json({
        answer: answer
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        "====================================="
    );

    console.log(
        "Baby Cry AI Monitoring System"
    );

    console.log(
        "Server running on port " + PORT
    );

    console.log(
        "====================================="
    );
});
