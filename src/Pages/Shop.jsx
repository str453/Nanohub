/* 
Functional Requirement #1 - Home Page
*/

import React from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import Splurge from '../Components/Splurge/Splurge.jsx'
import NewsLetter from '../Components/NewsLetter/NewsLetter.jsx'

export const Shop = () => {
  return (
    <div>
      <Hero/>
      <Popular/>
      <Offers/>
      <Splurge/>
      <NewsLetter/>
    </div>
  )
}

export default Shop