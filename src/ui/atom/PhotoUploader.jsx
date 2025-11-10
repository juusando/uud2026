import '../../styles/atom.scss';
import SvgIcn from '../../data/IconCompo';
import Button from './Button';
import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Popup from './Popup';

const PhotoUploader = forwardRef(({
  onFileSelect,
  className,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
  size = 130, // Circle size in pixels
  currentPhoto = null, // URL of current photo to display
  ...props
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);



  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setFileName(file.name);
    
    // Create image URL for cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(URL.createObjectURL(file));
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setCroppedImage(croppedImageUrl);
      setPreview(croppedImageUrl);
      setShowCropper(false);
      
      // Convert to File object for parent callback
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleClick = () => {
    if (!showCropper) {
      fileInputRef.current?.click();
    }
  };

  // Expose the click method to parent components
  useImperativeHandle(ref, () => ({
    click: handleClick
  }));

  const clearFile = () => {
    setPreview(null);
    setCroppedImage(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <>
      <div
        className={`photo-uploader-circle ${dragActive ? 'drag-active' : ''} ${preview || currentPhoto ? 'has-image' : ''} ${className || ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ width: size, height: size }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
          {...props}
        />
        
        {preview || currentPhoto ? (
          <>
            <img src={preview || currentPhoto} alt="Uploaded photo" className="uploaded-image-circle" />
            <div className="image-overlay-circle">
              <button type="button" className="delete-photo-btn" onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}>
                <SvgIcn Name="trash" />
              </button>

            <button type="button" className="change-photo-btn" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current.click(); // Open the file uploader
              }}>
                <SvgIcn Name="image" />
              </button>
              {/* Change */}
            </div>
          </>
        ) : (
          <div className="photo-placeholder-circle">
            <SvgIcn Name="camera" />
            {/* <div className="upload-text">Upload Photo</div> */}
          </div>
        )}
      </div>

      <Popup
        isOpen={showCropper}
        onClose={handleCropCancel}
        className="cropper-popup"
      >
        <div className="cropper-area">
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round"
          />
        </div>
        
        <div className="cropper-controls">
          <div className="zoom-control">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="cropper-actions">
            {/* <Button onClick={handleCropCancel}>Cancel</Button> */}
            <Button onClick={handleCropSave} className="sec" iconR="image" hoverR="ok">Save</Button>
          </div>
        </div>
      </Popup>
    </>
  );
});

export default PhotoUploader;