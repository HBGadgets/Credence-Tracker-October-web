import React from 'react'
import './loader2.css' // Import CSS for animation
import loaderImage from '../../assets/credenceLoader/Creadence_logo_png.png' // Update the path to your image

const Loader = () => {
  return (
    <div className="loader-container">
      <img src={loaderImage} alt="Loading..." className="loader-image" />
    </div>
  )
}

export default Loader
