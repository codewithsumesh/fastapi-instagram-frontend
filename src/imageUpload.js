import { useState } from "react";
import Button from '@material-ui/core/Button';
import './imageUpload.css'

const BASE_URL = 'https://fastapi-instagram-backend-1.onrender.com'

function ImageUpload({authToken,authTokenType,userId}){    //{}passes props
const [caption,setCaption]= useState('');
const [image,setImage]= useState(null);

const handleChange =(e)=>{
    if (e.target.files[0]){  //user selects file
        setImage(e.target.files[0])
    }
  }
const handleUpload =(e)=>{
    e?.preventDefault();
    const formData = new FormData();
    formData.append('image',image)

    const requestOption ={
        method: 'POST',
        headers: new Headers({
            'Authorization':authTokenType + ' ' + authToken
        }),
        body:formData
    }

    fetch(BASE_URL+ 'post/image',requestOption)
    .then(response =>{
        if(response.ok){
            return response.json()
        }
    })
    .then(data =>{
        console.log(data)
        console.log(data.filename)
        createPost(data.filename)  //passing below as imageUrl
        
    })
    .catch(error=>{
        console.log(error);
    })
    .finally(()=>{  //() runs no matter what
        setCaption('')
        setImage(null)
        document.getElementById('fileInput').value =null   //selected image file cleared from react state
    })
}
    
    const createPost= (imageUrl)=>{     //data.filename
        const json_string = JSON.stringify({
            'image_url': imageUrl,
            'image_url_type': 'relative',
            'caption':caption,
            'creator_id': userId
        })
        const requestOption ={
        method: 'POST',
        headers: new Headers({
            'Authorization':authTokenType + ' ' + authToken,  //space required
            'Content-Type':'application/json'
        }),
        body:json_string
    }
        fetch (BASE_URL + 'post',requestOption)
        .then(respone =>{
            if(respone.ok){
                return respone.json()
            }
            throw respone
        })
        .then(data=>{
            window.location.reload()
            window.scrollTo(0,0)
        })
        .catch(error =>{
            console.log(error);
        })
}
    return(
        <div className="imageupload">
            <input
            type="text"
            placeholder="Enter a caption"
            onChange={(event)=> setCaption(event.target.value)}
            value={caption}
            />
            <input
            type="file"
            id="fileInput"
            onChange={handleChange}
            />
            <Button className ="imageupload_button" onClick={handleUpload}>Upload</Button>
        </div>
    )
}

export default ImageUpload