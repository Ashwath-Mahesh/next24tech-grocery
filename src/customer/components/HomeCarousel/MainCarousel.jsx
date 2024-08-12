import React from 'react'
import { mainCarouselData } from './MainCarouselData';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { Height } from '@mui/icons-material';

const MainCarousel = () => {
     const items = mainCarouselData.map((item)=><img className='cursor-pointer'
role='presentation' src={item.image} alt="" style={{height:'560px', width:'100%'}}/>)

  return (
    
     <AliceCarousel
     items={items}
     disableButtonsControls
     autoPlay
     autoPlayInterval={1000}
     infinite
 />
  )
}

export default MainCarousel