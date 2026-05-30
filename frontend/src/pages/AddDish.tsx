import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

export default function AddDish() {
  const navigate = useNavigate();
  const addDish = useStore(state => state.addDish);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Mains',
    description: '',
    is_bestseller: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadStatus('Compressing image...');
    try {
      // Compress the image significantly to reduce upload time
      const options = {
        maxSizeMB: 0.05, // 50KB limit for aggressive thumbnail compression
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      setUploadStatus('Uploading to server...');
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `dishes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dish-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('dish-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a dish image");
      return;
    }

    setIsLoading(true);
    
    try {
      const imageUrl = await uploadImage(selectedFile);

      await addDish({
        ...formData,
        price: parseFloat(formData.price) || 0,
        imageUrl: imageUrl,
      });

      navigate('/dashboard/dishes');
    } catch (err: any) {
      console.error(err);
      // alert already shown in uploadImage if it fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Add New Dish</h1>
        <p className="text-gray-400 mt-2">Create a new item for your digital menu.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Dish Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface/50 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                ) : null}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <h4 className="text-gray-200 font-medium mb-1 drop-shadow-md">
                    {isUploading ? uploadStatus : (previewUrl ? 'Change image' : 'Click to upload image')}
                  </h4>
                  <p className="text-gray-400 text-sm drop-shadow-md">PNG, JPG, WEBP up to 5MB</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Dish Name"
                placeholder="e.g. Truffle Pasta"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Price (₹)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select 
                  className="flex h-11 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Famous Pick / Bestseller</label>
                <div className="flex h-11 items-center px-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.is_bestseller}
                      onChange={e => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                    <span className="ml-3 text-sm font-medium text-gray-400">Mark as highly recommended</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-gray-100 transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent resize-y"
                placeholder="Describe the ingredients and preparation..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/dishes')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading || isUploading} className="min-w-[140px]">
                Save Dish
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
