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
  const { zahtjev } = req.body; // npr. "Želim Audi A4 s dizelskim motorom"

  try {
    // 1. Dohvati konfiguratore iz MongoDB
    const modeli = await Konfigurator.find();

    // 2. Formatiraj podatke kao tekst za AI
    const podaci = modeli.map((m) => {
      return {
        naziv: m.naziv,
        podmodeli: m.podmodeli.map((p) => ({
          naziv: p.naziv,
          cijena: p.cijena,
          motorizacije: p.motorizacije,
          oprema: p.oprema,
        })),
      };
    });

    // 3. Pošalji sve OpenAI-u
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
Ti si AI koji preporučuje automobile na temelju korisničkog zahtjeva.

Koristi isključivo sljedeće podatke o modelima i opremi:\n\n${JSON.stringify(
            podaci
          ).slice(0, 12000)}.
Vrati isključivo JSON u ovom točnom formatu  (bez dodatnih komentara, bez objašnjenja, bez pozdrava), te pripazi da svi kljucevi u JSON budu stringovi:

{
cijena: (tu stavi pocetnu cijenu tog podmodela bez ikakvih dodataka),
motorizacije: (unesi SVE ponudene motorizacije za ovaj podmodel),
naziv:(naziv podmodela),
oprema:(iz mongaDB uzmes podatke od ovog podmodela za svu opremu podmodela),
slika:(pripazi da nastavak bude .png i slika nek bude identicna kao u mongoDB, pazi na mala slova),
id:(uzmes iz mongaDB),
preporucena_oprema:(tu stavi listu opreme koju si ti preporucio),
preporucena_motorizacija:{
nadoplata: 
naziv: 
pogon: 
snaga_kW: 
tip: 
_id: 
}(znaci samo stavi objekt motorizacije koju si izabrao, a ove podatke sve imas u mongoDB)

`.trim(),
        },
        {
          role: "user", 
          content: zahtjev,
        },
      ],
    });

    let odgovor = response.choices[0].message.content.trim();
      if (odgovor.startsWith("```")) {
      odgovor = odgovor.replace(/```json|```/g, "").trim();
    }

    try {
      const parsed = JSON.parse(odgovor);
      res.json({ konfiguracija: parsed });
    } catch (err) {
      console.error("AI je vratio neispravan JSON:", odgovor, err);
      res
        .status(500)
        .json({ message: "AI je vratio neispravan odgovor. Pokušaj ponovno." });
    }
  } catch (error) {
    console.error("AI greška:", error);
    res.status(500).json({ message: "Greška u AI konfiguraciji." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server radi na http://localhost:${PORT}`)
);
