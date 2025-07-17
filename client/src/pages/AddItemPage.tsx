import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Camera, Upload } from 'lucide-react';

export function AddItemPage() {
  const { roomId, groupId } = useParams<{ roomId?: string; groupId?: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const endpoint = groupId 
        ? `/api/groups/${groupId}/items`
        : `/api/rooms/${roomId}/items`;
      
      const payload = {
        name: name.trim(),
        quantity: parseInt(quantity) || 1,
        unit: unit.trim() || null,
        tags: tags.trim() || null,
        image_url: imageUrl.trim() || null,
        ...(roomId && { room_id: parseInt(roomId) })
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate(groupId ? `/group/${groupId}` : `/room/${roomId}`);
      } else {
        console.error('Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(groupId ? `/group/${groupId}` : `/room/${roomId}`);
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handleGoBack}
            className="rounded-full shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add New Item</h1>
        </div>

        <Card className="card-gradient card-rounded shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Create Your Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-rounded"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    type="text"
                    placeholder="pieces, kg, liters..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input-rounded"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  type="text"
                  placeholder="food, kitchen, organic..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input-rounded"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-rounded"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 btn-rounded bg-card-gradient"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 btn-rounded bg-card-gradient"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full btn-rounded button-gradient text-white font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Item'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
