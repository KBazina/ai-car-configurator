const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Spoji se na MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Spojeno na MongoDB"))
  .catch((err) => console.error("❌ Greška pri spajanju na MongoDB:", err));

// Sheme i modeli
const autoSchema = new mongoose.Schema({
  marka: String,
  model: String,
  godina: Number,
  kilometraza: Number,
  cijena: Number,
  gorivo: String,
  slika: String,
  mjenjac: String,
  snaga: Number,
  oprema: [String],
});

const konfiguratorSchema = new mongoose.Schema({
  naziv: String,
  pozadina: String,
  slika: String,
  podmodeli: [
    {
      naziv: String,
      slika: String,
      cijena: Number,
      motorizacije: [
        {
          naziv: String,
          snaga_kW: Number,
          tip: String,
          performance: Boolean,
          pogon: String,
          nadoplata: Number,
        },
      ],
      oprema: [
        {
          naziv: String,
          cijena: Number,
        },
      ],
    },
  ],
});

const Konfigurator = mongoose.model(
  "Konfigurator",
  konfiguratorSchema,
  "configurator_auti"
);
const Auto = mongoose.model("Auto", autoSchema, "rabljeni_auti");

// Rute za dohvat auti i konfiguratora
app.get("/api/auti", async (req, res) => {
  const auti = await Auto.find();
  res.json(auti);
});

app.get("/api/modeli", async (req, res) => {
  try {
    const modeli = await Konfigurator.find();
    res.json(modeli);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju modela" });
  }
});

app.get("/api/auti/:id", async (req, res) => {
  try {
    const auto = await Auto.findById(req.params.id);
    if (!auto) {
      return res.status(404).json({ message: "Auto nije pronađen" });
    }
    res.json(auto);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju auta" });
  }
});


// Slanje konfiguracije na email kao PDF
app.post("/api/posalji-konfiguraciju", async (req, res) => {
  const { email, model, motorizacija, oprema, cijena } = req.body;

  const doc = new PDFDocument();
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", async () => {
    const pdfBuffer = Buffer.concat(chunks);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Konfigurator" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Tvoja konfiguracija za ${model}`,
        text: `U privitku se nalazi PDF s tvojom konfiguracijom.`,
        attachments: [
          {
            filename: `Konfiguracija-${model}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.status(500).send("Greška prilikom slanja maila.");
    }
  });

  // PDF sadržaj
  doc
    .fontSize(18)
    .fillColor("#C78A3B")
    .text(`Konfiguracija za Audi ${model}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(12).fillColor("black");
  doc.text(
    `Motorizacija: ${motorizacija.naziv} (${motorizacija.snaga_kW} kW, ${motorizacija.tip}, ${motorizacija.pogon})`
  );
  doc.moveDown();
  doc.text("Dodatna oprema:");
  if (oprema.length) {
    oprema.forEach((op) => {
      doc.text(`- ${op.naziv}: ${op.cijena.toLocaleString("de-DE")} €`);
    });
  } else {
    doc.text("- Bez dodatne opreme");
  }
  doc.moveDown();
  doc.fontSize(14).fillColor("#C78A3B");
  doc.text(`Ukupna cijena: ${cijena.toLocaleString("de-DE")} €`);
  doc.end();
});

// ✅ OPENAI INTEGRACIJA – AI zna sve konfiguratore
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ai-konfiguracija", async (req, res) => {
  const { zahtjev, povijest } = req.body; // povijest je niz poruka {role, content}

  try {
    // 1. Dohvati sve modele iz MongoDB
    const modeli = await Konfigurator.find();

    // 2. Formatiraj podatke za AI
    const podaci = modeli.map((m) => ({
      naziv: m.naziv,
      podmodeli: m.podmodeli.map((p) => ({
        naziv: p.naziv,
        cijena: p.cijena,
        motorizacije: p.motorizacije,
        oprema: p.oprema,
        slika: p.slika,
        id: p._id,
      })),
    }));


    // 3. Pripremi poruke za AI: system + povijest + novi user zahtjev
    const messages = [
      {
        role: "system",
        content: `
Ti si AI koji priča na hrvatski i preporučuje automobile na temelju korisničkog zahtjeva i vodi višekratni razgovor da prikupi potrebne informacije.
Prvo postavljaj korisniku pitanja kako bi bolje razumio što želi, ne vraćaj odmah konfiguraciju.
Kada prikupiš sve potrebne podatke, vrati isključivo JSON u točnom formatu bez komentara, bez pozdrava.

Koristi isključivo ove podatke o modelima i opremi:

${JSON.stringify(podaci)}

JSON format treba biti:

{
  "cijena": number(ovo je pocetna modela bez iceg drugog),
  "motorizacije": array,
  "naziv": string,
  "oprema": array,
  "slika": string,
  "id": string,
  "preporucena_oprema": array,
  "preporucena_motorizacija": {
    "nadoplata": number,
    "naziv": string,
    "pogon": string,
    "snaga_kW": number,
    "tip": string,
    "_id": string
  }
}

Ne odgovaraj na druge teme osim konfiguracije.
        `.trim()
      },
      ...povijest,
      { role: "user", content: zahtjev }
    ];

    // 4. Pozovi OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages
    });

    let odgovor = response.choices[0].message.content.trim();

    // Očisti eventualne ``` oznake
    if (odgovor.startsWith("```")) {
      odgovor = odgovor.replace(/```json|```/g, "").trim();
    }

    // 5. Provjeri je li odgovor JSON s konfiguracijom
    try {
      const parsed = JSON.parse(odgovor);

      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.cijena !== undefined &&
        parsed.preporucena_motorizacija !== undefined
      ) {
        // Gotova konfiguracija
        return res.json({ done: true, konfiguracija: parsed, odgovor: "" });
      }
    } catch {
      // Nije JSON konfiguracija, vraćamo normalan AI odgovor
    }

    // 6. Vraćamo AI tekst kao nastavak razgovora
    res.json({ done: false, odgovor });
  } catch (error) {
    console.error("AI greška:", error);
    res.status(500).json({ message: "NEDAM VIŠE PARA ZA AI." });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server radi na http://localhost:${PORT}`)
);
