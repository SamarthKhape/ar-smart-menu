import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Share2, Copy, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrCode() {
  const { user } = useStore();
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Create dynamic URL based on current origin
  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/menu/${user?.id || 'demo'}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a new canvas for the branded image
    const brandedCanvas = document.createElement('canvas');
    const ctx = brandedCanvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions (500x750 for a nice portrait card)
    brandedCanvas.width = 500;
    brandedCanvas.height = 750;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 500, 750);

    // Header Branding
    ctx.fillStyle = '#F59E0B'; // Gold
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AR SMART MENU', 250, 80);

    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillText('Scan this for Menu Card', 250, 130);

    // Draw QR Code in the middle
    // Calculate position to center 300x300 QR
    const qrSize = 320;
    const qrX = (500 - qrSize) / 2;
    const qrY = 180;

    // Draw a white background for the QR
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
    ctx.fill();

    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

    // Footer - Restaurant Name
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.fillText(user?.restaurantName || 'Our Restaurant', 250, 620);

    // Mini Footer
    ctx.fillStyle = '#666666';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('Powered by AR Smart Menu', 250, 700);

    // Download the result
    const pngUrl = brandedCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${user?.restaurantName?.replace(/\s+/g, '_').toLowerCase() || 'menu'}_branded_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">QR Code Generator</h1>
        <p className="text-gray-400 mt-2">Generate and print QR codes for your restaurant tables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-hover" />
            
            <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-primary/20 mb-6" ref={qrRef}>
              <QRCodeCanvas 
                value={menuUrl}
                size={256}
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                level="H"
                includeMargin={false}
              />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{user?.restaurantName}</h3>
            <p className="text-gray-400 mb-8">Scan to view our digital menu</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={downloadQR}>
                <Download className="h-5 w-5 mr-2" />
                Download PNG
              </Button>
              <Button variant="secondary" onClick={handlePrint}>
                <Printer className="h-5 w-5 mr-2" />
                Print
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="p-6 border-l-4 border-l-primary">
            <h3 className="text-lg font-bold text-white mb-2">Instructions</h3>
            <p className="text-gray-400 mb-4">
              Print this QR code and place it on your restaurant tables. Customers can scan it with their phone camera to instantly view your digital menu without downloading any app.
            </p>
            <div className="flex items-center gap-3 mt-4 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-primary">1</div>
              <p>Download the high-resolution QR code</p>
            </div>
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-primary">2</div>
              <p>Print on table tents or stickers</p>
            </div>
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-primary">3</div>
              <p>Place on all tables in your restaurant</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Share Menu Link</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm text-gray-300 truncate">
                {menuUrl}
              </div>
              <Button variant="secondary" className="shrink-0" onClick={copyLink}>
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </Button>
              <Button variant="secondary" className="shrink-0" onClick={() => window.open(menuUrl, '_blank')}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
