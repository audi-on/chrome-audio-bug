import express, { Request, Response } from "express";
import fs from "fs";
import { extractRange, filePath, setPartialRangeHeaders } from "./helpers";

const app = express();
const port = 3000;

app.get("/traffic", (req: Request, res: Response) => {
  const expirationTime = Date.now() + 1000; // Valid for 1 second

  // TODO: Comment to test on same server
  res.redirect(`http://localhost:3100/audio?expire=${expirationTime}`);
  // TODO: Uncomment to test on same server
  // res.redirect(`http://localhost:3000/audio?expire=${expirationTime}`);
});

// Only to test for the same server scenario
app.get("/audio", (req: Request, res: Response) => {
  const expire = req.query.expire as string;
  const now = Date.now();

  if (parseInt(expire) < now) {
    // Redirect back to /traffic if expired
    res.redirect("http://localhost:3000/traffic");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.log("File stats error:", err);
      res.status(404).send("Not Found");
      return;
    }

    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      const { start, end } = extractRange(range, fileSize);

      setPartialRangeHeaders(res, fileSize, { start, end });

      const readStream = fs.createReadStream(filePath, { start, end });

      readStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
