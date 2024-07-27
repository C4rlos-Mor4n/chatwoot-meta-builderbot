import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface FormatOptions {
  code: string;
  ext: "mp3";
}

const formats: Record<string, FormatOptions> = {
  mp3: {
    code: "libmp3lame",
    ext: "mp3",
  },
};

const convertAudio = async (
  filePath: string,
  format: FormatOptions["ext"] = "mp3"
): Promise<string> => {
  if (!filePath) {
    throw new Error("filePath is required");
  }
  const convertedFilePath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, path.extname(filePath))}.${formats[format].ext}`
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .audioCodec(formats[format].code)
      .audioBitrate("128k")
      .format(formats[format].ext)
      .output(convertedFilePath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  return convertedFilePath;
};

export const downloadFile = async (url: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }

  // Obtener la extensión del archivo desde la URL si está disponible
  const urlExtension = path.extname(url).slice(1); // Remover el punto inicial

  // Obtener el tipo MIME desde el encabezado de respuesta
  const mimeType = res.headers.get("content-type");

  // Determinar la extensión usando el tipo MIME o la URL
  const extension = mime.extension(mimeType) || urlExtension || "bin";

  const fileName = `file-${Date.now()}.${extension}`;
  const folderPath = path.join(process.cwd(), "public");
  const filePath = path.join(folderPath, fileName);

  // Crear la carpeta si no existe
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileStream = fs.createWriteStream(filePath);
  await new Promise<void>((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });

  const fileBuffer = fs.readFileSync(filePath);

  console.log(`File downloaded and saved as ${filePath}`);

  // Convertir todos los archivos de audio a formato MP3
  const audioExtensions = ["oga", "ogg", "wav", "mp3"];
  let finalFilePath = filePath;
  let finalExtension = extension;

  if (audioExtensions.includes(extension)) {
    try {
      finalFilePath = await convertAudio(filePath, "mp3");
      finalExtension = "mp3";
      console.log(`File converted to ${finalFilePath}`);
    } catch (error) {
      console.error(`Error converting file: ${error.message}`);
    }
  }

  return {
    fileName: path.basename(finalFilePath),
    filePath: finalFilePath,
    fileBuffer: fs.readFileSync(finalFilePath),
    extension: finalExtension,
  };
};

export default downloadFile;
