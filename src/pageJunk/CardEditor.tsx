import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import Draggable from "react-draggable";
import { Upload, Type, Image as ImageIcon, Download, Trash2, Move, X } from "lucide-react";
import Toast from "../components/Toast"; // Asumsi kamu punya komponen Toast

// --- Interfaces ---
interface TextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
}

interface ImageItem {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
}

// --- SUB-COMPONENT: Draggable Image (PENTING untuk fix error useRef) ---
// Memisahkan ini agar setiap item punya ref sendiri
const DraggableImageItem = ({
  item,
  onRemove,
  onResize,
}: {
  item: ImageItem;
  onRemove: (id: number) => void;
  onResize?: (id: number, newWidth: number) => void;
}) => {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" defaultPosition={{ x: item.x, y: item.y }}>
      <div ref={nodeRef} className="absolute group cursor-move inline-block">
        {/* Tombol Hapus (Muncul saat hover) */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
          onTouchStart={() => onRemove(item.id)} // Support touch delete
        >
          <X size={12} />
        </button>

        <img
          src={item.src}
          alt="decoration"
          className="rounded shadow-sm pointer-events-none select-none"
          style={{ width: `${item.width}px`, height: "auto" }}
          crossOrigin="anonymous" // PENTING: Agar bisa di-download html2canvas
        />
        
        {/* Simple Resize Handle (Pojok Kanan Bawah) */}
        {onResize && (
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize opacity-0 group-hover:opacity-100"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // Logic resize sederhana bisa ditambahkan di sini jika mau kompleks
                    // Untuk sekarang kita biarkan default width dulu
                }}
            />
        )}
      </div>
    </Draggable>
  );
};

// --- SUB-COMPONENT: Draggable Text ---
const DraggableTextItem = ({
  item,
  onRemove,
  onUpdate,
}: {
  item: TextItem;
  onRemove: (id: number) => void;
  onUpdate: (id: number, newText: string) => void;
}) => {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" defaultPosition={{ x: item.x, y: item.y }}>
      <div ref={nodeRef} className="absolute group cursor-move border border-transparent hover:border-dashed hover:border-blue-400 p-1">
        <button
          onClick={() => onRemove(item.id)}
          className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
        >
          <X size={12} />
        </button>
        
        {/* Content Editable untuk edit text langsung di canvas */}
        <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(item.id, e.currentTarget.textContent || "")}
            style={{
                fontSize: `${item.fontSize}px`,
                color: item.color,
                fontWeight: item.fontWeight as any,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
            }}
            className="outline-none whitespace-pre-wrap min-w-[20px]"
        >
            {item.text}
        </div>
      </div>
    </Draggable>
  );
};

// --- MAIN COMPONENT ---
const CardDesign: React.FC = () => {
  const [background, setBackground] = useState<string>("#1e293b"); // Default dark color
  const [bgImage, setBgImage] = useState<string | null>(null);
  
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  
  // State UI
  const [isSuccess, setIsSuccess] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  // 1. Upload Background
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. Add Sticker/Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages([
          ...uploadedImages,
          {
            id: Date.now(),
            src: reader.result as string,
            x: 50,
            y: 50,
            width: 100, // Default width
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value agar bisa upload file sama berulang
    e.target.value = ""; 
  };

  // 3. Add Text
  const addText = () => {
    setTextItems([
      ...textItems,
      {
        id: Date.now(),
        text: "Double click to edit",
        x: 100,
        y: 100,
        fontSize: 24,
        color: "#ffffff",
        fontWeight: "bold",
      },
    ]);
  };

  // 4. Update Text Content
  const updateTextContent = (id: number, newText: string) => {
      setTextItems(items => items.map(item => item.id === id ? {...item, text: newText} : item));
  };

  // 5. Remove Items
  const removeImage = (id: number) => setUploadedImages(prev => prev.filter(img => img.id !== id));
  const removeText = (id: number) => setTextItems(prev => prev.filter(txt => txt.id !== id));

  // 6. Download Logic (Updated)
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
        setToastMessage("Generating image...");
        // Tunggu sebentar untuk memastikan render
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(canvasRef.current, {
            useCORS: true, // Wajib untuk gambar dari URL eksternal
            scale: 2, // Resolusi tinggi (Retina)
            backgroundColor: null, // Transparan background handling
            logging: false,
            allowTaint: true, 
        });

        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, `my-card-design-${Date.now()}.png`);
                setToastMessage("Design saved successfully!");
                setIsSuccess(true);
            }
        });
    } catch (error) {
        console.error("Download failed:", error);
        setToastMessage("Failed to save image");
        setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-6">
      
      {/* --- KOLOM KIRI: TOOLS --- */}
      <div className="w-full lg:w-80 flex flex-col gap-6 h-fit sticky top-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Card Designer
        </h1>

        {/* 1. Background Settings */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <ImageIcon size={18} /> Background
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-xs text-gray-400">Color</label>
                <input 
                    type="color" 
                    value={background}
                    onChange={(e) => { setBackground(e.target.value); setBgImage(null); }}
                    className="w-full h-10 rounded cursor-pointer bg-transparent"
                />
            </div>
            <div>
                <label className="text-xs text-gray-400">Image</label>
                <label className="flex items-center justify-center w-full h-10 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors">
                    <Upload size={16} />
                    <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                </label>
            </div>
          </div>
        </div>

        {/* 2. Add Elements */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <Move size={18} /> Add Elements
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={addText}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-medium transition-colors"
            >
                <Type size={18} /> Text
            </button>
            <label className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-medium cursor-pointer transition-colors">
                <ImageIcon size={18} /> Sticker
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* 3. Actions */}
        <button
            onClick={handleDownload}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
            <Download size={20} /> Export Card
        </button>

        <div className="text-xs text-gray-500 text-center">
            * Drag elements to move.<br/>* Hover element to delete.
        </div>
      </div>


      {/* --- KOLOM KANAN: CANVAS PREVIEW --- */}
      <div className="flex-1 bg-gray-950 rounded-3xl border-2 border-dashed border-gray-800 flex items-center justify-center p-8 overflow-hidden min-h-[600px] relative">
        
        {/* SCALING WRAPPER: Agar canvas besar muat di layar kecil */}
        <div className="transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] xl:scale-100 origin-center transition-transform duration-300">
            
            {/* CANVAS UTAMA: Ini yang di-capture oleh html2canvas */}
            <div
                ref={canvasRef}
                className="relative shadow-2xl overflow-hidden bg-white"
                style={{
                    width: "800px",  // Ukuran tetap (Resolusi standar)
                    height: "600px",
                    backgroundColor: background,
                    backgroundImage: bgImage ? `url(${bgImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay Pattern (Optional Gimmick) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                {/* Render Uploaded Images */}
                {uploadedImages.map((img) => (
                    <DraggableImageItem 
                        key={img.id} 
                        item={img} 
                        onRemove={removeImage} 
                    />
                ))}

                {/* Render Text Items */}
                {textItems.map((txt) => (
                    <DraggableTextItem 
                        key={txt.id} 
                        item={txt} 
                        onRemove={removeText}
                        onUpdate={updateTextContent}
                    />
                ))}

                {/* Watermark (Optional) */}
                <div className="absolute bottom-4 right-4 text-white/30 font-bold text-sm pointer-events-none select-none">
                    Polaris Idoly Designer
                </div>

            </div>

        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          isSuccess={isSuccess}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
};

export default CardDesign;