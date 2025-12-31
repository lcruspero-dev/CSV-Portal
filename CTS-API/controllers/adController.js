import Ad from "../models/adModel";

// Get the current ad
export const getActiveAd = async (req, res) => {

  try {

    const ad = await Ad.findOne();

    if (!ad) {
      return res.status(404).json({ 
        success: false,
        message: "No ad found" 
      });
    }

    res.json({
      success: true,
      message: "Fetch Ad",
      data: ad,
    });

  } catch (error) {
    console.error("Failed getch Ad", error)
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
     });
  }
};

// Replace or create ad
// const uploadAd = async (req, res) => {
//   try {
//     const imageUrl = `/uploads/${req.file.filename}`;

//     // Check if ad exists
//     let ad = await Ad.findOne();

//     if (ad) {
//       // Replace image URL
//       ad.imageUrl = imageUrl;
//       await ad.save();
//     } else {
//       ad = await Ad.create({ imageUrl });
//     }

//     res.status(200).json({ message: "Ad saved", ad });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

