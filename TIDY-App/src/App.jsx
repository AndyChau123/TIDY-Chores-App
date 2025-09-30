import { useState } from 'react'
import './App.css'
import AddMember from "./Add-Member-Component/AddMember.jsx"
import ChoreList from './Chore-List-Component/ChoreList.jsx'

function App() {


  return (
    <>
      <AddMember />
      <ChoreList />
    </>
  )
}

export default App
