import Tesseract from "tesseract.js";
import path from "path";

const extractTextFromImage = async (imagePath:string) => {
  const absPath = path.resolve(imagePath); // convert relative to absolute
  const { data } = await Tesseract.recognize(absPath, "eng", {
    logger: (info) => console.log(info), // optional progress
  });
  return data.text;
};

// Call it with your file path
extractTextFromImage("./result.jpg")
  .then((text) => console.log("Extracted Text:\n", text))
  .catch(console.error);
