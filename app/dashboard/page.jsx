import {UserButton} from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'

function Dashboard() {
  return (
    <div>
        <div className='p=10'>

        <h2 className='font-bold text-2xl mt-10 '>Dashboard</h2>
        <h2 className='text-gray-500'>Create and Start your AI MockMate Interview</h2>



        <div className='grid gird-cols-1 md:grid-cols-3 my-5'>
          <AddNewInterview/>
        </div>
        </div>
    </div>
  )
}

export default Dashboard