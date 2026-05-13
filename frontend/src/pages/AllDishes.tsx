import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Filter, Edit2, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AllDishes() {
  const { dishes, deleteDish } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">All Dishes</h1>
          <p className="text-gray-400 mt-2">Manage your restaurant's menu items.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/dishes/add')} className="shrink-0">
          <Plus className="h-5 w-5 mr-2" />
          Add New Dish
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={<Search className="h-5 w-5" />}
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-primary text-black' 
                  : 'bg-surface border border-border text-gray-300 hover:bg-surface/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredDishes.map((dish) => (
            <motion.div
              key={dish.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-0 overflow-hidden flex flex-col h-full group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={dish.imageUrl} 
                    alt={dish.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:text-primary transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteDish(dish.id)}
                      className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{dish.name}</h3>
                    <span className="text-primary font-bold">₹{dish.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{dish.description}</p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-border text-gray-300">
                      {dish.category}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
            <Filter className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white">No dishes found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
