
class imageUpload{

    constructor(uploadImage){
    this.imgDiv = uploadImage;
    this.imgSourceURL = null;
    this.img = null;

    this.init(this);
    }
/*
    getSource(){
        return this.imgSourceURL;
    }

    updateSource(src){
        this.imgSourceURL = src;
    }
*/
    init(upload){

        var inputFile = upload.imgDiv.querySelector("#inputImg");

        var previewDiv = upload.imgDiv.querySelector("#imgPreviewDiv");

        var previewImage = upload.imgDiv.querySelector(".imgPreview");
        this.img = previewImage;
        var previewCanvas = upload.imgDiv.querySelector("#previewCanvas");
        console.log(previewCanvas);
        var previewText = upload.imgDiv.querySelector(".imgPreview_defaultText");

        var context = previewCanvas.getContext("2d");

        //console.log(upload);
        //console.log(previewImage);

        inputFile.addEventListener("change", function(){
            const file = this.files[0];

            if(file){
                const reader = new FileReader();
                //console.log(reader);
                previewText.style.display = "none";

                /*Notiz: 
                Previewimage wird momentan nicht gebraucht, kann aber genutzt werden um das Bild in Voller Größe anzuzeigen. 
                */
                //previewImage.style.display = "block";

                reader.addEventListener("load", function(){
                    console.log(this);
                    previewImage.setAttribute("src", this.result);
                    const img = new Image();
                    img.setAttribute("src", this.result);                
                    //console.log("src: " +this.result);   //USE THIS DATA URL FOR SAVING!

                    img.onload = () => {

                        // Größe des "Zoom-bilds" auf hochgeladenes Bild anpassen
                        previewImage.style.display = "none";
   
                        console.log("imgH: " + img.naturalHeight + ", imgW: "+ img.naturalWidth);
                        previewImage.style.height = img.naturalHeight;
                        previewImage.style.width = img.naturalWidth; 

                        /*context.drawimage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                        image: Quellbild, muss geladen sein. 
                        sx/sy: Bildausschnitt x/y-Achse. sWidth/sHeight: höhe/breite des Ausschnitts. 
                        dx/dy/dWidth/dHeight: position/größe der Fläche, auf die der mit sx/sy/etc definierte Bildausschnitt skaliert wird. */
                        // context.drawImage(img, 0, 0); //Überladende methode drawimage(img, dx,dy)
                        let sx = Math.max(0,(img.width - previewCanvas.width)/2);
                        let sy = Math.max(0,(img.height - previewCanvas.height)/2);
                        context.drawImage(img, sx, sy, previewCanvas.width, previewCanvas.height, 0,0, previewCanvas.width, previewCanvas.height);

                        //Canvas ist innerhalb der PreviewDiv. Diese ist hidden, bevor das Bild hochgeladen wird.
                        previewDiv.style.display = "block";
                        }

                });

                //Click auf Preview-Bild: Größeres Bild anzeigen. Click auf Größeres Bild: kleineres Bild anzeigen
                previewCanvas.addEventListener("click", function(){
                    previewDiv.style.display = "none";
                    previewImage.style.display = "block";
                    previewImage.addEventListener("click", function(){
                        previewDiv.style.display = "block";
                        previewImage.style.display = "none";
                    })
                })

                reader.readAsDataURL(file);
            }
        })
    }
}

export default imageUpload;