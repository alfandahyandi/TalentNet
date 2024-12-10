import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * StableBTreeMap digunakan untuk menyimpan data bakat musik dan produser.
 * - Key: ID pengguna (string)
 * - Value: Informasi bakat atau produser (Profile)
 */

class Profile {
  id: string;
  name: string;
  role: "Talent" | "Producer";
  genre: string;
  portfolioURL: string;
  contactInfo: string;
  description: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const profileStorage = StableBTreeMap<string, Profile>(0);

const app = express();
app.use(express.json());

// Tambahkan profil bakat atau produser
app.post("/profiles", (req, res) => {
  const profile: Profile = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    ...req.body,
  };
  profileStorage.insert(profile.id, profile);
  res.json(profile);
});

// Tampilkan semua profil
app.get("/profiles", (req, res) => {
  res.json(profileStorage.values());
});

// Tampilkan detail profil berdasarkan ID
app.get("/profiles/:id", (req, res) => {
  const profileId = req.params.id;
  const profileOpt = profileStorage.get(profileId);
  if (!profileOpt) {
    res.status(404).send(`Profile with id=${profileId} not found`);
  } else {
    res.json(profileOpt);
  }
});

// Perbarui profil
app.put("/profiles/:id", (req, res) => {
  const profileId = req.params.id;
  const profileOpt = profileStorage.get(profileId);
  if (!profileOpt) {
    res.status(400).send(`Couldn't update profile with id=${profileId}. Profile not found`);
  } else {
    const updatedProfile = {
      ...profileOpt,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    profileStorage.insert(profileId, updatedProfile);
    res.json(updatedProfile);
  }
});

// Hapus profil
app.delete("/profiles/:id", (req, res) => {
  const profileId = req.params.id;
  const deletedProfile = profileStorage.remove(profileId);
  if (!deletedProfile) {
    res.status(400).send(`Couldn't delete profile with id=${profileId}. Profile not found`);
  } else {
    res.json(deletedProfile);
  }
});

app.listen();

function getCurrentDate() {
  const timestamp = Number(time());
  return new Date(timestamp.valueOf() / 1_000_000);
}
