import React from 'react';
import { Brain, Globe, Building, FlaskRound as Flask, LineChart, Calculator } from 'lucide-react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelectCategory }) => {
  // Fallback to default categories if the API doesn't return any
  const displayCategories = categories.length > 0 ? categories : [
    { id: 'science', name: 'Science', description: 'Scientific facts and discoveries', icon: 'flask' },
    { id: 'geography', name: 'Geography', description: 'Countries, cities, and landmarks', icon: 'globe' },
    { id: 'economics', name: 'Economics', description: 'Markets, finance, and economic data', icon: 'lineChart' },
    { id: 'misc', name: 'Miscellaneous', description: 'Various interesting numerical facts', icon: 'brain' }
  ];

  const getIconComponent = (iconName: string) => {
    switch(iconName.toLowerCase()) {
      case 'brain': return <Brain size={24} />;
      case 'globe': return <Globe size={24} />;
      case 'building': return <Building size={24} />;
      case 'flask': return <Flask size={24} />;
      case 'linechart': return <LineChart size={24} />;
      default: return <Calculator size={24} />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-center">Select a Category</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center hover:border-primary-300 dark:hover:border-primary-700 border border-transparent"
          >
            <div className="mb-3 text-primary-600 dark:text-primary-400">
              {getIconComponent(category.icon)}
            </div>
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {category.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;