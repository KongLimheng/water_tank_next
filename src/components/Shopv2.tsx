'use client';

import React from 'react';
import { Hero } from './Hero';

const Shop: React.FC = () => {
  return (
    <>
      <Hero />

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"> */}
      {/* Header */}
      {/* <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isFiltering && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeBrand === 'grown'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {activeBrand} Series
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {getPageTitle()}
            </h2>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {isGridLoading
              ? 'Loading...'
              : `Showing ${visibleProducts.length} results`}
          </div>
        </div> */}

      {/* Category Tabs */}
      {/* {isFiltering && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-3">
                <CategoryButton
                  isActive={activeCategory === 'all'}
                  onClick={() => handleCategoryChange('all')}
                  label="All Categories"
                />

                {isCatsLoading ? (
                  <div className="flex items-center gap-2 px-4 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </div>
                ) : (
                  categories.map((cat) => (
                    <CategoryButton
                      key={cat.id}
                      isActive={activeCategory === cat.slug}
                      onClick={() => handleCategoryChange(cat.slug)}
                      label={cat.displayName || cat.name}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )} */}

      {/* </div> */}
    </>
  )
}

export default Shop
