const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const OpenAI = require("openai");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Korisnik = require("./models/Korisnik");

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://fipu-ai-car-configurator.vercel.app"]
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" Spojeno na MongoDB"))
  .catch((err) => console.error(" Greška pri spajanju na MongoDB:", err));

const JWT_SECRET = process.env.JWT_SECRET || "tajna123";

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

app.get("/api/auti", async (req, res) => {
  const auti = await Auto.find();
  res.json(auti);
});

app.post("/api/register", async (req, res) => {
  const { ime, email, lozinka } = req.body;
  try {
    const postoji = await Korisnik.findOne({ email });
    if (postoji)
      return res.status(400).json({ message: "Email je već registriran." });

    const hashed = await bcrypt.hash(lozinka, 10);
    const novaUloga = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    const novi = new Korisnik({
      ime,
      email,
      lozinka: hashed,
      uloga: novaUloga,
    });
    await novi.save();

    res.status(201).json({ message: "Korisnik registriran." });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, lozinka } = req.body;
  try {
    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik) return res.status(400).json({ message: "Krivi podaci." });

    const isValid = await bcrypt.compare(lozinka, korisnik.lozinka);
    if (!isValid) return res.status(400).json({ message: "Krivi podaci." });

    const token = jwt.sign(
      { id: korisnik._id, uloga: korisnik.uloga, ime: korisnik.ime },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      uloga: korisnik.uloga,
      ime: korisnik.ime,
      id: korisnik._id,
      email: korisnik.email,
      uloga: korisnik.uloga,
    });
  } catch (err) {
    res.status(500).json({ message: "Greška pri prijavi." });
  }
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
    if (!auto) return res.status(404).json({ message: "Auto nije pronađen" });
    res.json(auto);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju auta" });
  }
});

app.delete("/api/auti/:id", async (req, res) => {
  try {
    const auto = await Auto.findByIdAndDelete(req.params.id);
    if (!auto) {
      return res.status(404).json({ poruka: "Auto nije pronađen" });
    }
    res.json({ poruka: "Auto uspješno izbrisan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
});

app.post("/api/konfiguracije/spremi", async (req, res) => {
  try {
    const { userId, konfiguracija } = req.body;

    if (!userId || !konfiguracija || !konfiguracija.podmodelNaziv) {
      return res.status(400).json({ message: "Nedostaju podaci." });
    }

    const korisnik = await Korisnik.findById(userId);
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    korisnik.konfiguracije.push({ konfiguracija });
    await korisnik.save();

    res.status(200).json({ message: "Konfiguracija spremljena." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

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


app.post("/api/send-mail", async (req, res) => {
  const { poruka } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Nedostaje token." });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const korisnik = await Korisnik.findById(decoded.id);
    if (!korisnik)
      return res.status(401).json({ message: "Korisnik nije pronađen." });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Kontakt forma - ${korisnik.ime}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Poruka s kontakt forme",
      text: `Od: ${korisnik.email}\n\nPoruka:\n${poruka}`,
    });

    res.status(200).json({ message: "Poruka uspješno poslana." });
  } catch (err) {
    console.error("Greška pri slanju kontakt poruke:", err);
    res.status(500).json({ message: "Greška pri slanju poruke." });
  }
});


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ai-konfiguracija", async (req, res) => {
  const { zahtjev, povijest } = req.body;

  try {
    const modeli = await Konfigurator.find();
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
  "cijena": number,
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
        `.trim(),
      },
      ...povijest,
      { role: "user", content: zahtjev },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
    });

    let odgovor = response.choices[0].message.content.trim();

    if (odgovor.startsWith("```")) {
      odgovor = odgovor.replace(/```json|```/g, "").trim();
    }

    try {
      const parsed = JSON.parse(odgovor);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.cijena !== undefined &&
        parsed.preporucena_motorizacija !== undefined
      ) {
        return res.json({ done: true, konfiguracija: parsed, odgovor: "" });
      }
    } catch {}

    res.json({ done: false, odgovor });
  } catch (error) {
    console.error("AI greška:", error);
    res.status(500).json({ message: "NEDAM VIŠE PARA ZA AI." });
  }
});

app.post("/api/favoriti/check", async (req, res) => {
  const { email, autoId } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ email }).populate("favoriti");
    if (!korisnik)
      return res.status(404).json({ message: "Korisnik nije pronađen" });

    const jeFavorit = korisnik.favoriti.some((fav) => fav.equals(autoId));
    res.json({ jeFavorit });
  } catch (err) {
    console.error("Greška pri provjeri favorita:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

app.post("/api/favoriti/toggle", async (req, res) => {
  const { email, autoId } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik)
      return res.status(404).json({ message: "Korisnik nije pronađen" });

    const index = korisnik.favoriti.findIndex(
      (fav) => fav.toString() === autoId
    );

    if (index !== -1) {
      korisnik.favoriti.splice(index, 1); 
    } else {
      korisnik.favoriti.push(autoId); 
    }

    await korisnik.save();
    res.json({ message: "Favoriti ažurirani." });
  } catch (err) {
    console.error("Greška pri ažuriranju favorita:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

app.post("/api/favoriti/svi", async (req, res) => {
  try {
    const { email } = req.body;
    const korisnik = await Korisnik.findOne({ email }).populate("favoriti");
    if (!korisnik)
      return res.status(404).json({ message: "Korisnik nije pronađen" });

    res.json(korisnik.favoriti);
  } catch (err) {
    console.error("Greška pri dohvaćanju favorita:", err);
    res.status(500).json({ message: "Greška na serveru" });
  }
});

app.get("/api/konfiguracije/:korisnikId", async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.korisnikId);
    res.json(korisnik.konfiguracije);
  } catch {
    res.status(500).json({ message: "Greška kod dohvaćanja konfiguracija" });
  }
});

app.delete("/api/konfiguracije/:korisnikId/:konfId", async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.params.korisnikId);
    korisnik.konfiguracije = korisnik.konfiguracije.filter(
      (k) => k._id.toString() !== req.params.konfId
    );
    await korisnik.save();
    res.json({ message: "Konfiguracija obrisana" });
  } catch {
    res.status(500).json({ message: "Greška kod brisanja konfiguracije" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server radi na sljedecem: ${PORT}`));
