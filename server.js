const express = require('express');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');
const fs = require('fs');

['uploads', 'thumbnails', 'cache'].forEach((folderName) => {
  const folderPath = `${__dirname}/${folderName}`;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
})

const app = express();

app.use('/admin', express.static(__dirname + '/admin.html'));
app.use('/view_thumbnails', express.static(__dirname + '/view_thumbnails.html'));
app.use('/view_progressive', express.static(__dirname + '/view_progressive.html'));

app.use('/progressive-image', express.static(__dirname + '/node_modules/progressive-image/dist'));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/thumbnails', express.static(__dirname + '/thumbnails'));

app.use('/css', express.static(__dirname + '/css'));

// default options
app.use(fileUpload());

app.get('/ping', function (req, res) {
  res.send('pong');
});

app.get('/delete/:imageName', function (req, res) {
  // res.send('image to delete' + req.params.imageName);
  fs.unlinkSync(`${__dirname}/uploads/${req.params.imageName}`);
  fs.unlinkSync(`${__dirname}/thumbnails/${req.params.imageName}.jpeg`);

  fs.readdir(`${__dirname}/cache/`, (err, files) => {
    files.forEach((file) => {
      if (file.indexOf(`${req.params.imageName}_`) === 0) {
        fs.unlinkSync(`${__dirname}/cache/${file}`);
      }
    })
  });

  res.redirect("/admin");
});

app.get('/image/:imageName', async function (req, res) {
  const imagePath = __dirname + '/uploads/' + req.params.imageName;
  const image = sharp(imagePath);
  const askedImageWidth = parseFloat(req.query.imageWidth);
  const cacheImagePath = `${__dirname}/cache/${req.params.imageName}_${askedImageWidth}.jpeg`;

  image
    .metadata()
    .then((metadata) => {
      if (askedImageWidth >= metadata.width) {
        res.sendFile(imagePath);
        return;
      }
      else if (fs.existsSync(cacheImagePath)) {
        res.sendFile(cacheImagePath);
        return;
      }
      return image
        .resize(Math.min(metadata.width, askedImageWidth))
        .jpeg()
        .toFile(cacheImagePath)
        .then(() => {
          res.sendFile(cacheImagePath);
          // res.end(data, 'binary');
        });
    });
});

app.get('/images', (req, res) => {
  const imagesFolder = __dirname + '/uploads/';
  const files = fs.readdirSync(imagesFolder);
  files.sort(function (a, b) {
    return fs.statSync(imagesFolder + b).mtime.getTime() -
      fs.statSync(imagesFolder + a).mtime.getTime();
  });
  res.send(JSON.stringify(files));
});

app.post('/upload', async function (req, res) {
  let sampleFile;
  let uploadPath;

  if (Object.keys(req.files).length == 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  sampleFile = req.files.sampleFile;

  const uploadedImage = sharp(req.files.sampleFile.data);
  const metadata = await uploadedImage.metadata();
  await uploadedImage
    .resize(metadata.width * 0.2)
    .jpeg({
      quality: 50,
    })
    .toFile(__dirname + '/thumbnails/' + sampleFile.name + '.jpeg');

  uploadPath = __dirname + '/uploads/' + sampleFile.name;

  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    // res.send('File uploaded to ' + uploadPath);
    res.redirect("/admin");
  });
});

const port = parseInt(process.env.PORT, 10) || 8080;

app.listen(port, function () {
  console.log(`my server listening on port ${port}`); // eslint-disable-line
});
