import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadImage = trpc.manage.uploadImage.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Strip data URL prefix to get raw base64
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadImage.mutateAsync({
        filename: file.name,
        base64,
        contentType: file.type,
      });

      onChange(result.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-slate-500 text-xs font-medium">{label}</label>
      
      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-xs h-32 object-cover rounded-lg border border-slate-200"
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload area */}
      <div className="flex gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-cyan-600/10 text-cyan-700 border border-cyan-600/20 hover:bg-cyan-600/20"
        >
          {uploading ? (
            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading...</>
          ) : (
            <><Upload className="h-3 w-3 mr-1" /> Upload Image</>
          )}
        </Button>
        <span className="text-slate-400 text-xs">or</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL..."
          className="bg-white/80 border-slate-200 text-slate-800 text-sm flex-1"
        />
      </div>

      {!value && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500/30 transition-colors"
        >
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Click to upload or drag & drop</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}
    </div>
  );
}
