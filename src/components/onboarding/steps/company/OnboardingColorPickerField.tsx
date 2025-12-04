
import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { X, Plus } from 'lucide-react';

interface OnboardingColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
}

// Cores predefinidas (swatches)
const predefinedSwatches = [
  "#000000", "#1EAEDB", "#10B981", "#F59E0B", "#EF4444",
  "#3B82F6", "#8B5CF6", "#6366F1", "#EC4899"
];

const OnboardingColorPickerField: React.FC<OnboardingColorPickerFieldProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(200); // Hue em graus (0-360)
  const [saturation, setSaturation] = useState(100); // Saturation em % (0-100)
  const [lightness, setLightness] = useState(50); // Lightness em % (0-100)
  const [opacity, setOpacity] = useState(100); // Opacity em % (0-100)
  const [activeTab, setActiveTab] = useState<'grid' | 'spectrum' | 'sliders'>('grid');
  
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Converter HSL para HEX
  const hslToHex = (h: number, s: number, l: number, a: number = 100): string => {
    l /= 100;
    const a2 = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    const hex = `#${f(0)}${f(8)}${f(4)}`;
    return a < 100 ? `${hex}${Math.round((a / 100) * 255).toString(16).padStart(2, '0')}` : hex;
  };

  // Converter HEX para HSL
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const isUpdatingFromHSL = useRef(false);

  // Atualizar HSL quando o valor HEX muda (externamente)
  useEffect(() => {
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value) && !isUpdatingFromHSL.current) {
      const hsl = hexToHsl(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
    isUpdatingFromHSL.current = false;
  }, [value]);

  // Atualizar HEX quando HSL muda
  useEffect(() => {
    const newHex = hslToHex(hue, saturation, lightness, opacity);
    if (newHex !== value && /^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      isUpdatingFromHSL.current = true;
      onChange(newHex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness, opacity]);

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    // Primeira linha (10%): escala de cinza
    if (y <= 0.1) {
      const gray = Math.round(x * 100);
      setHue(0);
      setSaturation(0);
      setLightness(gray);
    } else {
      // Resto do grid (90%): cores com hue e saturation
      const adjustedY = (y - 0.1) / 0.9; // Normalizar para 0-1
      const newHue = Math.round(x * 360);
      const newSaturation = Math.round((1 - adjustedY) * 100);
      setHue(newHue);
      setSaturation(newSaturation);
      // Lightness fixo em 50% para cores saturadas, ajustar baseado na posição vertical
      const lightnessValue = Math.round(50 + (adjustedY - 0.5) * 40); // Varia de 30% a 70%
      setLightness(Math.max(10, Math.min(90, lightnessValue)));
    }
  };

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      handleGridClick(e);
    }
  };

  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    handleGridClick(e);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSwatchSelect = (color: string) => {
    onChange(color);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^#[0-9A-Fa-f]{0,6}$/.test(newValue)) {
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        onChange(newValue);
      }
    }
  };

  const currentColor = value || "#1EAEDB";

  return (
    <div className="space-y-2">
      <Label htmlFor="companyColor" className="text-sm font-semibold text-gray-900">
        Cor principal
      </Label>
      <div className="flex items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              className="w-12 h-12 p-0 border-2 rounded-lg hover:scale-105 transition-transform shrink-0"
              style={{ 
                backgroundColor: currentColor,
                borderColor: currentColor === "#FFFFFF" || !currentColor ? "#E5E7EB" : currentColor 
              }}
            >
              <span className="sr-only">Escolher cor</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-0" align="start">
            <div className="bg-white rounded-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: currentColor }}
                  />
                  <h3 className="font-semibold text-gray-900">Colors</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                {(['grid', 'spectrum', 'sliders'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'grid' ? 'Grid' : tab === 'spectrum' ? 'Spectrum' : 'Sliders'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'grid' && (
                  <div className="space-y-4">
                    {/* Color Grid */}
                    <div
                      ref={gridRef}
                      className="w-full h-64 rounded-lg border border-gray-200 cursor-crosshair relative overflow-hidden"
                      onClick={handleGridClick}
                      onMouseMove={handleGridMouseMove}
                      onMouseDown={handleGridMouseDown}
                      onMouseUp={() => { isDragging.current = false; }}
                      onMouseLeave={() => { isDragging.current = false; }}
                    >
                      {/* Primeira linha: escala de cinza */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-[10%] z-10"
                        style={{
                          background: 'linear-gradient(to right, #000 0%, #404040 25%, #808080 50%, #C0C0C0 75%, #fff 100%)'
                        }}
                      />
                      
                      {/* Grid de cores - usando múltiplos gradientes */}
                      <div className="absolute top-[10%] left-0 right-0 bottom-0">
                        {/* Gradiente horizontal (hue) */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to right,
                              hsl(0, 100%, 50%) 0%,
                              hsl(30, 100%, 50%) 8.33%,
                              hsl(60, 100%, 50%) 16.66%,
                              hsl(90, 100%, 50%) 25%,
                              hsl(120, 100%, 50%) 33.33%,
                              hsl(150, 100%, 50%) 41.66%,
                              hsl(180, 100%, 50%) 50%,
                              hsl(210, 100%, 50%) 58.33%,
                              hsl(240, 100%, 50%) 66.66%,
                              hsl(270, 100%, 50%) 75%,
                              hsl(300, 100%, 50%) 83.33%,
                              hsl(330, 100%, 50%) 91.66%,
                              hsl(360, 100%, 50%) 100%
                            )`
                          }}
                        />
                        {/* Overlay vertical (saturation e lightness) */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to bottom,
                              rgba(255, 255, 255, 0) 0%,
                              rgba(255, 255, 255, 0.5) 50%,
                              rgba(0, 0, 0, 0.5) 100%
                            )`
                          }}
                        />
                      </div>
                      
                      {/* Indicador de seleção */}
                      <div
                        className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none z-20"
                        style={{
                          left: saturation === 0 
                            ? `${(lightness / 100) * 100}%`
                            : `${(hue / 360) * 100}%`,
                          top: saturation === 0 
                            ? `${(lightness / 100) * 10}%`
                            : `${10 + ((100 - saturation) / 100) * 90}%`,
                          transform: 'translate(-50%, -50%)',
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
                          backgroundColor: saturation === 0 ? 'transparent' : 'transparent'
                        }}
                      />
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase">OPACITY</label>
                        <span className="text-xs text-gray-600">{opacity}%</span>
                      </div>
                      <div className="relative h-3 rounded-full overflow-hidden border border-gray-200"
                        style={{
                          background: `linear-gradient(to right, 
                            ${currentColor}00 0%, 
                            ${currentColor}FF 100%
                          )`
                        }}
                      >
                        <Slider
                          value={[opacity]}
                          onValueChange={(values) => setOpacity(values[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'spectrum' && (
                  <div className="space-y-4">
                    <div className="h-64 rounded-lg border border-gray-200 overflow-hidden"
                      style={{
                        background: `linear-gradient(to right, 
                          hsl(0, 100%, 50%) 0%,
                          hsl(60, 100%, 50%) 16.66%,
                          hsl(120, 100%, 50%) 33.33%,
                          hsl(180, 100%, 50%) 50%,
                          hsl(240, 100%, 50%) 66.66%,
                          hsl(300, 100%, 50%) 83.33%,
                          hsl(360, 100%, 50%) 100%
                        )`
                      }}
                    />
                  </div>
                )}

                {activeTab === 'sliders' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Hue</label>
                        <span className="text-xs text-gray-600">{hue}°</span>
                      </div>
                      <Slider
                        value={[hue]}
                        onValueChange={(values) => setHue(values[0])}
                        min={0}
                        max={360}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Saturation</label>
                        <span className="text-xs text-gray-600">{saturation}%</span>
                      </div>
                      <Slider
                        value={[saturation]}
                        onValueChange={(values) => setSaturation(values[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Lightness</label>
                        <span className="text-xs text-gray-600">{lightness}%</span>
                      </div>
                      <Slider
                        value={[lightness]}
                        onValueChange={(values) => setLightness(values[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                )}

                {/* Swatches */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border-2 border-gray-300 shrink-0"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div className="flex gap-1 flex-1">
                      {predefinedSwatches.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleSwatchSelect(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            currentColor === color 
                              ? 'border-gray-900 scale-110' 
                              : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-1">
          <Input
            type="text"
            id="companyColor"
            value={value || ""}
            onChange={handleTextChange}
            placeholder="#1EAEDB"
            className="h-10 font-mono text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Escolha a cor principal da sua marca
      </p>
    </div>
  );
};

export default OnboardingColorPickerField;
