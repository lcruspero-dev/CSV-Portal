const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:4000", "http://localhost:3000/"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors());
// app.use(cors(corsOptions));

const uploadDir = path.join(__dirname, "uploads");
const formUploadDir = path.join(__dirname, "Signature_uploads");
const avatarDir = path.join(__dirname, "avatar");

// Ensure the uploads directory exists
[uploadDir, formUploadDir, avatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
// Function to generate a unique filename
function getUniqueFilename(filePath) {
  let newPath = filePath;
  let counter = 1;
  while (fs.existsSync(newPath)) {
    const { dir, name, ext } = path.parse(filePath);
    newPath = path.join(dir, `${name} (${counter})${ext}`);
    counter++;
  }
  return path.basename(newPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = getUniqueFilename(
      path.join(uploadDir, file.originalname)
    );
    cb(null, uniqueFilename);
  },
});

const formStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, formUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = getUniqueFilename(
      path.join(formUploadDir, file.originalname)
    );
    cb(null, uniqueFilename);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) =>
    cb(null, getUniqueFilename(path.join(avatarDir, file.originalname))),
});

const upload = multer({ storage: storage });
const formUpload = multer({ storage: formStorage });
const avatarUpload = multer({ storage: avatarStorage });

// Create (Upload) file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// New endpoint for form file upload
app.post("/form-upload", formUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({
    message: "Form file uploaded successfully",
    filename: req.file.filename,
  });
});

// Read (Get list of files)
app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    res.json(files);
  });
});

// Read (Download file)
app.get("/files/:filename", (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

// Read (Download form file)
app.get("/form-files/:filename", (req, res) => {
  const filepath = path.join(formUploadDir, req.params.filename);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send("Form file not found");
    }
  });
});

// Update (Rename file)
app.put("/files/:filename", (req, res) => {
  const oldPath = path.join(uploadDir, req.params.filename);
  const newFilename = getUniqueFilename(
    path.join(uploadDir, req.body.newFilename)
  );
  const newPath = path.join(uploadDir, newFilename);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).send("Error renaming file: " + err);
    }
    res.json({
      message: "File renamed successfully",
      newFilename: newFilename,
    });
  });
});

// Delete file
app.delete("/files/:filename", (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send("Error deleting file: " + err);
    }
    res.json({ message: "File deleted successfully" });
  });
});

// Upload avatar
app.post("/upload-avatar", avatarUpload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({
    message: "Avatar uploaded successfully",
    filename: req.file.filename,
  });
});

// Get list of avatar files
app.get("/avatars", (req, res) => {
  fs.readdir(avatarDir, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    res.json(files);
  });
});

// Download avatar file
app.get("/avatars/:filename", (req, res) => {
  const filepath = path.join(avatarDir, req.params.filename);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send("Avatar file not found");
    }
  });
});

// Rename avatar file
app.put("/avatars/:filename", (req, res) => {
  const oldPath = path.join(avatarDir, req.params.filename);
  const newFilename = getUniqueFilename(
    path.join(avatarDir, req.body.newFilename)
  );
  const newPath = path.join(avatarDir, newFilename);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).send("Error renaming file: " + err);
    }
    res.json({ message: "Avatar renamed successfully", newFilename });
  });
});

// Delete avatar file
app.delete("/avatars/:filename", (req, res) => {
  const filepath = path.join(avatarDir, req.params.filename);
  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send("Error deleting file: " + err);
    }
    res.json({ message: "Avatar deleted successfully" });
  });
});

app.disable("x-powered-by");

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
