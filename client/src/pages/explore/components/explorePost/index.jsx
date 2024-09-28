import React from 'react'
import ExploreHeader from '../exploreHeader'
import ExploreContent from '../exploreContent'

const ExplorePost = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-full bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <ExploreHeader />
      <div className="flex-1 overflow-y-auto">
        <ExploreContent />
      </div>
    </div>
  )
}

export default ExplorePost