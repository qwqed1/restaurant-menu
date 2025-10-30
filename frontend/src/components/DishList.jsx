import React from 'react';
import DishCard from './DishCard';

const DishList = ({ dishes, onViewDish }) => {
  return (
    <div className="px-6 py-4">
      <div className="space-y-0">
        {dishes.map((dish, index) => (
          <DishCard 
            key={dish.id} 
            dish={dish} 
            onViewDetails={onViewDish}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default DishList;
