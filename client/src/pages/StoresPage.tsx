import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store } from '@/types';
import { Plus, Store as StoreIcon, ShoppingCart, Hammer, Pill, Smartphone } from 'lucide-react';

const storeIconMap = {
  ShoppingCart,
  Hammer,
  Pill,
  Smartphone,
  StoreIcon,
};

export function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const handleStoreClick = (store: Store) => {
    navigate(`/store/${store.id}`);
  };

  return (
    <div className="min-h-screen pb-20 gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Stores</h1>
          <Button 
            onClick={() => navigate('/store/new')}
            className="btn-rounded button-gradient text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Store
          </Button>
        </div>

        {stores.length === 0 ? (
          <Card className="card-gradient card-rounded shadow-2xl">
            <CardContent className="p-8 text-center">
              <StoreIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4 font-medium">No stores added yet</p>
              <Button 
                onClick={() => navigate('/store/new')}
                className="btn-rounded button-gradient text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => {
              const IconComponent = storeIconMap[store.icon as keyof typeof storeIconMap] || StoreIcon;
              
              return (
                <Card
                  key={store.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 card-gradient card-rounded"
                  onClick={() => handleStoreClick(store)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: store.color }}
                      >
                        {store.image_url ? (
                          <img 
                            src={store.image_url} 
                            alt={store.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <IconComponent className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-foreground font-bold">{store.name}</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
