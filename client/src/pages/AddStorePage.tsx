import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, ShoppingCart, Hammer, Pill, Smartphone, Store } from 'lucide-react';

const storeIcons = [
  { icon: ShoppingCart, name: 'ShoppingCart', label: 'Grocery Store' },
  { icon: Hammer, name: 'Hammer', label: 'Hardware Store' },
  { icon: Pill, name: 'Pill', label: 'Pharmacy' },
  { icon: Smartphone, name: 'Smartphone', label: 'Electronics' },
  { icon: Store, name: 'Store', label: 'General Store' },
];

const storeColors = [
  '#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A', '#FFC107',
  '#E91E63', '#3F51B5', '#009688', '#FF5722', '#795548', '#607D8B', '#CDDC39', '#FF6F00'
];

export function AddStorePage() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ShoppingCart');
  const [selectedColor, setSelectedColor] = useState(storeColors[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor
        })
      });

      if (response.ok) {
        navigate('/stores');
      } else {
        console.error('Failed to create store');
      }
    } catch (error) {
      console.error('Error creating store:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/stores')}
            className="rounded-full shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add New Store</h1>
        </div>

        <Card className="card-gradient card-rounded shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Create Your Store</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter store name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-rounded"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Choose Icon</Label>
                <div className="grid grid-cols-3 gap-3">
                  {storeIcons.map(({ icon: Icon, name: iconName, label }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        selectedIcon === iconName
                          ? 'border-primary bg-primary/20 scale-105'
                          : 'border-border hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Choose Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {storeColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full btn-rounded button-gradient text-white font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Store'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
