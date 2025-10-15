import React from 'react'
import { Link } from 'react-router-dom'

function PageNotFound() {

  const links = [
    { name: "Home", url: "/" },
    { name: "Matches", url: "/matches" },
    { name: "Messages", url: "/messages" },
  ];
  return (
   <main className='text-center mt-4'>
    <h1 className='text-2xl font-bold'>Sorry, this page isn't available.</h1>
    <p className='mt-5'>The link you followed may be broken, or the page may have been removed. <a href="/" className='text-blue-900 font-semibold '>Go Back to AuraMeet</a> </p>
    <div className="mt-6">
      {links.map((link , index ) => (
        <Link key={index} to={link.url} className="text-blue-900 hover:underline mt-7 mx-2">{link.name}</Link>
      )
      )}
    </div>
    <div className="copyright">
      <p className="text-sm text-gray-500 mt-10">&copy; {new Date().getFullYear()} AuraMeet. All rights reserved.</p>
    </div>
   </main>
  )
}

export default PageNotFound