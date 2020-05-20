/* eslint-disable no-magic-numbers */
/* eslint-env browser */
class imageUpload {

  constructor(uploadImage) {
    this.imgDiv = uploadImage;
    this.imgSourceURL = null;
    this.img = null;
    this.init(this);
  }

  init(upload) {

    var inputFile = upload.imgDiv.querySelector("#inputImg"),
      previewDiv = upload.imgDiv.querySelector("#imgPreviewDiv"),
      previewImage = upload.imgDiv.querySelector(".imgPreview"),
      previewCanvas = upload.imgDiv.querySelector("#previewCanvas"),
      previewText = upload.imgDiv.querySelector(".imgPreview_defaultText"),
      context = previewCanvas.getContext("2d");
    this.img = previewImage;

    inputFile.addEventListener("change", function() {
      const file = this.files[0];

      if (file) {
        const reader = new FileReader();
        previewText.style.display = "none";

        /*Notiz: 
        Previewimage wird momentan nicht gebraucht, kann aber genutzt werden um das Bild in Voller Größe anzuzeigen. 
        */
        //previewImage.style.display = "block";

        reader.addEventListener("load", function() {
          previewImage.setAttribute("src", this.result);
          const img = new Image();
          img.setAttribute("src", this.result);

          img.onload = () => {

            // Größe des "Zoom-bilds" auf hochgeladenes Bild anpassen
            previewImage.style.display = "none";

            previewImage.style.height = img.naturalHeight;
            previewImage.style.width = img.naturalWidth;

            /*context.drawimage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            image: Quellbild, muss geladen sein. 
            sx/sy: Bildausschnitt x/y-Achse. sWidth/sHeight: höhe/breite des Ausschnitts. 
            dx/dy/dWidth/dHeight: position/größe der Fläche, auf die der mit sx/sy/etc definierte Bildausschnitt skaliert wird. */
            // context.drawImage(img, 0, 0); //Überladende methode drawimage(img, dx,dy)
            let sx = Math.max(0, (img.width - previewCanvas.width) /
                2),
              sy = Math.max(0, (img.height - previewCanvas.height) /
                2);
            context.drawImage(img, sx, sy, previewCanvas.width,
              previewCanvas.height, 0, 0, previewCanvas.width,
              previewCanvas.height);

            //Canvas ist innerhalb der PreviewDiv. Diese ist hidden, bevor das Bild hochgeladen wird.
            previewDiv.style.display = "block";
          };

        });

        //Click auf Preview-Bild: Größeres Bild anzeigen. Click auf Größeres Bild: kleineres Bild anzeigen
        previewCanvas.addEventListener("click", function() {
          previewDiv.style.display = "none";
          previewImage.style.display = "block";
          previewImage.addEventListener("click", function() {
            previewDiv.style.display = "block";
            previewImage.style.display = "none";
          });
        });

        reader.readAsDataURL(file);
      }
    });
  }
}

export default imageUpload;