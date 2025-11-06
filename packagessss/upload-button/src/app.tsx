import { UploadButton } from '../lib/UploadButton'
export function App() {


  return (
    <>
      <UploadButton setChildrenContainer={(ele) => console.log('Container element:', ele)} onFileChosed={(files) => console.log('Files chosen:', files)}></UploadButton>
    </>
  )
}
