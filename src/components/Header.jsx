import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../assets/logo.png'

function Header() {
  return (
    <header className=" text-black p-4 shadow-md border-b border-gray-200 flex">
      <h1 className='text-xl font-bold'>AuraMeet</h1>
    </header>
  )
}

export default Header