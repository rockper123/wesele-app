const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.uploadPhoto = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { imageData, fileName } = req.body;
      
      if (!imageData || !fileName) {
        return res.status(400).send('Missing imageData or fileName');
      }

      // Konwertuj base64 na buffer
      const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
      
      // Upload do Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(`photos/${fileName}`);
      
      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/png'
        }
      });

      // Pobierz URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      res.json({ success: true, url });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}); 